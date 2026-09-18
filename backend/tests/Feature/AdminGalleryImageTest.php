<?php

namespace Tests\Feature;

use App\Models\GalleryImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminGalleryImageTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_update_and_delete_a_gallery_image(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $create = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/gallery', [
            'caption' => 'Distribution de kits scolaires',
            'category' => 'actions',
            'is_featured' => true,
            'image' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $create->assertCreated()->assertJsonPath('data.category', 'actions');
        $this->assertNotNull($create->json('data.url'));
        $id = $create->json('data.id');

        $update = $this->actingAs($admin, 'sanctum')->postJson("/api/admin/gallery/{$id}", [
            '_method' => 'PUT',
            'caption' => 'Distribution de kits scolaires 2026',
            'category' => 'ecoles',
        ]);
        $update->assertOk()->assertJsonPath('data.category', 'ecoles');

        $delete = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/gallery/{$id}");
        $delete->assertOk();
        $this->assertDatabaseMissing('gallery_images', ['id' => $id]);
    }

    public function test_public_endpoint_only_returns_active_images_and_supports_featured_filter(): void
    {
        GalleryImage::create(['image_path' => 'gallery/a.jpg', 'category' => 'actions', 'is_active' => true, 'is_featured' => true]);
        GalleryImage::create(['image_path' => 'gallery/b.jpg', 'category' => 'actions', 'is_active' => true, 'is_featured' => false]);
        GalleryImage::create(['image_path' => 'gallery/c.jpg', 'category' => 'actions', 'is_active' => false, 'is_featured' => true]);

        $all = $this->getJson('/api/gallery');
        $all->assertOk();
        $this->assertCount(2, $all->json('data'));

        $featured = $this->getJson('/api/gallery?featured=1');
        $featured->assertOk();
        $this->assertCount(1, $featured->json('data'));
    }

    public function test_creating_a_gallery_image_requires_a_file(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/gallery', ['category' => 'actions'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('image');
    }
}
