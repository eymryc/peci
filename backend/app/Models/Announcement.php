<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'message', 'sent_by', 'recipients_count', 'sent_sms'])]
class Announcement extends Model
{
    protected function casts(): array
    {
        return [
            'sent_sms' => 'boolean',
        ];
    }

    public function sentBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
