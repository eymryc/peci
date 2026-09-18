<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MembershipPayment;
use App\Models\MembershipType;
use App\Models\User;
use App\Services\MemberCardService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoMemberSeeder extends Seeder
{
    public function run(MemberCardService $cardService): void
    {
        $user = User::updateOrCreate(
            ['email' => 'membre@peci.demo'],
            [
                'name' => '[DEMO] Awa Kouassi',
                'phone' => '0700000003',
                'role' => User::ROLE_MEMBER,
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $member = Member::updateOrCreate(
            ['user_id' => $user->id],
            [
                'membership_type_id' => MembershipType::where('slug', 'actif')->first()?->id,
                'nom' => 'Kouassi',
                'prenoms' => 'Awa',
                'date_naissance' => '1998-04-12',
                'sexe' => 'F',
                'telephone' => '0700000003',
                'whatsapp' => '0700000003',
                'email' => 'membre@peci.demo',
                'ville' => 'Abidjan',
                'commune' => 'Cocody',
                'profession' => '[DEMO] Étudiante',
                'status' => Member::STATUS_APPROVED,
                'accepted_terms' => true,
                'joined_at' => now()->subMonths(2),
                'expires_at' => now()->addMonths(10),
            ]
        );

        if (! $member->card) {
            $cardService->issueCard($member);
        }

        // [DEMO] Historique de paiements : droit d'adhésion payé, une
        // cotisation payée le mois dernier, une en attente ce mois-ci.
        MembershipPayment::updateOrCreate(
            ['member_id' => $member->id, 'type' => MembershipPayment::TYPE_ADHESION, 'period' => null],
            [
                'amount' => 5000,
                'method' => 'orange_money',
                'reference' => 'COT-DEMO-'.strtoupper(Str::random(6)),
                'status' => MembershipPayment::STATUS_PAID,
                'paid_at' => $member->joined_at,
            ]
        );

        MembershipPayment::updateOrCreate(
            ['member_id' => $member->id, 'type' => MembershipPayment::TYPE_COTISATION, 'period' => now()->subMonthNoOverflow()->format('Y-m')],
            [
                'amount' => 2000,
                'method' => 'wave',
                'reference' => 'COT-DEMO-'.strtoupper(Str::random(6)),
                'status' => MembershipPayment::STATUS_PAID,
                'paid_at' => now()->subMonthNoOverflow(),
            ]
        );

        MembershipPayment::updateOrCreate(
            ['member_id' => $member->id, 'type' => MembershipPayment::TYPE_COTISATION, 'period' => now()->format('Y-m')],
            [
                'amount' => 2000,
                'method' => 'orange_money',
                'reference' => 'COT-DEMO-'.strtoupper(Str::random(6)),
                'status' => MembershipPayment::STATUS_PENDING,
                'paid_at' => null,
            ]
        );
    }
}
