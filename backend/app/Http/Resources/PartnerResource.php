<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'logo_url' => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null,
            'website' => $this->website,
            'description' => $this->description,
            'type' => $this->type,
            'order' => $this->order,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
