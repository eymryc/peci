<?php

namespace App\Services;

use App\Models\Member;

/**
 * Certificat d'adhésion (PDF) pour les types de membre sans droit à la carte
 * physique (ex. bénévoles) — voir MembershipType::card_eligible. Généré à la
 * volée à chaque demande plutôt que stocké : les données affichées (nom,
 * numéro, type, date d'adhésion) changent rarement et le document est bon
 * marché à recalculer.
 */
class MemberCertificateService
{
    public function render(Member $member): string
    {
        $member->loadMissing('membershipType');

        return \Pdf::loadView('certificates.membership-certificate-pdf', [
            'member' => $member,
            'issuedAt' => now(),
            'logoImage' => resource_path('images/logo.jpg'),
        ])->setPaper('a4', 'landscape')->output();
    }
}
