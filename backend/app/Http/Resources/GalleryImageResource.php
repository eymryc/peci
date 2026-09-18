<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class GalleryImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => Storage::disk('public')->url($this->image_path),
            'caption' => $this->caption,
            'category' => $this->category,
            'order' => $this->order,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
        ];
    }
}
