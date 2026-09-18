<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectMembershipRequest;
use App\Http\Resources\MemberResource;
use App\Models\ActivityLog;
use App\Models\Member;
use App\Notifications\MembershipApprovedNotification;
use App\Notifications\MembershipRejectedNotification;
use App\Services\MembershipActivationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MembershipController extends Controller
{
    public function __construct(private readonly MembershipActivationService $activationService) {}

    public function pending(Request $request)
    {
        $members = Member::whereIn('status', [Member::STATUS_PENDING, Member::STATUS_UNDER_REVIEW])
            ->with('membershipType')
            ->orderBy('created_at')
            ->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => MemberResource::collection($members->items()),
            'pagination' => [
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'total' => $members->total(),
            ],
        ]);
    }

    public function approve(Request $request, Member $member)
    {
        if ($member->status === Member::STATUS_APPROVED) {
            return $this->error('Ce membre est déjà approuvé.', 422);
        }

        $admin = $request->user();

        $member = DB::transaction(function () use ($member, $admin) {
            $member->update([
                'status' => Member::STATUS_APPROVED,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'joined_at' => $member->joined_at ?? now(),
                'expires_at' => $member->expires_at ?? now()->addYear(),
            ]);

            $this->activationService->onApproved($member);

            return $member->fresh(['card', 'membershipType', 'merchandiseDeliveries']);
        });

        $member->user->notify(new MembershipApprovedNotification($member));

        ActivityLog::record($admin->id, 'membership.approved', "Adhésion de {$member->fullName()} approuvée", $member);

        return $this->success(new MemberResource($member), 'Adhésion approuvée.');
    }

    public function reject(RejectMembershipRequest $request, Member $member)
    {
        $admin = $request->user();
        $reason = $request->validated('reason');

        $member->update([
            'status' => Member::STATUS_REJECTED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $member->user->notify(new MembershipRejectedNotification($member, $reason));

        ActivityLog::record($admin->id, 'membership.rejected', "Adhésion de {$member->fullName()} refusée", $member);

        return $this->success(new MemberResource($member), 'Adhésion refusée.');
    }
}
