<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Member $member) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // Le kit (carte de membre, casquette, tee-shirt...) est réservé aux
        // membres actifs et bienfaiteurs — jamais mentionné aux bénévoles/
        // élèves ou membres honoraires, qui n'y ont pas droit.
        $cardEligible = $this->member->membershipType?->card_eligible ?? true;
        $handoverItem = $cardEligible ? 'de votre carte de membre et de votre kit' : null;

        $mail = (new MailMessage)
            ->subject('PECI — Votre adhésion a été validée')
            ->greeting("Félicitations {$this->member->prenoms} !")
            ->line("Votre adhésion à PECI a été validée. Votre numéro de membre est {$this->member->member_number}.");

        // Les types sans droit d'adhésion à régler (ex. bénévoles) sont déjà
        // confirmés à ce stade — inutile de leur parler d'un paiement à faire.
        if ($this->member->adhesion_confirmed_at) {
            if ($handoverItem) {
                $mail->line("Le bureau vous contactera pour la remise {$handoverItem}.");
            }
        } elseif ($handoverItem) {
            $mail->line("Vous pouvez dès à présent régler votre droit d'adhésion depuis votre espace membre. Une fois ce paiement confirmé, vous recevrez un SMS de bienvenue et le bureau vous contactera pour la remise {$handoverItem}.");
        } else {
            $mail->line('Vous pouvez dès à présent régler votre droit d\'adhésion depuis votre espace membre. Une fois ce paiement confirmé, vous recevrez un SMS de bienvenue confirmant votre adhésion.');
        }

        return $mail->action('Accéder à mon espace membre', rtrim(config('app.frontend_url'), '/').'/espace-membre');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Adhésion approuvée',
            'message' => "Votre adhésion à PECI a été validée. Numéro de membre : {$this->member->member_number}.",
            'member_id' => $this->member->id,
        ];
    }
}
