<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['image_path', 'caption', 'category', 'order', 'is_active', 'is_featured'])]
class GalleryImage extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }
}
