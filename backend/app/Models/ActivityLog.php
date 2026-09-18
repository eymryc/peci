<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'action', 'subject_type', 'subject_id', 'description', 'ip_address'])]
class ActivityLog extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(
        ?int $userId,
        string $action,
        ?string $description = null,
        ?Model $subject = null,
    ): self {
        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description,
            'ip_address' => request()->ip(),
        ]);
    }
}
