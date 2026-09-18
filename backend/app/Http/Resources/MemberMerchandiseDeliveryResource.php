<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberMerchandiseDeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item' => $this->item,
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'delivered_by' => $this->whenLoaded('deliveredBy', fn () => $this->deliveredBy?->name),
        ];
    }
}
