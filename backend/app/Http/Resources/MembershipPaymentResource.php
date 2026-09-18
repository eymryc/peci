<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'period' => $this->period,
            'amount' => $this->amount,
            'method' => $this->method,
            'reference' => $this->reference,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->toDateString(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
