<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'duration_months', 'adhesion_fee', 'cotisation_fee', 'merchandise_items', 'card_eligible', 'is_active'])]
class MembershipType extends Model
{
    protected function casts(): array
    {
        return [
            'adhesion_fee' => 'integer',
            'cotisation_fee' => 'integer',
            'card_eligible' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    /** @return array<int, string> */
    public function merchandiseItemsList(): array
    {
        return collect(explode("\n", (string) $this->merchandise_items))
            ->map(fn ($line) => trim($line))
            ->filter()
            ->values()
            ->all();
    }
}
