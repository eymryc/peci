<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DemoNewsSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Actions terrain', 'slug' => 'actions-terrain'],
            ['name' => 'Éducation', 'slug' => 'education'],
            ['name' => 'Jeunesse', 'slug' => 'jeunesse'],
            ['name' => 'Événements', 'slug' => 'evenements'],
            ['name' => 'Partenariats', 'slug' => 'partenariats'],
            ['name' => 'Actualités PECI', 'slug' => 'actualites-peci'],
        ];

        foreach ($categories as $category) {
            NewsCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }

        $imagePath = 'news/demo-rentree.jpg';
        if (! Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->put($imagePath, file_get_contents(resource_path('images/rentree.jpg')));
        }

        $articles = [
            [
                'title' => '[DEMO] PECI lance sa campagne de rentrée scolaire',
                'category' => 'actions-terrain',
                'excerpt' => '[DEMO] Distribution de kits scolaires dans plusieurs régions pour accompagner la rentrée des classes.',
            ],
            [
                'title' => "[DEMO] Un partenariat pour l'éducation numérique",
                'category' => 'partenariats',
                'excerpt' => '[DEMO] PECI annonce un partenariat pilote autour du numérique éducatif.',
            ],
            [
                'title' => "[DEMO] Journée de sensibilisation sur l'éducation des filles",
                'category' => 'jeunesse',
                'excerpt' => "[DEMO] Retour sur une journée dédiée à la sensibilisation des familles.",
            ],
        ];

        foreach ($articles as $article) {
            News::updateOrCreate(
                ['slug' => Str::slug($article['title'])],
                [
                    'news_category_id' => NewsCategory::where('slug', $article['category'])->first()?->id,
                    'title' => $article['title'],
                    'slug' => Str::slug($article['title']),
                    'image_path' => $imagePath,
                    'excerpt' => $article['excerpt'],
                    'content' => $article['excerpt']."\n\n[DEMO] Contenu détaillé à compléter depuis l'administration.",
                    'author' => 'Équipe PECI',
                    'status' => News::STATUS_PUBLISHED,
                    'published_at' => now()->subDays(rand(1, 30)),
                ]
            );
        }
    }
}
