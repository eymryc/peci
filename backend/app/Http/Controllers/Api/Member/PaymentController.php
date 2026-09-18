<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipPaymentRequest;
use App\Http\Resources\MembershipPaymentResource;
use App\Models\ActivityLog;
use App\Models\MembershipPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member()->with('membershipType')->firstOrFail();

        $payments = $member->payments()
            ->orderByDesc('period')
            ->orderByDesc('created_at')
            ->get();

        return $this->success([
            'items' => MembershipPaymentResource::collection($payments),
            'fees' => [
                'adhesion' => (int) ($member->membershipType?->adhesion_fee ?? 0),
                'cotisation' => (int) ($member->membershipType?->cotisation_fee ?? 0),
            ],
            'adhesion_paid' => $payments->contains(
                fn (MembershipPayment $p) => $p->type === MembershipPayment::TYPE_ADHESION && $p->status === MembershipPayment::STATUS_PAID
            ),
        ]);
    }

    public function store(MembershipPaymentRequest $request)
    {
        $member = $request->user()->member()->with('membershipType')->firstOrFail();
        $data = $request->validated();

        if ($data['type'] === MembershipPayment::TYPE_ADHESION) {
            $existing = $member->payments()
                ->where('type', MembershipPayment::TYPE_ADHESION)
                ->whereIn('status', [MembershipPayment::STATUS_PAID, MembershipPayment::STATUS_PENDING])
                ->exists();

            if ($existing) {
                return $this->error('Le droit d\'adhésion a déjà été réglé ou est en attente.', 422);
            }

            // Le montant du droit d'adhésion dépend du type de membre.
            $amount = (int) ($member->membershipType?->adhesion_fee ?? 0);
            $period = null;
        } else {
            $period = $data['period'];

            $existing = $member->payments()
                ->where('type', MembershipPayment::TYPE_COTISATION)
                ->where('period', $period)
                ->whereIn('status', [MembershipPayment::STATUS_PAID, MembershipPayment::STATUS_PENDING])
                ->exists();

            if ($existing) {
                return $this->error('Une cotisation existe déjà pour ce mois.', 422);
            }

            // Le montant de la cotisation mensuelle dépend aussi du type de membre.
            $amount = (int) ($member->membershipType?->cotisation_fee ?? 0);
        }

        $payment = MembershipPayment::create([
            'member_id' => $member->id,
            'type' => $data['type'],
            'period' => $period,
            'amount' => $amount,
            'method' => $data['method'],
            'reference' => 'COT-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'status' => MembershipPayment::STATUS_PENDING,
        ]);

        ActivityLog::record($member->user_id, 'payment.declared', "Paiement déclaré ({$data['type']}) par {$member->fullName()}", $payment);

        return $this->success(
            new MembershipPaymentResource($payment),
            "Votre paiement a été enregistré comme en attente. Le paiement en ligne n'est pas encore activé — notre équipe le confirmera après réception.",
            201
        );
    }
}
