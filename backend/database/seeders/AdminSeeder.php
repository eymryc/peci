<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@peci.demo'],
            [
                'name' => '[DEMO] Administrateur PECI',
                'phone' => '0700000001',
                'role' => User::ROLE_ADMIN,
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'staff@peci.demo'],
            [
                'name' => '[DEMO] Staff PECI',
                'phone' => '0700000002',
                'role' => User::ROLE_STAFF,
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
    }
}
