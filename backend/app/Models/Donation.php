<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'phone', 'amount', 'method', 'reference', 'is_anonymous', 'status'])]
class Donation extends Model
{
    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
        ];
    }
}
