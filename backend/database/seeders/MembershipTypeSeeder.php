<?php

namespace Database\Seeders;

use App\Models\MembershipType;
use Illuminate\Database\Seeder;

class MembershipTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Seuls les membres actifs et bienfaiteurs ont droit à la carte
        // physique ; les autres types (honoraire, bénévole) reçoivent un
        // certificat d'adhésion à la place — voir MembershipType::card_eligible.
        $types = [
            ['name' => 'Membre actif', 'slug' => 'actif', 'duration_months' => 12, 'adhesion_fee' => 5000, 'cotisation_fee' => 2000, 'card_eligible' => true, 'description' => 'Membre engagé dans les activités régulières de PECI.'],
            ['name' => 'Membre bienfaiteur', 'slug' => 'bienfaiteur', 'duration_months' => 12, 'adhesion_fee' => 15000, 'cotisation_fee' => 5000, 'card_eligible' => true, 'description' => 'Soutient PECI financièrement ou matériellement.'],
            ['name' => 'Membre honoraire', 'slug' => 'honoraire', 'duration_months' => 12, 'adhesion_fee' => 0, 'cotisation_fee' => 0, 'card_eligible' => false, 'description' => 'Distinction accordée pour service exceptionnel.'],
            ['name' => 'Bénévole/Élève', 'slug' => 'benevole-eleve', 'duration_months' => 12, 'adhesion_fee' => 0, 'cotisation_fee' => 0, 'card_eligible' => false, 'description' => "Bénévoles et élèves accompagnant les actions de PECI, sans droit d'adhésion ni cotisation."],
        ];

        foreach ($types as $type) {
            MembershipType::updateOrCreate(['slug' => $type['slug']], $type);
        }
    }
}
