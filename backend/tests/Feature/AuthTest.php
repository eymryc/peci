<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@peci.test',
            'password' => 'password123',
            'role' => User::ROLE_ADMIN,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@peci.test',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'admin')
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'admin@peci.test',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@peci.test',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_membership_registration_creates_a_pending_member_without_admin_access(): void
    {
        Storage::fake('local');

        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => 'awa@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'accepted_terms' => true,
            'photo' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', Member::STATUS_PENDING)
            ->assertJsonPath('data.member_number', null);

        $this->assertDatabaseHas('users', ['email' => 'awa@example.test', 'role' => User::ROLE_MEMBER]);
        $this->assertDatabaseHas('members', ['email' => 'awa@example.test', 'status' => Member::STATUS_PENDING]);
    }

    public function test_registration_requires_matching_password_confirmation(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => 'awa@example.test',
            'password' => 'password123',
            'password_confirmation' => 'different',
            'accepted_terms' => true,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_a_member_already_registered_cannot_register_again_with_the_same_phone_number(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        Member::create([
            'user_id' => $user->id,
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '+2250700000000',
            'email' => $user->email,
            'status' => Member::STATUS_APPROVED,
            'accepted_terms' => true,
        ]);

        // Même numéro, mais formaté différemment (tirets) et avec un autre email.
        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '+225-07-00-00-00-00',
            'email' => 'autre.email@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'accepted_terms' => true,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('telephone');
    }

    public function test_a_rejected_member_can_register_again_with_the_same_phone_number(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_MEMBER]);
        Member::create([
            'user_id' => $user->id,
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => $user->email,
            'status' => Member::STATUS_REJECTED,
            'accepted_terms' => true,
        ]);

        $response = $this->postJson('/api/auth/register', [
            'nom' => 'Kouassi',
            'prenoms' => 'Awa',
            'telephone' => '0700000000',
            'email' => 'nouvelle.tentative@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'accepted_terms' => true,
        ]);

        $response->assertCreated();
    }
}
