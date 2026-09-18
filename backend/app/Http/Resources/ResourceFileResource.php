<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ResourceFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'file_url' => Storage::disk('public')->url($this->file_path),
            'description' => $this->description,
            'category' => $this->whenLoaded('category', fn () => $this->category->name),
            'resource_category_id' => $this->resource_category_id,
            'downloads_count' => $this->downloads_count,
        ];
    }
}
