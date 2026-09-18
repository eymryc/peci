<?php

namespace Database\Seeders;

use App\Models\Action;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoActionSeeder extends Seeder
{
    public function run(): void
    {
        $actions = [
            ['title' => 'Éducation des filles', 'category' => 'Éducation', 'icon' => 'graduation-cap'],
            ['title' => 'Soutien aux écoles', 'category' => 'Éducation', 'icon' => 'school'],
            ['title' => 'Éducation numérique', 'category' => 'Éducation', 'icon' => 'laptop'],
            ['title' => 'Formation des jeunes', 'category' => 'Jeunesse', 'icon' => 'users'],
            ['title' => 'Orientation scolaire', 'category' => 'Jeunesse', 'icon' => 'compass'],
            ['title' => 'Enfants vulnérables', 'category' => 'Jeunesse', 'icon' => 'heart-handshake'],
        ];

        foreach ($actions as $index => $action) {
            Action::updateOrCreate(
                ['slug' => Str::slug($action['title'])],
                [
                    'title' => $action['title'],
                    'slug' => Str::slug($action['title']),
                    'category' => $action['category'],
                    'description' => '[DEMO] Description à compléter depuis l\'administration.',
                    'icon' => $action['icon'],
                    'order' => $index + 1,
                ]
            );
        }
    }
}
