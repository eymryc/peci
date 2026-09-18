<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\DonationRequest;
use App\Models\Donation;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    public function store(DonationRequest $request)
    {
        $data = $request->validated();
        $data['reference'] = 'DON-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
        $data['status'] = 'pending';

        $donation = Donation::create($data);

        return $this->success(
            ['reference' => $donation->reference],
            "Votre intention de don a bien été enregistrée. Le paiement en ligne n'est pas encore activé — notre équipe vous contactera.",
            201
        );
    }
}
