<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;

/**
 * Passerelle de repli utilisée tant qu'aucun fournisseur SMS n'est configuré
 * (voir AFRICASTALKING_* dans .env) : le message est simplement journalisé,
 * ce qui permet de développer/tester tout le flux sans compte réel ni frais,
 * et de brancher un vrai fournisseur plus tard sans changer le reste du code.
 */
class LogSmsGateway implements SmsGateway
{
    public function send(string $phoneNumber, string $message): bool
    {
        Log::info("[SMS simulé — aucun fournisseur configuré] à {$phoneNumber} : {$message}");

        return true;
    }
}
