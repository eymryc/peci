<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\MembershipType;

class MembershipTypeController extends Controller
{
    public function index()
    {
        $types = MembershipType::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'adhesion_fee', 'cotisation_fee']);

        return $this->success($types);
    }
}
