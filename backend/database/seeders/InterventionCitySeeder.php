<?php

namespace Database\Seeders;

use App\Models\InterventionCity;
use Illuminate\Database\Seeder;

class InterventionCitySeeder extends Seeder
{
    public function run(): void
    {
        // Point de départ : les 31 régions officielles de Côte d'Ivoire —
        // gérables ensuite depuis /admin/interventions (ajout, renommage,
        // ordre, activation) sans toucher au code.
        $cities = collect(config('regions'))->values();

        foreach ($cities as $index => $city) {
            InterventionCity::updateOrCreate(
                ['slug' => $city['slug']],
                ['name' => $city['name'], 'order' => $index, 'is_active' => true]
            );
        }
    }
}
