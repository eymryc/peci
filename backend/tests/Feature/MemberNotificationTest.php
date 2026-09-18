<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\Member;
use App\Models\User;
use App\Notifications\AnnouncementNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unread_count_reflects_database_notifications_and_updates_after_marking_read(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        Member::create([
            'user_id' => $user->id,
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => $user->email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
        ]);

        $this->actingAs($user, 'sanctum')->getJson('/api/member/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 0);

        $announcement = Announcement::create(['title' => 'Réunion', 'message' => 'Détails', 'recipients_count' => 1]);
        $user->notify(new AnnouncementNotification($announcement));

        $this->actingAs($user, 'sanctum')->getJson('/api/member/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 1);

        $notificationId = $user->notifications()->first()->id;
        $this->actingAs($user, 'sanctum')->postJson("/api/member/notifications/{$notificationId}/read")->assertOk();

        $this->actingAs($user, 'sanctum')->getJson('/api/member/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 0);
    }
}
