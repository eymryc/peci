<?php

namespace Database\Seeders;

use App\Models\Resource;
use App\Models\ResourceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DemoResourceSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Guides pédagogiques', 'slug' => 'guides-pedagogiques'],
            ['name' => 'Publications PECI', 'slug' => 'publications-peci'],
            ['name' => 'Fiches pratiques', 'slug' => 'fiches-pratiques'],
        ];

        foreach ($categories as $category) {
            ResourceCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }

        $filePath = 'resources/demo-placeholder.txt';
        if (! Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->put(
                $filePath,
                "[DEMO] Document de démonstration PECI.\nÀ remplacer par un vrai document depuis l'administration."
            );
        }

        $resources = [
            ['title' => '[DEMO] Guide du bénévole PECI', 'type' => 'guide', 'category' => 'guides-pedagogiques'],
            ['title' => '[DEMO] Fiche pédagogique — lecture CP', 'type' => 'fiche', 'category' => 'fiches-pratiques'],
            ['title' => '[DEMO] Rapport d\'activités (exemple)', 'type' => 'publication', 'category' => 'publications-peci'],
        ];

        foreach ($resources as $resource) {
            Resource::updateOrCreate(
                ['title' => $resource['title']],
                [
                    'resource_category_id' => ResourceCategory::where('slug', $resource['category'])->first()?->id,
                    'type' => $resource['type'],
                    'file_path' => $filePath,
                    'description' => '[DEMO] Ressource de démonstration à remplacer.',
                ]
            );
        }
    }
}
