<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DemoProjectSeeder extends Seeder
{
    public function run(): void
    {
        $coverPath = 'projects/demo-rentree.jpg';
        if (! Storage::disk('public')->exists($coverPath)) {
            Storage::disk('public')->put($coverPath, file_get_contents(resource_path('images/rentree.jpg')));
        }

        $projects = [
            [
                'title' => '[DEMO] Kits scolaires pour la rentrée',
                'region' => 'abidjan',
                'location' => 'Abidjan, Cocody',
                'objective' => "[DEMO] Distribuer des kits scolaires complets aux enfants issus de familles vulnérables avant la rentrée.",
                'budget' => 5000000,
                'beneficiaries' => 500,
                'progress' => 65,
                'status' => 'ongoing',
            ],
            [
                'title' => "[DEMO] Soutien scolaire pour l'éducation des filles",
                'region' => 'poro',
                'location' => 'Korhogo',
                'objective' => '[DEMO] Favoriser le maintien des filles à l\'école à travers un programme de tutorat.',
                'budget' => 3200000,
                'beneficiaries' => 240,
                'progress' => 40,
                'status' => 'ongoing',
            ],
            [
                'title' => '[DEMO] Réhabilitation d\'une école primaire',
                'region' => 'nawa',
                'location' => 'Soubré',
                'objective' => "[DEMO] Réhabiliter les salles de classe et sanitaires d'une école primaire rurale.",
                'budget' => 12000000,
                'beneficiaries' => 320,
                'progress' => 100,
                'status' => 'completed',
            ],
        ];

        foreach ($projects as $project) {
            Project::updateOrCreate(
                ['slug' => Str::slug($project['title'])],
                [
                    ...$project,
                    'slug' => Str::slug($project['title']),
                    'cover_image_path' => $coverPath,
                    'description' => $project['objective'],
                    'starts_at' => now()->subMonths(6),
                    'ends_at' => now()->addMonths(6),
                ]
            );
        }
    }
}
