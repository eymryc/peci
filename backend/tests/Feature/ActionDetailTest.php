<?php

namespace Tests\Feature;

use App\Models\Action;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActionDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_view_a_single_action_by_slug(): void
    {
        $action = Action::create([
            'title' => 'Kits scolaires',
            'slug' => 'kits-scolaires',
            'category' => 'Éducation',
            'description' => 'Distribution de kits scolaires aux enfants dans le besoin.',
            'order' => 1,
        ]);

        $response = $this->getJson("/api/actions/{$action->slug}");

        $response->assertOk()
            ->assertJsonPath('data.title', 'Kits scolaires')
            ->assertJsonPath('data.slug', 'kits-scolaires');
    }

    public function test_unknown_action_slug_returns_404(): void
    {
        $response = $this->getJson('/api/actions/inconnu');

        $response->assertStatus(404);
    }
}
