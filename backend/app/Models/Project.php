<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title', 'slug', 'cover_image_path', 'description', 'location', 'region',
    'objective', 'budget', 'beneficiaries', 'progress', 'status',
    'partners', 'results', 'starts_at', 'ends_at',
])]
class Project extends Model
{
    protected function casts(): array
    {
        return [
            'budget' => 'integer',
            'beneficiaries' => 'integer',
            'progress' => 'integer',
            'partners' => 'array',
            'results' => 'array',
            'starts_at' => 'date',
            'ends_at' => 'date',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('order');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ProjectUpdate::class)->orderBy('date', 'desc');
    }
}
