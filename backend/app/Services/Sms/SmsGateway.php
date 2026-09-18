<?php

namespace App\Services\Sms;

interface SmsGateway
{
    /**
     * Envoie un SMS. Ne doit jamais lever d'exception pour un échec d'envoi
     * (réseau, identifiants invalides...) — retourne simplement false et
     * laisse l'appelant décider (l'envoi de SMS ne doit jamais faire échouer
     * une requête HTTP par ailleurs valide, ex. la validation d'un paiement).
     */
    public function send(string $phoneNumber, string $message): bool;
}
