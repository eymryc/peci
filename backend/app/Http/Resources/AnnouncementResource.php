<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'recipients_count' => $this->recipients_count,
            'sent_sms' => $this->sent_sms,
            'sent_by' => $this->whenLoaded('sentBy', fn () => $this->sentBy?->name),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
