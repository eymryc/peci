<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\MemberResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $member = $request->user()->member()->with('membershipType')->firstOrFail();

        return $this->success(new MemberResource($member));
    }

    public function update(UpdateProfileRequest $request)
    {
        $member = $request->user()->member()->firstOrFail();
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store("members/{$member->id}", 'local');
        }

        $member->update($data);

        return $this->success(new MemberResource($member->fresh('membershipType')), 'Profil mis à jour.');
    }
}
