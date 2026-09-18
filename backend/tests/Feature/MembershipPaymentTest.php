<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MembershipPayment;
use App\Models\MembershipType;
use App\Models\User;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function approvedMember(?int $membershipTypeId = null): Member
    {
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);

        return Member::create([
            'user_id' => $user->id,
            'membership_type_id' => $membershipTypeId,
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => $user->email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
            'joined_at' => now(),
            'expires_at' => now()->addYear(),
        ]);
    }

    public function test_member_can_declare_an_adhesion_payment_using_the_fee_of_their_membership_type(): void
    {
        $type = MembershipType::create(['name' => 'Membre actif', 'slug' => 'actif-test', 'adhesion_fee' => 5000]);
        $member = $this->approvedMember($type->id);

        $response = $this->actingAs($member->user, 'sanctum')->postJson('/api/member/payments', [
            'type' => 'adhesion',
            'method' => 'orange_money',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.type', 'adhesion')
            ->assertJsonPath('data.amount', 5000)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('membership_payments', [
            'member_id' => $member->id,
            'type' => MembershipPayment::TYPE_ADHESION,
            'amount' => 5000,
        ]);
    }

    public function test_member_can_declare_a_cotisation_payment_using_the_fee_of_their_membership_type(): void
    {
        $type = MembershipType::create(['name' => 'Membre bienfaiteur', 'slug' => 'bienfaiteur-test', 'adhesion_fee' => 15000, 'cotisation_fee' => 5000]);
        $member = $this->approvedMember($type->id);

        $response = $this->actingAs($member->user, 'sanctum')->postJson('/api/member/payments', [
            'type' => 'cotisation',
            'period' => now()->format('Y-m'),
            'method' => 'wave',
        ]);

        $response->assertCreated()->assertJsonPath('data.amount', 5000);
        $this->assertDatabaseHas('membership_payments', [
            'member_id' => $member->id,
            'type' => MembershipPayment::TYPE_COTISATION,
            'amount' => 5000,
        ]);
    }

    public function test_the_payments_index_returns_fees_matching_the_members_type(): void
    {
        $type = MembershipType::create(['name' => 'Membre actif', 'slug' => 'actif-fees-test', 'adhesion_fee' => 5000, 'cotisation_fee' => 2000]);
        $member = $this->approvedMember($type->id);

        $response = $this->actingAs($member->user, 'sanctum')->getJson('/api/member/payments');

        $response->assertOk()
            ->assertJsonPath('data.fees.adhesion', 5000)
            ->assertJsonPath('data.fees.cotisation', 2000);
    }

    public function test_member_cannot_declare_a_duplicate_adhesion_payment(): void
    {
        $member = $this->approvedMember();
        MembershipPayment::create([
            'member_id' => $member->id,
            'type' => MembershipPayment::TYPE_ADHESION,
            'amount' => 5000,
            'status' => MembershipPayment::STATUS_PENDING,
        ]);

        $response = $this->actingAs($member->user, 'sanctum')->postJson('/api/member/payments', [
            'type' => 'adhesion',
            'method' => 'wave',
        ]);

        $response->assertStatus(422);
    }

    public function test_member_cannot_declare_two_cotisations_for_the_same_month(): void
    {
        $member = $this->approvedMember();
        $period = now()->format('Y-m');

        $this->actingAs($member->user, 'sanctum')->postJson('/api/member/payments', [
            'type' => 'cotisation',
            'period' => $period,
            'method' => 'wave',
        ])->assertCreated();

        $response = $this->actingAs($member->user, 'sanctum')->postJson('/api/member/payments', [
            'type' => 'cotisation',
            'period' => $period,
            'method' => 'wave',
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_mark_a_pending_payment_as_paid(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $member = $this->approvedMember();
        $payment = MembershipPayment::create([
            'member_id' => $member->id,
            'type' => MembershipPayment::TYPE_COTISATION,
            'period' => now()->format('Y-m'),
            'amount' => 2000,
            'method' => 'wave',
            'status' => MembershipPayment::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/payments/{$payment->id}/mark-paid");

        $response->assertOk()->assertJsonPath('data.status', 'paid');
        $this->assertDatabaseHas('membership_payments', [
            'id' => $payment->id,
            'status' => MembershipPayment::STATUS_PAID,
        ]);
    }

    public function test_marking_an_adhesion_payment_paid_confirms_membership_and_prepares_the_merchandise_kit(): void
    {
        $sentTo = [];
        $this->app->bind(SmsGateway::class, function () use (&$sentTo) {
            return new class($sentTo) implements SmsGateway
            {
                public function __construct(private array &$sentTo) {}

                public function send(string $phoneNumber, string $message): bool
                {
                    $this->sentTo[] = $phoneNumber;

                    return true;
                }
            };
        });

        $type = MembershipType::create([
            'name' => 'Membre actif',
            'slug' => 'actif-kit-test',
            'adhesion_fee' => 5000,
            'merchandise_items' => "Carte de membre\nCasquette\nT-shirt",
        ]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $member = $this->approvedMember($type->id);
        $payment = MembershipPayment::create([
            'member_id' => $member->id,
            'type' => MembershipPayment::TYPE_ADHESION,
            'amount' => 5000,
            'status' => MembershipPayment::STATUS_PENDING,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/payments/{$payment->id}/mark-paid");

        $response->assertOk();
        $member->refresh();
        $this->assertNotNull($member->adhesion_confirmed_at);
        $this->assertDatabaseHas('member_merchandise_deliveries', ['member_id' => $member->id, 'item' => 'Carte de membre']);
        $this->assertDatabaseHas('member_merchandise_deliveries', ['member_id' => $member->id, 'item' => 'Casquette']);
        $this->assertDatabaseHas('member_merchandise_deliveries', ['member_id' => $member->id, 'item' => 'T-shirt']);
        $this->assertNotEmpty($sentTo, 'Le SMS de bienvenue aurait dû être envoyé.');
    }

    public function test_marking_a_cotisation_payment_paid_does_not_confirm_membership_again(): void
    {
        $member = $this->approvedMember();
        $payment = MembershipPayment::create([
            'member_id' => $member->id,
            'type' => MembershipPayment::TYPE_COTISATION,
            'period' => now()->format('Y-m'),
            'amount' => 2000,
            'status' => MembershipPayment::STATUS_PENDING,
        ]);

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->actingAs($admin, 'sanctum')->postJson("/api/admin/payments/{$payment->id}/mark-paid")->assertOk();

        $this->assertNull($member->fresh()->adhesion_confirmed_at);
    }

    public function test_a_member_cannot_mark_their_own_payment_as_paid(): void
    {
        $member = $this->approvedMember();
        $payment = MembershipPayment::create([
            'member_id' => $member->id,
            'type' => MembershipPayment::TYPE_COTISATION,
            'period' => now()->format('Y-m'),
            'amount' => 2000,
            'status' => MembershipPayment::STATUS_PENDING,
        ]);

        $response = $this->actingAs($member->user, 'sanctum')
            ->postJson("/api/admin/payments/{$payment->id}/mark-paid");

        $response->assertStatus(403);
    }
}
