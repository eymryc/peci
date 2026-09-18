<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Member $member, private readonly ?string $reason = null)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject("PECI — Votre demande d'adhésion")
            ->greeting("Bonjour {$this->member->prenoms},")
            ->line("Après étude de votre dossier, nous ne sommes pas en mesure de valider votre adhésion à PECI pour le moment.");

        if ($this->reason) {
            $message->line("Motif : {$this->reason}");
        }

        return $message->line('Vous pouvez nous contacter pour plus de précisions ou soumettre une nouvelle demande.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Adhésion refusée',
            'message' => "Votre demande d'adhésion n'a pas été validée.".($this->reason ? " Motif : {$this->reason}" : ''),
            'member_id' => $this->member->id,
        ];
    }
}
