<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id', 'membership_type_id', 'member_number',
    'nom', 'prenoms', 'date_naissance', 'sexe', 'telephone', 'whatsapp', 'email',
    'ville', 'commune', 'profession', 'photo_path',
    'status', 'accepted_terms', 'rejection_reason',
    'reviewed_by', 'reviewed_at', 'joined_at', 'expires_at', 'adhesion_confirmed_at',
])]
class Member extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_UNDER_REVIEW = 'under_review';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_EXPIRED = 'expired';

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'accepted_terms' => 'boolean',
            'reviewed_at' => 'datetime',
            'joined_at' => 'date',
            'expires_at' => 'date',
            'adhesion_confirmed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function membershipType(): BelongsTo
    {
        return $this->belongsTo(MembershipType::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function card(): HasOne
    {
        return $this->hasOne(MemberCard::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(MemberDocument::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(MembershipPayment::class);
    }

    public function merchandiseDeliveries(): HasMany
    {
        return $this->hasMany(MemberMerchandiseDelivery::class);
    }

    public function fullName(): string
    {
        return trim("{$this->prenoms} {$this->nom}");
    }
}
