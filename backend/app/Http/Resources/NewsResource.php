<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class NewsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'author' => $this->author,
            'category' => $this->whenLoaded('category', fn () => $this->category->name),
            'news_category_id' => $this->news_category_id,
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
