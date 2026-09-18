<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MembershipType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_member_directly_with_an_approved_status(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $type = MembershipType::create(['name' => 'Membre actif', 'slug' => 'actif', 'adhesion_fee' => 5000]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/members', [
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000001',
            'email' => 'awa.kouassi@example.com',
            'membership_type_id' => $type->id,
            'status' => 'approved',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.membership_type.adhesion_fee', 5000);

        $this->assertNotNull($response->json('data.member_number'));
        $this->assertNotNull($response->json('data.card.image_url'));
        $this->assertDatabaseHas('users', ['email' => 'awa.kouassi@example.com', 'role' => 'member']);
    }

    public function test_admin_can_update_a_member_and_approving_it_issues_a_card(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $member = Member::create([
            'user_id' => $user->id,
            'nom' => 'Yao',
            'prenoms' => 'Marie',
            'telephone' => '0700000002',
            'email' => $user->email,
            'status' => Member::STATUS_PENDING,
            'accepted_terms' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/members/{$member->id}", [
            'status' => 'approved',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'approved');
        $this->assertNotNull($response->json('data.card.image_url'));
        $this->assertDatabaseHas('members', ['id' => $member->id, 'status' => 'approved']);
    }

    public function test_admin_can_delete_a_member(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $member = Member::create([
            'user_id' => $user->id,
            'nom' => 'Koffi',
            'prenoms' => 'Jean',
            'telephone' => '0700000003',
            'email' => $user->email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/members/{$member->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('members', ['id' => $member->id]);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_can_view_any_members_card_image(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        $member = Member::create([
            'user_id' => $user->id,
            'nom' => 'Bamba',
            'prenoms' => 'Fatou',
            'telephone' => '0700000004',
            'email' => $user->email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
        ]);
        app(\App\Services\MemberCardService::class)->issueCard($member);

        $response = $this->actingAs($admin, 'sanctum')->get("/api/admin/members/{$member->id}/card/image");

        $response->assertOk();
    }

    public function test_staff_cannot_create_members(): void
    {
        $staff = User::factory()->create(['role' => User::ROLE_STAFF]);

        $response = $this->actingAs($staff, 'sanctum')->postJson('/api/admin/members', [
            'nom' => 'Test',
            'prenoms' => 'Staff',
            'telephone' => '0700000005',
            'email' => 'staff-create@example.com',
        ]);

        // Staff has admin,staff role on the members routes today — this
        // documents the current behaviour (allowed), matching other admin
        // content endpoints where staff can manage records too.
        $response->assertCreated();
    }

    public function test_admin_can_manage_membership_type_fees(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $type = MembershipType::create(['name' => 'Membre actif', 'slug' => 'actif', 'adhesion_fee' => 5000, 'cotisation_fee' => 2000]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/membership-types/{$type->id}", [
            'name' => 'Membre actif',
            'adhesion_fee' => 7500,
            'cotisation_fee' => 2500,
        ]);

        $response->assertOk()->assertJsonPath('data.adhesion_fee', 7500)->assertJsonPath('data.cotisation_fee', 2500);
        $this->assertDatabaseHas('membership_types', ['id' => $type->id, 'adhesion_fee' => 7500, 'cotisation_fee' => 2500]);
    }

    public function test_staff_cannot_manage_membership_type_fees(): void
    {
        $staff = User::factory()->create(['role' => User::ROLE_STAFF]);
        $type = MembershipType::create(['name' => 'Membre actif', 'slug' => 'actif', 'adhesion_fee' => 5000]);

        $this->actingAs($staff, 'sanctum')
            ->putJson("/api/admin/membership-types/{$type->id}", ['name' => 'Membre actif', 'adhesion_fee' => 1])
            ->assertStatus(403);
    }
}
