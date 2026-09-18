<?php

namespace App\Services\Sms;

use App\Models\Member;

/**
 * Messages SMS envoyés aux membres aux deux moments clés du parcours
 * d'adhésion : la création du compte (confirmation), puis la confirmation du
 * paiement du droit d'adhésion (bienvenue — c'est à ce moment que la personne
 * devient officiellement membre).
 */
class MemberSmsService
{
    public function __construct(private readonly SmsGateway $gateway) {}

    public function sendAccountCreated(Member $member): bool
    {
        $message = "Bonjour {$member->prenoms}, votre compte PECI a bien été créé. ".
            "Votre demande d'adhésion est en cours de vérification. — PECI";

        return $this->send($member, $message);
    }

    public function sendAdhesionConfirmed(Member $member): bool
    {
        $member->loadMissing('membershipType');

        // Le kit (carte, casquette, tee-shirt...) n'existe que pour les
        // membres actifs et bienfaiteurs — inutile d'en parler aux
        // bénévoles/élèves ou membres honoraires, qui n'y ont pas droit.
        $handover = $member->membershipType?->card_eligible
            ? ' Le bureau vous contactera pour la remise de votre kit de membre.'
            : '';

        $message = "Bienvenue {$member->prenoms} ! Votre adhésion à PECI est confirmée".
            ($member->member_number ? " (N° {$member->member_number})" : '').
            ".{$handover} — PECI";

        return $this->send($member, $message);
    }

    public function sendAnnouncement(Member $member, string $title, string $message): bool
    {
        return $this->send($member, "PECI — {$title} : {$message}");
    }

    private function send(Member $member, string $message): bool
    {
        if (blank($member->telephone)) {
            return false;
        }

        return $this->gateway->send(PhoneNumberFormatter::toE164Ci($member->telephone), $message);
    }
}
