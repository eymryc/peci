<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Member;
use App\Models\User;
use App\Notifications\AnnouncementNotification;
use App\Services\Sms\MemberSmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class AnnouncementController extends Controller
{
    public function __construct(private readonly MemberSmsService $smsService) {}

    public function index(Request $request)
    {
        $announcements = Announcement::with('sentBy')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => AnnouncementResource::collection($announcements->items()),
            'pagination' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    public function store(AdminAnnouncementRequest $request)
    {
        $data = $request->validated();
        $admin = $request->user();

        // « Tous les membres de la communauté » : tout compte membre, quel que
        // soit le statut de son adhésion — pas seulement les membres approuvés.
        $recipients = User::where('role', User::ROLE_MEMBER)->whereHas('member')->get();

        $announcement = Announcement::create([
            'title' => $data['title'],
            'message' => $data['message'],
            'sent_by' => $admin->id,
            'recipients_count' => $recipients->count(),
            'sent_sms' => (bool) ($data['send_sms'] ?? false),
        ]);

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new AnnouncementNotification($announcement));
        }

        if ($announcement->sent_sms) {
            $members = Member::whereIn('user_id', $recipients->pluck('id'))->get();
            foreach ($members as $member) {
                $this->smsService->sendAnnouncement($member, $announcement->title, $announcement->message);
            }
        }

        ActivityLog::record(
            $admin->id,
            'announcement.sent',
            "Annonce « {$announcement->title} » envoyée à {$announcement->recipients_count} membre(s)",
            $announcement
        );

        return $this->success(
            new AnnouncementResource($announcement->load('sentBy')),
            'Annonce envoyée.',
            201
        );
    }
}
