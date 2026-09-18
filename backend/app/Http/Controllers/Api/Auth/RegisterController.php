<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\ActivityLog;
use App\Models\Member;
use App\Models\User;
use App\Notifications\MembershipReceivedNotification;
use App\Services\Sms\MemberSmsService;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function __construct(private readonly MemberSmsService $smsService) {}

    public function __invoke(RegisterMemberRequest $request)
    {
        $data = $request->validated();

        $member = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => trim($data['prenoms'].' '.$data['nom']),
                'email' => $data['email'],
                'phone' => $data['telephone'],
                'role' => User::ROLE_MEMBER,
                'password' => $data['password'],
            ]);

            return Member::create([
                'user_id' => $user->id,
                'membership_type_id' => $data['membership_type_id'] ?? null,
                'nom' => $data['nom'],
                'prenoms' => $data['prenoms'],
                'date_naissance' => $data['date_naissance'] ?? null,
                'sexe' => $data['sexe'] ?? null,
                'telephone' => $data['telephone'],
                'whatsapp' => $data['whatsapp'] ?? null,
                'email' => $data['email'],
                'ville' => $data['ville'] ?? null,
                'commune' => $data['commune'] ?? null,
                'profession' => $data['profession'] ?? null,
                'status' => Member::STATUS_PENDING,
                'accepted_terms' => true,
            ]);
        });

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store("members/{$member->id}", 'local');
            $member->update(['photo_path' => $path]);
        }

        $member->user->notify(new MembershipReceivedNotification($member));
        $this->smsService->sendAccountCreated($member);

        ActivityLog::record($member->user_id, 'membership.submitted', "Demande d'adhésion soumise par {$member->fullName()}", $member);

        return $this->success(
            new MemberResource($member),
            "Votre demande d'adhésion a été envoyée avec succès. Elle est en cours de vérification.",
            201
        );
    }
}
