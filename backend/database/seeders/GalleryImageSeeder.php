<?php

namespace Database\Seeders;

use App\Models\GalleryImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class GalleryImageSeeder extends Seeder
{
    public function run(): void
    {
        // Photos réelles des actions de terrain PECI, fournies par l'association
        // — reprises depuis frontend/public/images/ pour devenir gérables (upload,
        // suppression, mise en avant) depuis /admin/galerie plutôt que codées en dur.
        $source = base_path('../frontend/public/images');

        $items = [
            ['file' => 'moment-groupe-communaute.jpeg', 'caption' => "L'équipe PECI avec la communauté lors d'une visite de terrain", 'category' => 'evenements', 'featured' => true],
            ['file' => 'moment-cadeau-enfant.jpeg', 'caption' => 'Une enfant reçoit un cadeau PECI lors d\'un arbre de Noël', 'category' => 'evenements', 'featured' => true],
            ['file' => 'moment-give-them-a-smile.jpeg', 'caption' => 'Distribution de vêtements aux femmes de la communauté', 'category' => 'actions', 'featured' => false],
            ['file' => 'moment-equipe-applaudissements.jpeg', 'caption' => "L'équipe PECI et la communauté réunies pour une action solidaire", 'category' => 'evenements', 'featured' => false],
            ['file' => 'moment-distribution-communaute.jpeg', 'caption' => "Un membre de l'équipe PECI entouré d'enfants lors d'une distribution", 'category' => 'actions', 'featured' => true],
            ['file' => 'moment-equipe-casquettes.jpeg', 'caption' => "L'équipe PECI mobilisée sur le terrain", 'category' => 'benevolat', 'featured' => false],
            ['file' => 'moment-equipe-communaute-2.jpeg', 'caption' => "L'équipe PECI avec les habitants d'une commune soutenue", 'category' => 'actions', 'featured' => false],
        ];

        foreach ($items as $index => $item) {
            $sourcePath = "{$source}/{$item['file']}";
            if (! is_file($sourcePath)) {
                continue;
            }

            $storedPath = "gallery/{$item['file']}";
            if (! Storage::disk('public')->exists($storedPath)) {
                Storage::disk('public')->put($storedPath, file_get_contents($sourcePath));
            }

            GalleryImage::updateOrCreate(
                ['image_path' => $storedPath],
                [
                    'caption' => $item['caption'],
                    'category' => $item['category'],
                    'order' => $index,
                    'is_active' => true,
                    'is_featured' => $item['featured'],
                ]
            );
        }
    }
}
