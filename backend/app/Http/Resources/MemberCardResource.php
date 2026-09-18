<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberCardResource extends JsonResource
{
    private bool $adminContext = false;

    private ?int $adminMemberId = null;

    /**
     * Ressource utilisée par un admin/staff consultant la carte d'un membre
     * quelconque — les URLs pointent alors vers les routes admin dédiées
     * plutôt que vers "ma propre carte".
     */
    public static function forAdmin($resource, int $memberId): static
    {
        $instance = new static($resource);
        $instance->adminContext = true;
        $instance->adminMemberId = $memberId;

        return $instance;
    }

    public function toArray(Request $request): array
    {
        if (! $this->resource) {
            return [];
        }

        return [
            'card_number' => $this->card_number,
            'version' => $this->version,
            'status' => $this->status,
            'issued_at' => $this->issued_at?->toDateString(),
            'expires_at' => $this->expires_at?->toDateString(),
            'image_url' => $this->adminContext
                ? route('admin.members.card.image', $this->adminMemberId)
                : route('member.card.image'),
            'pdf_url' => $this->adminContext
                ? route('admin.members.card.pdf', $this->adminMemberId)
                : route('member.card.pdf'),
        ];
    }
}
