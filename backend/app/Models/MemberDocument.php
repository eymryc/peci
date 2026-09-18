<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['member_id', 'type', 'file_path'])]
class MemberDocument extends Model
{
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
