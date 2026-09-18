<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MembershipPaymentResource;
use App\Models\ActivityLog;
use App\Models\MembershipPayment;
use App\Services\MembershipActivationService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly MembershipActivationService $activationService) {}

    public function index(Request $request)
    {
        $query = MembershipPayment::query()->with('member')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $payments = $query->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => $payments->getCollection()->map(fn (MembershipPayment $payment) => [
                ...(new MembershipPaymentResource($payment))->toArray($request),
                'member' => [
                    'id' => $payment->member->id,
                    'full_name' => $payment->member->fullName(),
                    'member_number' => $payment->member->member_number,
                ],
            ]),
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function markPaid(Request $request, MembershipPayment $payment)
    {
        if ($payment->status === MembershipPayment::STATUS_PAID) {
            return $this->error('Ce paiement est déjà marqué comme payé.', 422);
        }

        $payment->update([
            'status' => MembershipPayment::STATUS_PAID,
            'paid_at' => now(),
        ]);

        ActivityLog::record(
            $request->user()->id,
            'payment.marked_paid',
            "Paiement #{$payment->id} marqué payé pour {$payment->member->fullName()}",
            $payment
        );

        // Le paiement du droit d'adhésion (et non l'approbation du dossier) est
        // le moment où la personne devient officiellement membre.
        if ($payment->type === MembershipPayment::TYPE_ADHESION) {
            $this->activationService->confirmAdhesion($payment->member);
        }

        return $this->success(new MembershipPaymentResource($payment), 'Paiement marqué comme payé.');
    }
}
