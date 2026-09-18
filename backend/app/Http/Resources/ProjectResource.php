<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'cover_image_url' => $this->cover_image_path ? Storage::disk('public')->url($this->cover_image_path) : null,
            'description' => $this->description,
            'location' => $this->location,
            'region' => $this->region,
            'beneficiaries' => $this->beneficiaries,
            'progress' => $this->progress,
            'status' => $this->status,
            'starts_at' => $this->starts_at?->toDateString(),
            'ends_at' => $this->ends_at?->toDateString(),
        ];
    }
}
