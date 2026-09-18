<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MembershipType;
use App\Models\User;
use App\Notifications\MembershipApprovedNotification;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MembershipTypeCardEligibilityTest extends TestCase
{
    use RefreshDatabase;

    private function pendingMember(int $membershipTypeId, string $email): Member
    {
        $user = User::factory()->create(['role' => User::ROLE_MEMBER, 'email' => $email]);

        return Member::create([
            'user_id' => $user->id,
            'membership_type_id' => $membershipTypeId,
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => $email,
            'status' => Member::STATUS_PENDING,
            'accepted_terms' => true,
        ]);
    }

    public function test_approving_a_paying_card_eligible_type_issues_a_card_but_does_not_confirm_adhesion(): void
    {
        Storage::fake('local');
        Notification::fake();

        $type = MembershipType::create(['name' => 'Membre actif', 'slug' => 'actif-elig', 'adhesion_fee' => 5000, 'card_eligible' => true]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $member = $this->pendingMember($type->id, 'actif@example.com');

        $this->actingAs($admin, 'sanctum')->postJson("/api/admin/memberships/{$member->id}/approve")->assertOk();

        $member->refresh();
        $this->assertNotNull($member->member_number);
        $this->assertNotNull($member->card);
        $this->assertNull($member->adhesion_confirmed_at);
    }

    public function test_approving_a_free_non_card_type_confirms_membership_immediately_without_a_card(): void
    {
        Storage::fake('local');
        Notification::fake();

        $type = MembershipType::create([
            'name' => 'Bénévole',
            'slug' => 'benevole-elig',
            'adhesion_fee' => 0,
            'cotisation_fee' => 0,
            'card_eligible' => false,
        ]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $member = $this->pendingMember($type->id, 'benevole@example.com');

        $this->actingAs($admin, 'sanctum')->postJson("/api/admin/memberships/{$member->id}/approve")->assertOk();

        $member->refresh();
        $this->assertNotNull($member->member_number);
        $this->assertNull($member->card);
        $this->assertNotNull($member->adhesion_confirmed_at);
    }

    public function test_admin_creating_a_member_directly_approved_with_a_free_type_confirms_adhesion_immediately(): void
    {
        Storage::fake('local');
        Notification::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $type = MembershipType::create([
            'name' => 'Bénévole',
            'slug' => 'benevole-store',
            'adhesion_fee' => 0,
            'cotisation_fee' => 0,
            'card_eligible' => false,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/members', [
            'nom' => 'Diabate',
            'prenoms' => 'Sekou',
            'telephone' => '0700000010',
            'email' => 'sekou.diabate@example.com',
            'membership_type_id' => $type->id,
            'status' => 'approved',
        ]);

        $response->assertCreated();
        $memberId = $response->json('data.id');
        $this->assertDatabaseHas('members', ['id' => $memberId, 'status' => 'approved']);
        $member = Member::find($memberId);
        $this->assertNotNull($member->adhesion_confirmed_at);
        $this->assertNull($member->card);

        // Régression : la notification envoyée juste après doit refléter
        // l'adhésion déjà confirmée (et non redemander un paiement), ce qui
        // suppose que l'instance $member notifiée est bien à jour en mémoire.
        // Ce type n'a pas droit à la carte/au kit : le mail ne doit ni
        // redemander un paiement, ni mentionner de kit.
        Notification::assertSentTo(
            $member->user,
            MembershipApprovedNotification::class,
            function ($notification) use ($member) {
                $lines = collect($notification->toMail($member->user)->introLines);

                return ! $lines->contains(fn ($line) => str_contains($line, 'régler votre droit'))
                    && ! $lines->contains(fn ($line) => str_contains($line, 'kit'));
            }
        );
    }

    public function test_kit_is_never_created_for_a_non_card_type_even_if_merchandise_items_is_misconfigured(): void
    {
        Storage::fake('local');

        $sentMessages = [];
        $this->app->bind(SmsGateway::class, function () use (&$sentMessages) {
            return new class($sentMessages) implements SmsGateway
            {
                public function __construct(private array &$sentMessages) {}

                public function send(string $phoneNumber, string $message): bool
                {
                    $this->sentMessages[] = $message;

                    return true;
                }
            };
        });

        // Un admin a rempli le champ "kit" par erreur pour un type qui n'y a
        // pas droit — la livraison ne doit jamais être créée pour autant.
        $type = MembershipType::create([
            'name' => 'Bénévole',
            'slug' => 'benevole-no-kit',
            'adhesion_fee' => 0,
            'cotisation_fee' => 0,
            'card_eligible' => false,
            'merchandise_items' => "Carte de membre\nCasquette\nT-shirt",
        ]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $member = $this->pendingMember($type->id, 'kit-test@example.com');

        $this->actingAs($admin, 'sanctum')->postJson("/api/admin/memberships/{$member->id}/approve")->assertOk();

        $this->assertDatabaseCount('member_merchandise_deliveries', 0);
        $this->assertNotEmpty($sentMessages);
        foreach ($sentMessages as $message) {
            $this->assertStringNotContainsString('kit', $message);
        }
    }

    public function test_member_certificate_pdf_is_refused_for_a_card_eligible_member(): void
    {
        $type = MembershipType::create(['name' => 'Membre actif', 'slug' => 'actif-cert', 'adhesion_fee' => 5000, 'card_eligible' => true]);
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        Member::create([
            'user_id' => $user->id,
            'membership_type_id' => $type->id,
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => $user->email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
            'member_number' => 'PECI-2026-000099',
        ]);

        $this->actingAs($user, 'sanctum')->getJson('/api/member/certificate/pdf')->assertStatus(404);
    }

    public function test_member_certificate_pdf_is_served_for_an_approved_non_card_member(): void
    {
        $type = MembershipType::create([
            'name' => 'Bénévole',
            'slug' => 'benevole-cert',
            'adhesion_fee' => 0,
            'cotisation_fee' => 0,
            'card_eligible' => false,
        ]);
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        Member::create([
            'user_id' => $user->id,
            'membership_type_id' => $type->id,
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => $user->email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
            'member_number' => 'PECI-2026-000098',
        ]);

        $response = $this->actingAs($user, 'sanctum')->get('/api/member/certificate/pdf');

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
    }
}
