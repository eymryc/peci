<?php

namespace App\Services\Sms;

class PhoneNumberFormatter
{
    /**
     * Convertit un numéro ivoirien saisi au format local (ex. "0700000000" ou
     * "07 00 00 00 00") en E.164 (+2250700000000) attendu par les passerelles
     * SMS. Laisse inchangé un numéro déjà international (commence par "+").
     */
    public static function toE164Ci(string $raw): string
    {
        $digits = preg_replace('/\D+/', '', $raw) ?? '';

        if (str_starts_with($raw, '+')) {
            return '+'.$digits;
        }

        if (str_starts_with($digits, '225')) {
            return '+'.$digits;
        }

        // Format local : 10 chiffres commençant par 0 (ex. 0700000000).
        if (str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        return '+225'.$digits;
    }
}
