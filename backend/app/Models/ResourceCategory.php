<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug'])]
class ResourceCategory extends Model
{
    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class);
    }
}
