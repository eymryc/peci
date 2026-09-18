<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminMembershipTypeRequest;
use App\Models\ActivityLog;
use App\Models\MembershipType;
use Illuminate\Http\Request;

class MembershipTypeController extends Controller
{
    use GeneratesUniqueSlug;

    public function index()
    {
        return $this->success(
            MembershipType::withCount('members')->orderBy('name')->get()
        );
    }

    public function store(AdminMembershipTypeRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name'], MembershipType::class);

        $type = MembershipType::create($data);

        ActivityLog::record($request->user()->id, 'membership_type.created', "Type d'adhésion « {$type->name} » créé");

        return $this->success($type, "Type d'adhésion créé avec succès.", 201);
    }

    public function update(AdminMembershipTypeRequest $request, MembershipType $membershipType)
    {
        $data = $request->validated();

        if ($data['name'] !== $membershipType->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], MembershipType::class, $membershipType->id);
        }

        $membershipType->update($data);

        ActivityLog::record($request->user()->id, 'membership_type.updated', "Type d'adhésion « {$membershipType->name} » modifié");

        return $this->success($membershipType, "Type d'adhésion mis à jour avec succès.");
    }

    public function destroy(Request $request, MembershipType $membershipType)
    {
        if ($membershipType->members()->exists()) {
            return $this->error("Ce type d'adhésion est utilisé par des membres et ne peut pas être supprimé.", 422);
        }

        $name = $membershipType->name;
        $membershipType->delete();

        ActivityLog::record($request->user()->id, 'membership_type.deleted', "Type d'adhésion « {$name} » supprimé");

        return $this->success(null, "Type d'adhésion supprimé avec succès.");
    }
}
