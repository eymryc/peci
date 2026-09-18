<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminCreateMemberRequest;
use App\Http\Requests\AdminUpdateMemberRequest;
use App\Http\Resources\MemberMerchandiseDeliveryResource;
use App\Http\Resources\MemberResource;
use App\Models\ActivityLog;
use App\Models\Member;
use App\Models\MemberMerchandiseDelivery;
use App\Models\User;
use App\Notifications\MembershipApprovedNotification;
use App\Services\MemberCardService;
use App\Services\MemberCertificateService;
use App\Services\MembershipActivationService;
use App\Services\Sms\MemberSmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class MemberController extends Controller
{
    public function __construct(
        private readonly MemberCardService $cardService,
        private readonly MemberCertificateService $certificateService,
        private readonly MembershipActivationService $activationService,
        private readonly MemberSmsService $smsService,
    ) {}

    public function index(Request $request)
    {
        $query = Member::query()->with(['membershipType', 'card']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('q')) {
            $search = $request->string('q');
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenoms', 'like', "%{$search}%")
                    ->orWhere('member_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $members = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => MemberResource::forAdminCollection($members->items()),
            'pagination' => [
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'total' => $members->total(),
            ],
        ]);
    }

    public function show(Member $member)
    {
        $member->load(['membershipType', 'card', 'payments', 'merchandiseDeliveries.deliveredBy']);

        return $this->success(MemberResource::forAdmin($member));
    }

    public function store(AdminCreateMemberRequest $request)
    {
        $data = $request->validated();
        $admin = $request->user();

        $status = $data['status'] ?? Member::STATUS_APPROVED;
        $password = $data['password'] ?? Str::random(16);

        $member = DB::transaction(function () use ($data, $status, $password) {
            $user = User::create([
                'name' => trim($data['prenoms'].' '.$data['nom']),
                'email' => $data['email'],
                'phone' => $data['telephone'],
                'role' => User::ROLE_MEMBER,
                'password' => $password,
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
                'status' => $status,
                'accepted_terms' => true,
                'joined_at' => $status === Member::STATUS_APPROVED ? now() : null,
                'expires_at' => $status === Member::STATUS_APPROVED ? now()->addYear() : null,
            ]);
        });

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store("members/{$member->id}", 'local');
            $member->update(['photo_path' => $path]);
        }

        $this->smsService->sendAccountCreated($member);

        if ($status === Member::STATUS_APPROVED) {
            $member->update(['reviewed_by' => $admin->id, 'reviewed_at' => now()]);
            $this->activationService->onApproved($member);
            $member->user->notify(new MembershipApprovedNotification($member));
        }

        ActivityLog::record($admin->id, 'member.created', "Membre {$member->fullName()} créé par un administrateur", $member);

        return $this->success(
            MemberResource::forAdmin($member->fresh(['membershipType', 'card', 'merchandiseDeliveries'])),
            'Membre créé avec succès.',
            201
        );
    }

    public function update(AdminUpdateMemberRequest $request, Member $member)
    {
        $data = $request->validated();
        $admin = $request->user();
        $wasApproved = $member->status === Member::STATUS_APPROVED;

        if (array_key_exists('email', $data)) {
            $member->user->update(['email' => $data['email']]);
        }
        if (array_key_exists('telephone', $data)) {
            $member->user->update(['phone' => $data['telephone']]);
        }
        if (! empty($data['password'])) {
            $member->user->update(['password' => $data['password']]);
        }
        if (array_key_exists('nom', $data) || array_key_exists('prenoms', $data)) {
            $member->user->update([
                'name' => trim(($data['prenoms'] ?? $member->prenoms).' '.($data['nom'] ?? $member->nom)),
            ]);
        }

        $becomingApproved = isset($data['status']) && $data['status'] === Member::STATUS_APPROVED && ! $wasApproved;

        // La carte affiche le nom, le type et la photo : tout changement de
        // ces champs sur un membre déjà actif doit la régénérer pour rester
        // exacte (évalué après enregistrement, sur le type éventuellement
        // nouveau — un bénévole n'a pas de carte à rafraîchir, son certificat
        // est généré à la volée à chaque téléchargement).
        $cardRelevantFields = ['nom', 'prenoms', 'membership_type_id'];
        $cardFieldsChanged = $wasApproved && ! $becomingApproved && (
            collect($cardRelevantFields)->contains(fn ($field) => array_key_exists($field, $data) && $data[$field] != $member->{$field})
            || $request->hasFile('photo')
        );

        $member->fill(collect($data)->except(['password', 'photo'])->all());

        if ($becomingApproved) {
            $member->reviewed_by = $admin->id;
            $member->reviewed_at = now();
            $member->joined_at = $member->joined_at ?? now();
            $member->expires_at = $member->expires_at ?? now()->addYear();
        }

        $member->save();

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store("members/{$member->id}", 'local');
            $member->update(['photo_path' => $path]);
        }

        if ($becomingApproved) {
            $this->activationService->onApproved($member);
            $member->user->notify(new MembershipApprovedNotification($member));
        } elseif ($cardFieldsChanged) {
            $fresh = $member->fresh('membershipType');
            if ($fresh->membershipType?->card_eligible ?? true) {
                $this->cardService->issueCard($fresh);
            }
        }

        ActivityLog::record($admin->id, 'member.updated', "Membre {$member->fullName()} modifié par un administrateur", $member);

        return $this->success(
            MemberResource::forAdmin($member->fresh(['membershipType', 'card', 'payments', 'merchandiseDeliveries'])),
            'Membre mis à jour avec succès.'
        );
    }

    public function destroy(Request $request, Member $member)
    {
        $admin = $request->user();
        $fullName = $member->fullName();
        $memberNumber = $member->member_number;
        $userId = $member->user_id;

        if ($member->photo_path) {
            Storage::disk('local')->delete($member->photo_path);
        }
        if ($memberNumber) {
            Storage::disk('local')->deleteDirectory("member-cards/{$memberNumber}");
        }

        // La suppression de l'utilisateur entraîne, par cascade, celle du
        // membre, de sa carte, de ses documents et de ses paiements.
        User::destroy($userId);

        ActivityLog::record($admin->id, 'member.deleted', "Membre {$fullName} supprimé par un administrateur");

        return $this->success(null, 'Membre supprimé avec succès.');
    }

    public function deliverMerchandise(Request $request, Member $member, MemberMerchandiseDelivery $delivery)
    {
        if ($delivery->member_id !== $member->id) {
            return $this->error('Cet article ne correspond pas à ce membre.', 404);
        }

        $admin = $request->user();
        $delivery->update(['delivered_at' => now(), 'delivered_by' => $admin->id]);

        ActivityLog::record(
            $admin->id,
            'member.merchandise_delivered',
            "« {$delivery->item} » remis à {$member->fullName()}",
            $member
        );

        return $this->success(
            new MemberMerchandiseDeliveryResource($delivery->fresh('deliveredBy')),
            'Article marqué comme remis.'
        );
    }

    public function cardImage(Member $member)
    {
        $member->load('card');

        if (! $member->card?->image_path || ! Storage::disk('local')->exists($member->card->image_path)) {
            return $this->error('Image de carte introuvable.', 404);
        }

        return Storage::disk('local')->download(
            $member->card->image_path,
            "carte-peci-{$member->member_number}.png"
        );
    }

    public function cardPdf(Member $member)
    {
        $member->load('card');

        if (! $member->card?->pdf_path || ! Storage::disk('local')->exists($member->card->pdf_path)) {
            return $this->error('Carte PDF introuvable.', 404);
        }

        return Storage::disk('local')->download(
            $member->card->pdf_path,
            "carte-peci-{$member->member_number}.pdf"
        );
    }

    public function certificatePdf(Member $member)
    {
        return response($this->certificateService->render($member), Response::HTTP_OK)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename=\"certificat-peci-{$member->member_number}.pdf\"");
    }
}
