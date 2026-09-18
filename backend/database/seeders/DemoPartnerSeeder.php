<?php

namespace Database\Seeders;

use App\Models\Partner;
use Illuminate\Database\Seeder;

class DemoPartnerSeeder extends Seeder
{
    public function run(): void
    {
        // [DEMO] Partenaires fictifs — à remplacer par les partenaires officiels de PECI.
        $partners = [
            ['name' => '[DEMO] Partenaire Éducation 1', 'type' => 'institutionnel', 'order' => 1],
            ['name' => '[DEMO] Partenaire Éducation 2', 'type' => 'ong', 'order' => 2],
            ['name' => '[DEMO] Partenaire Éducation 3', 'type' => 'entreprise', 'order' => 3],
        ];

        foreach ($partners as $partner) {
            Partner::updateOrCreate(['name' => $partner['name']], $partner);
        }
    }
}
