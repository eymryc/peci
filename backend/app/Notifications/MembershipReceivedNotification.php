<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Member $member)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('PECI — Votre demande d\'adhésion a bien été reçue')
            ->greeting("Bonjour {$this->member->prenoms},")
            ->line("Votre demande d'adhésion à PECI a bien été enregistrée et est en cours de vérification.")
            ->line('Vous recevrez une notification dès que votre dossier aura été traité.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Demande reçue',
            'message' => "Votre demande d'adhésion à PECI a bien été reçue et est en cours de vérification.",
            'member_id' => $this->member->id,
        ];
    }
}
