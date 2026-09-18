<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\PartnerInquiryRequest;
use App\Http\Resources\PartnerResource;
use App\Models\Partner;
use App\Models\PartnerInquiry;

class PartnerController extends Controller
{
    public function index()
    {
        $partners = Partner::where('is_active', true)->orderBy('order')->get();

        return $this->success(PartnerResource::collection($partners));
    }

    public function contact(PartnerInquiryRequest $request)
    {
        $inquiry = PartnerInquiry::create($request->validated());

        return $this->success(['id' => $inquiry->id], 'Votre demande de partenariat a bien été envoyée.', 201);
    }
}
