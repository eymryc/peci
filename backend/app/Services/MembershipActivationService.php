<?php

namespace App\Services;

use App\Models\Member;
use App\Models\MemberMerchandiseDelivery;
use App\Services\Sms\MemberSmsService;

/**
 * Centralise ce qui doit se produire quand un dossier passe "approuvé", et
 * quand l'adhésion est confirmée (payée pour les types payants, immédiate
 * pour les types gratuits comme les bénévoles) — utilisé depuis
 * MembershipController, Admin\MemberController et Admin\PaymentController
 * pour éviter de dupliquer ces règles à chaque point d'entrée.
 */
class MembershipActivationService
{
    public function __construct(
        private readonly MemberCardService $cardService,
        private readonly MemberSmsService $smsService,
    ) {}

    /**
     * À appeler juste après qu'un membre passe au statut "approved". Émet la
     * carte pour les types qui y ont droit, ou attribue simplement un numéro
     * de membre sinon (ex. bénévoles — ils recevront un certificat à la
     * place). Les types sans droit d'adhésion à régler (adhesion_fee = 0)
     * n'ont pas d'étape de paiement à attendre : l'adhésion est confirmée
     * immédiatement.
     */
    public function onApproved(Member $member): void
    {
        $member->loadMissing('membershipType');
        $type = $member->membershipType;

        if ($type?->card_eligible ?? true) {
            $this->cardService->issueCard($member);
        } else {
            $this->cardService->ensureMemberNumber($member);
        }

        if ((int) ($type?->adhesion_fee ?? 0) === 0) {
            // Sur la même instance (pas un fresh() détaché) : les appelants
            // notifient souvent juste après avec ce même $member, qui doit
            // refléter adhesion_confirmed_at en mémoire.
            $this->confirmAdhesion($member);
        }
    }

    /**
     * Marque l'adhésion comme confirmée (idempotent) : c'est le moment où la
     * personne devient officiellement membre — SMS de bienvenue et
     * préparation du kit (carte, casquette, tee-shirt...) à livrer par le
     * bureau. Le kit est réservé aux types éligibles à la carte (membres
     * actifs et bienfaiteurs) — jamais aux bénévoles/élèves ou membres
     * honoraires, même si le champ a été rempli par erreur pour leur type.
     */
    public function confirmAdhesion(Member $member): void
    {
        if ($member->adhesion_confirmed_at) {
            return;
        }

        $member->update(['adhesion_confirmed_at' => now()]);

        $member->loadMissing('membershipType');
        $type = $member->membershipType;
        if ($type?->card_eligible) {
            foreach ($type->merchandiseItemsList() as $item) {
                MemberMerchandiseDelivery::create(['member_id' => $member->id, 'item' => $item]);
            }
        }

        $this->smsService->sendAdhesionConfirmed($member);
    }
}
