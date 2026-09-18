<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProjectDetailResource extends JsonResource
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
            'objective' => $this->objective,
            'budget' => $this->budget,
            'beneficiaries' => $this->beneficiaries,
            'progress' => $this->progress,
            'status' => $this->status,
            'partners' => $this->partners ?? [],
            'results' => $this->results ?? [],
            'starts_at' => $this->starts_at?->toDateString(),
            'ends_at' => $this->ends_at?->toDateString(),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => Storage::disk('public')->url($image->path),
                'caption' => $image->caption,
            ])),
            'updates' => $this->whenLoaded('updates', fn () => $this->updates->map(fn ($update) => [
                'id' => $update->id,
                'title' => $update->title,
                'content' => $update->content,
                'date' => $update->date->toDateString(),
            ])),
        ];
    }
}
