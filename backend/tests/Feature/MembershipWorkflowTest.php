<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MembershipWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_approval_generates_member_number_and_card_then_verifies_publicly(): void
    {
        Storage::fake('local');
        Notification::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $memberUser = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $member = Member::create([
            'user_id' => $memberUser->id,
            'nom' => 'Yao',
            'prenoms' => 'Marie',
            'telephone' => '0102030405',
            'email' => $memberUser->email,
            'status' => Member::STATUS_PENDING,
            'accepted_terms' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/memberships/{$member->id}/approve");

        $response->assertOk()
            ->assertJsonPath('data.status', Member::STATUS_APPROVED);

        $member->refresh();
        $this->assertNotNull($member->member_number);
        $this->assertStringStartsWith('PECI-'.now()->year.'-', $member->member_number);
        $this->assertNotNull($member->card);
        $this->assertTrue(Storage::disk('local')->exists($member->card->qr_code_path));
        $this->assertTrue(Storage::disk('local')->exists($member->card->image_path));
        $this->assertTrue(Storage::disk('local')->exists($member->card->pdf_path));

        // Le numéro doit rester unique même en cas de nouvelle approbation la même année.
        $secondUser = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $secondMember = Member::create([
            'user_id' => $secondUser->id,
            'nom' => 'Kone',
            'prenoms' => 'Ali',
            'telephone' => '0102030406',
            'email' => $secondUser->email,
            'status' => Member::STATUS_PENDING,
            'accepted_terms' => true,
        ]);
        $this->actingAs($admin, 'sanctum')->postJson("/api/admin/memberships/{$secondMember->id}/approve");
        $secondMember->refresh();
        $this->assertNotEquals($member->member_number, $secondMember->member_number);

        // Vérification publique (sans authentification) par numéro de membre.
        $verify = $this->getJson("/api/public/members/{$member->member_number}/verify");
        $verify->assertOk()
            ->assertJsonPath('data.state', 'VALID')
            ->assertJsonPath('data.valid', true)
            ->assertJsonPath('data.nom', 'Yao');
    }

    public function test_verify_returns_not_found_for_unknown_member_number(): void
    {
        $response = $this->getJson('/api/public/members/PECI-2026-999999/verify');

        $response->assertOk()
            ->assertJsonPath('data.state', 'NOT_FOUND')
            ->assertJsonPath('data.valid', false);
    }

    public function test_admin_can_reject_a_membership_with_a_reason(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $memberUser = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $member = Member::create([
            'user_id' => $memberUser->id,
            'nom' => 'Traore',
            'prenoms' => 'Ibrahim',
            'telephone' => '0102030407',
            'email' => $memberUser->email,
            'status' => Member::STATUS_PENDING,
            'accepted_terms' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/memberships/{$member->id}/reject", [
                'reason' => 'Dossier incomplet',
            ]);

        $response->assertOk()->assertJsonPath('data.status', Member::STATUS_REJECTED);
        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => Member::STATUS_REJECTED,
            'rejection_reason' => 'Dossier incomplet',
        ]);
    }

    public function test_a_member_cannot_access_admin_routes(): void
    {
        $memberUser = User::factory()->create(['role' => User::ROLE_MEMBER]);

        $response = $this->actingAs($memberUser, 'sanctum')->getJson('/api/admin/memberships/pending');

        $response->assertStatus(403);
    }
}
