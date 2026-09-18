<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\InterventionCity;
use App\Models\Project;

class RegionController extends Controller
{
    public function index()
    {
        $stats = Project::query()
            ->selectRaw('region, COUNT(*) as projects_count, COALESCE(SUM(beneficiaries), 0) as beneficiaries_count')
            ->whereNotNull('region')
            ->groupBy('region')
            ->get()
            ->keyBy('region');

        $regions = InterventionCity::where('is_active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get()
            ->map(function (InterventionCity $city) use ($stats) {
                $stat = $stats->get($city->slug);

                return [
                    'slug' => $city->slug,
                    'name' => $city->name,
                    'projects_count' => $stat->projects_count ?? 0,
                    'beneficiaries_count' => (int) ($stat->beneficiaries_count ?? 0),
                ];
            });

        return $this->success($regions);
    }
}
