<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\MemberCertificateService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CertificateController extends Controller
{
    public function __construct(private readonly MemberCertificateService $certificateService) {}

    public function pdf(Request $request)
    {
        $member = $request->user()->member()->with('membershipType')->firstOrFail();

        // Le certificat ne remplace la carte que pour les types qui n'y ont
        // pas droit (ex. bénévoles) — les autres n'ont ni carte ni certificat
        // dans leur espace, le bureau leur remet la carte en main propre.
        if ($member->membershipType?->card_eligible ?? true) {
            return $this->error('Aucun certificat disponible pour ce type de membre.', 404);
        }

        if ($member->status !== Member::STATUS_APPROVED) {
            return $this->error("Le certificat sera disponible une fois l'adhésion approuvée.", 404);
        }

        return response($this->certificateService->render($member), Response::HTTP_OK)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename=\"certificat-peci-{$member->member_number}.pdf\"");
    }
}
