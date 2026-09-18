<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Envoie des SMS via l'API Africa's Talking (bonne couverture des opérateurs
 * ivoiriens — Orange, MTN, Moov — via un seul compte). Identifiants dans
 * AFRICASTALKING_USERNAME / AFRICASTALKING_API_KEY / AFRICASTALKING_SENDER_ID.
 * Utilise automatiquement l'environnement sandbox quand username=sandbox.
 */
class AfricasTalkingGateway implements SmsGateway
{
    public function send(string $phoneNumber, string $message): bool
    {
        $username = config('services.africastalking.username');
        $apiKey = config('services.africastalking.api_key');
        $senderId = config('services.africastalking.sender_id');

        $baseUrl = $username === 'sandbox'
            ? 'https://api.sandbox.africastalking.com/version1/messaging'
            : 'https://api.africastalking.com/version1/messaging';

        try {
            $response = Http::asForm()
                ->withHeaders(['apiKey' => $apiKey, 'Accept' => 'application/json'])
                ->post($baseUrl, array_filter([
                    'username' => $username,
                    'to' => $phoneNumber,
                    'message' => $message,
                    'from' => $senderId,
                ]));

            if ($response->failed()) {
                Log::warning("Échec d'envoi SMS (Africa's Talking) à {$phoneNumber} : {$response->body()}");

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning("Exception lors de l'envoi SMS (Africa's Talking) à {$phoneNumber} : {$e->getMessage()}");

            return false;
        }
    }
}
