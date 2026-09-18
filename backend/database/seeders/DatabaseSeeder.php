<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MembershipTypeSeeder::class,
            InterventionCitySeeder::class,
            AdminSeeder::class,
            DemoMemberSeeder::class,
            DemoProjectSeeder::class,
            DemoNewsSeeder::class,
            DemoResourceSeeder::class,
            DemoPartnerSeeder::class,
            DemoActionSeeder::class,
            GalleryImageSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
