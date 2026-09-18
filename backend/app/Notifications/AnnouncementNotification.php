<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AnnouncementNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Announcement $announcement) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("PECI — {$this->announcement->title}")
            ->greeting($this->announcement->title)
            ->line($this->announcement->message)
            ->action('Voir dans mon espace membre', rtrim(config('app.frontend_url'), '/').'/espace-membre/notifications');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->announcement->title,
            'message' => $this->announcement->message,
            'type' => 'announcement',
        ];
    }
}
