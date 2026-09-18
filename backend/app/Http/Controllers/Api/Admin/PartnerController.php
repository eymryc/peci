<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartnerRequest;
use App\Http\Resources\PartnerResource;
use App\Models\ActivityLog;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PartnerController extends Controller
{
    public function index()
    {
        return $this->success(PartnerResource::collection(Partner::orderBy('order')->get()));
    }

    public function store(StorePartnerRequest $request)
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('partners', 'public');
        }

        $partner = Partner::create($data);

        ActivityLog::record($request->user()->id, 'partner.created', "Partenaire « {$partner->name} » créé", $partner);

        return $this->success(new PartnerResource($partner), 'Partenaire créé avec succès.', 201);
    }

    public function update(StorePartnerRequest $request, Partner $partner)
    {
        $data = $request->validated();
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        if ($request->hasFile('logo')) {
            if ($partner->logo_path) {
                Storage::disk('public')->delete($partner->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('partners', 'public');
        }

        $partner->update($data);

        ActivityLog::record($request->user()->id, 'partner.updated', "Partenaire « {$partner->name} » modifié", $partner);

        return $this->success(new PartnerResource($partner->fresh()), 'Partenaire mis à jour.');
    }

    public function destroy(Request $request, Partner $partner)
    {
        if ($partner->logo_path) {
            Storage::disk('public')->delete($partner->logo_path);
        }

        $name = $partner->name;
        $partner->delete();

        ActivityLog::record($request->user()->id, 'partner.deleted', "Partenaire « {$name} » supprimé");

        return $this->success(null, 'Partenaire supprimé.');
    }
}
