<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['member_id', 'type', 'period', 'amount', 'method', 'reference', 'status', 'paid_at'])]
class MembershipPayment extends Model
{
    public const TYPE_ADHESION = 'adhesion';

    public const TYPE_COTISATION = 'cotisation';

    public const STATUS_PAID = 'paid';

    public const STATUS_PENDING = 'pending';

    public const STATUS_EXPIRED = 'expired';

    protected function casts(): array
    {
        return [
            'paid_at' => 'date',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
