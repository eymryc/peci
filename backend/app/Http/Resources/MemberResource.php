<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    private bool $adminContext = false;

    /**
     * Ressource utilisée depuis l'administration — la carte imbriquée pointe
     * alors vers les routes admin dédiées (voir MemberCardResource::forAdmin).
     */
    public static function forAdmin($resource): static
    {
        $instance = new static($resource);
        $instance->adminContext = true;

        return $instance;
    }

    /** @return array<int, static> */
    public static function forAdminCollection(iterable $resources): array
    {
        return collect($resources)->map(fn ($resource) => static::forAdmin($resource))->all();
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_number' => $this->member_number,
            'nom' => $this->nom,
            'prenoms' => $this->prenoms,
            'full_name' => $this->fullName(),
            'date_naissance' => $this->date_naissance?->toDateString(),
            'sexe' => $this->sexe,
            'telephone' => $this->telephone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'ville' => $this->ville,
            'commune' => $this->commune,
            'profession' => $this->profession,
            'has_photo' => (bool) $this->photo_path,
            'status' => $this->status,
            'membership_type' => $this->whenLoaded('membershipType', fn () => $this->membershipType ? [
                'id' => $this->membershipType->id,
                'name' => $this->membershipType->name,
                'adhesion_fee' => $this->membershipType->adhesion_fee,
                'cotisation_fee' => $this->membershipType->cotisation_fee,
                'card_eligible' => $this->membershipType->card_eligible,
            ] : null),
            'joined_at' => $this->joined_at?->toDateString(),
            'expires_at' => $this->expires_at?->toDateString(),
            'adhesion_confirmed_at' => $this->adhesion_confirmed_at?->toIso8601String(),
            // La carte de membre n'est visible/téléchargeable que côté admin —
            // le bureau la remet en main propre, elle n'apparaît jamais dans
            // l'espace membre.
            'card' => $this->when($this->adminContext, fn () => MemberCardResource::forAdmin($this->whenLoaded('card'), $this->id)),
            'merchandise_deliveries' => $this->when(
                $this->adminContext,
                fn () => MemberMerchandiseDeliveryResource::collection($this->whenLoaded('merchandiseDeliveries'))
            ),
            'payments' => MembershipPaymentResource::collection($this->whenLoaded('payments')),
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
