<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        // [DEMO] Chiffres clés placeholders — à remplacer par les vraies statistiques PECI
        // depuis l'administration (section "Notre impact").
        $settings = [
            ['key' => 'public_stat_children_supported', 'value' => '10000', 'type' => 'integer'],
            ['key' => 'public_stat_schools_supported', 'value' => '50', 'type' => 'integer'],
            ['key' => 'public_stat_kits_distributed', 'value' => '8000', 'type' => 'integer'],
            ['key' => 'public_stat_teachers_supported', 'value' => '300', 'type' => 'integer'],
            ['key' => 'public_hero_headline', 'value' => "Construire aujourd'hui l'éducation de demain.", 'type' => 'string'],
            ['key' => 'public_hero_subheadline', 'value' => "Promouvoir une éducation accessible, inclusive et de qualité pour contribuer à l'avenir de la Côte d'Ivoire.", 'type' => 'string'],

            // Le droit d'adhésion ET la cotisation mensuelle dépendent du type de
            // membre (voir membership_types.adhesion_fee / cotisation_fee,
            // gérables depuis /admin/cotisations) — plus de montant global ici.

            // Page d'accueil — modifiable depuis /admin/parametres.
            ['key' => 'public_home_hero_image', 'value' => '/images/rentree.jpg', 'type' => 'image'],
            ['key' => 'public_home_vision_text', 'value' => "Une Côte d'Ivoire où chaque enfant, quel que soit son milieu, a accès à une éducation de qualité.", 'type' => 'string'],
            ['key' => 'public_home_mission_text', 'value' => 'Promouvoir une éducation accessible, inclusive et de qualité à travers des actions de terrain concrètes.', 'type' => 'string'],
            ['key' => 'public_home_values_text', 'value' => 'Éducation, inclusion, engagement, solidarité, innovation et impact guident chacune de nos actions.', 'type' => 'string'],

            // Page "Qui sommes-nous" — modifiable depuis /admin/parametres.
            ['key' => 'public_about_hero_image', 'value' => '/images/rentree.jpg', 'type' => 'image'],
            [
                'key' => 'public_about_intro_paragraph_1',
                'value' => "Partout dans le monde, l'on prône l'éducation par l'enseignement scolaire à tous les genres, toutes les classes sociales et toutes les religions. Cependant, il est irrécusable que des insuffisances et des inégalités existent bel et bien. Malheureusement, le système éducatif ivoirien n'est pas en marge de ces défaillances dûes à des facteurs socio-économiques, politiques et démographiques.",
                'type' => 'string',
            ],
            [
                'key' => 'public_about_intro_paragraph_2',
                'value' => "C'est dans ce contexte que la PECI, créée en 2020 par Lybird Hien, décide de promouvoir l'éducation en Côte d'Ivoire à travers des actions caritatives et innovantes à l'endroit des élèves, des enfants non-scolarisés et des établissements scolaires dans le besoin.",
                'type' => 'string',
            ],
            [
                'key' => 'public_about_nb_text',
                'value' => "L'éducation est un droit essentiel, qui permet à chacun de recevoir une instruction et de s'épanouir dans sa vie sociale. Le droit à l'éducation est vital pour le développement économique, social et culturel de toutes les sociétés.",
                'type' => 'string',
            ],
            [
                'key' => 'public_about_objectifs',
                'value' => implode("\n", [
                    "Promouvoir l'éducation en Côte d'Ivoire et au-delà des frontières subsahariennes.",
                    "Redorer le blason du système éducatif ivoirien.",
                    "Redonner l'espoir d'un avenir meilleur à une jeunesse en devenir.",
                ]),
                'type' => 'string',
            ],
            [
                'key' => 'public_about_missions',
                'value' => implode("\n", [
                    "Kits scolaires, prises en charge, bourses d'études, parrainages et réhabilitation de certains établissements.",
                    "Aider à la réinsertion des enfants déscolarisés et des enfants marginalisés.",
                    "Créer des activités novatrices pour stimuler et mettre à profit la créativité des apprenants.",
                    "Organiser des évènements caritatifs pour pallier aux besoins des nécessiteux.",
                ]),
                'type' => 'string',
            ],
            [
                'key' => 'public_about_activity_text',
                'value' => "En 2021 : le 26 décembre 2021, ce sont plus de 2 000 enfants de la commune de Yopougon Wassakara qui ont reçu des cadeaux lors d'un arbre de Noël organisé par notre association.",
                'type' => 'string',
            ],
            ['key' => 'public_about_quote_text', 'value' => "L'éducation est l'arme la plus puissante pour changer le monde.", 'type' => 'string'],
            ['key' => 'public_about_quote_author', 'value' => 'Nelson Mandela', 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            Setting::set($setting['key'], $setting['value'], $setting['type']);
        }
    }
}
