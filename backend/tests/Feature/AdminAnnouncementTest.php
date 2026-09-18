<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use App\Notifications\AnnouncementNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminAnnouncementTest extends TestCase
{
    use RefreshDatabase;

    private function memberUser(string $email): User
    {
        $user = User::factory()->create(['role' => User::ROLE_MEMBER, 'email' => $email]);
        Member::create([
            'user_id' => $user->id,
            'nom' => 'Test',
            'prenoms' => 'Membre',
            'telephone' => '0700000000',
            'email' => $email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
        ]);

        return $user;
    }

    public function test_admin_can_broadcast_an_announcement_to_all_members(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $memberA = $this->memberUser('a@example.com');
        $memberB = $this->memberUser('b@example.com');
        // Non-membre : ne doit rien recevoir.
        User::factory()->create(['role' => User::ROLE_STAFF, 'email' => 'staff@example.com']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/announcements', [
            'title' => 'Réunion générale',
            'message' => 'Rendez-vous samedi 10h au siège pour la réunion trimestrielle.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Réunion générale')
            ->assertJsonPath('data.recipients_count', 2);

        $this->assertDatabaseHas('announcements', [
            'title' => 'Réunion générale',
            'recipients_count' => 2,
        ]);

        Notification::assertSentTo([$memberA, $memberB], AnnouncementNotification::class);
    }

    public function test_a_member_cannot_send_announcements(): void
    {
        $member = $this->memberUser('member@example.com');

        $response = $this->actingAs($member, 'sanctum')->postJson('/api/admin/announcements', [
            'title' => 'x',
            'message' => 'y',
        ]);

        $response->assertStatus(403);
    }
}
