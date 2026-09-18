<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\MemberCard;

class VerifyController extends Controller
{
    public function show(string $memberNumber)
    {
        $member = Member::where('member_number', $memberNumber)->with('card')->first();

        if (! $member || ! $member->card) {
            return $this->success([
                'state' => 'NOT_FOUND',
                'valid' => false,
            ]);
        }

        $card = $member->card;

        if ($card->status === MemberCard::STATUS_VALID && $card->expires_at->isPast()) {
            $card->update(['status' => MemberCard::STATUS_EXPIRED]);
        }

        $state = match ($card->fresh()->status) {
            MemberCard::STATUS_VALID => 'VALID',
            MemberCard::STATUS_EXPIRED => 'EXPIRED',
            MemberCard::STATUS_SUSPENDED => 'SUSPENDED',
            default => 'NOT_FOUND',
        };

        return $this->success([
            'state' => $state,
            'valid' => $state === 'VALID',
            'nom' => $member->nom,
            'prenoms' => $member->prenoms,
            'member_number' => $member->member_number,
            'status' => $member->status,
            'joined_at' => $member->joined_at?->toDateString(),
            'expires_at' => $card->expires_at->toDateString(),
        ]);
    }
}
