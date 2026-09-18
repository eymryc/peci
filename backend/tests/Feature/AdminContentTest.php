<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_a_project(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $create = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/projects', [
            'title' => 'Kits scolaires 2026',
            'description' => 'Distribution de kits scolaires.',
            'status' => 'ongoing',
            'progress' => 10,
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ]);

        $create->assertCreated()->assertJsonPath('data.slug', 'kits-scolaires-2026');
        $this->assertNotNull($create->json('data.cover_image_url'));
        $projectId = $create->json('data.id');

        $update = $this->actingAs($admin, 'sanctum')->postJson("/api/admin/projects/{$projectId}", [
            '_method' => 'PUT',
            'progress' => 55,
        ]);
        $update->assertOk()->assertJsonPath('data.progress', 55);

        $delete = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/projects/{$projectId}");
        $delete->assertOk();
        $this->assertDatabaseMissing('projects', ['id' => $projectId]);
    }

    public function test_staff_can_manage_projects_but_not_settings(): void
    {
        $staff = User::factory()->create(['role' => User::ROLE_STAFF]);

        $this->actingAs($staff, 'sanctum')
            ->postJson('/api/admin/projects', [
                'title' => 'Projet staff',
                'description' => 'Description',
            ])->assertCreated();

        $this->actingAs($staff, 'sanctum')
            ->getJson('/api/admin/settings')
            ->assertStatus(403);
    }

    public function test_admin_can_update_settings_and_public_endpoint_reflects_the_change(): void
    {
        Setting::set('public_stat_children_supported', '2000', 'integer');
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $response = $this->actingAs($admin, 'sanctum')->putJson('/api/admin/settings', [
            'settings' => [
                ['key' => 'public_stat_children_supported', 'value' => '3000'],
            ],
        ]);

        $response->assertOk();

        $public = $this->getJson('/api/public/settings');
        $public->assertOk()->assertJsonPath('data.public_stat_children_supported', 3000);
    }

    public function test_admin_can_create_a_partner_and_it_appears_on_public_endpoint(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin, 'sanctum')->postJson('/api/admin/partners', [
            'name' => 'Fondation Test',
            'is_active' => true,
        ])->assertCreated();

        $public = $this->getJson('/api/partners');
        $public->assertOk();
        $this->assertContains('Fondation Test', collect($public->json('data'))->pluck('name'));
    }

    public function test_deleting_a_partner_removes_it(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $partner = Partner::create(['name' => 'À supprimer', 'is_active' => true]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/partners/{$partner->id}")
            ->assertOk();

        $this->assertDatabaseMissing('partners', ['id' => $partner->id]);
    }

    public function test_guests_cannot_access_admin_routes(): void
    {
        $this->getJson('/api/admin/projects')->assertStatus(401);
    }
}
