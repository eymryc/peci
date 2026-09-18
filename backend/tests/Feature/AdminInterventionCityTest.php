<?php

namespace Tests\Feature;

use App\Models\InterventionCity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInterventionCityTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_update_and_delete_an_intervention_city(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $create = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/intervention-cities', [
            'name' => 'Bouaké',
        ]);
        $create->assertCreated()->assertJsonPath('data.slug', 'bouake');
        $id = $create->json('data.id');

        $update = $this->actingAs($admin, 'sanctum')->putJson("/api/admin/intervention-cities/{$id}", [
            'name' => 'Bouaké',
            'is_active' => false,
        ]);
        $update->assertOk()->assertJsonPath('data.is_active', false);

        $delete = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/intervention-cities/{$id}");
        $delete->assertOk();
        $this->assertDatabaseMissing('intervention_cities', ['id' => $id]);
    }

    public function test_inactive_cities_are_hidden_from_the_public_endpoint(): void
    {
        InterventionCity::create(['name' => 'Ville Active', 'slug' => 'ville-active', 'is_active' => true]);
        InterventionCity::create(['name' => 'Ville Inactive', 'slug' => 'ville-inactive', 'is_active' => false]);

        $response = $this->getJson('/api/public/regions');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Ville Active'));
        $this->assertFalse($names->contains('Ville Inactive'));
    }

    public function test_staff_can_manage_intervention_cities_like_other_content(): void
    {
        $staff = User::factory()->create(['role' => User::ROLE_STAFF]);

        $this->actingAs($staff, 'sanctum')
            ->postJson('/api/admin/intervention-cities', ['name' => 'Test'])
            ->assertCreated();
    }

    public function test_a_guest_cannot_manage_intervention_cities(): void
    {
        $this->postJson('/api/admin/intervention-cities', ['name' => 'Test'])
            ->assertStatus(401);
    }
}
