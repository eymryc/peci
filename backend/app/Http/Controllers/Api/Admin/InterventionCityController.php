<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminInterventionCityRequest;
use App\Models\ActivityLog;
use App\Models\InterventionCity;
use App\Models\Project;
use Illuminate\Http\Request;

class InterventionCityController extends Controller
{
    use GeneratesUniqueSlug;

    public function index()
    {
        $stats = Project::query()
            ->selectRaw('region, COUNT(*) as projects_count, COALESCE(SUM(beneficiaries), 0) as beneficiaries_count')
            ->whereNotNull('region')
            ->groupBy('region')
            ->get()
            ->keyBy('region');

        $cities = InterventionCity::orderBy('order')->orderBy('name')->get()->map(function (InterventionCity $city) use ($stats) {
            $stat = $stats->get($city->slug);

            return [
                'id' => $city->id,
                'name' => $city->name,
                'slug' => $city->slug,
                'order' => $city->order,
                'is_active' => $city->is_active,
                'projects_count' => (int) ($stat->projects_count ?? 0),
                'beneficiaries_count' => (int) ($stat->beneficiaries_count ?? 0),
            ];
        });

        return $this->success($cities);
    }

    public function store(AdminInterventionCityRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name'], InterventionCity::class);
        $data['order'] = $data['order'] ?? ((InterventionCity::max('order') ?? -1) + 1);

        $city = InterventionCity::create($data);

        ActivityLog::record($request->user()->id, 'intervention_city.created', "Ville d'intervention « {$city->name} » créée");

        return $this->success($city, "Ville d'intervention créée avec succès.", 201);
    }

    public function update(AdminInterventionCityRequest $request, InterventionCity $interventionCity)
    {
        $data = $request->validated();

        if ($data['name'] !== $interventionCity->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], InterventionCity::class, $interventionCity->id);
        }

        $interventionCity->update($data);

        ActivityLog::record($request->user()->id, 'intervention_city.updated', "Ville d'intervention « {$interventionCity->name} » modifiée");

        return $this->success($interventionCity, "Ville d'intervention mise à jour avec succès.");
    }

    public function destroy(Request $request, InterventionCity $interventionCity)
    {
        $name = $interventionCity->name;
        $interventionCity->delete();

        ActivityLog::record($request->user()->id, 'intervention_city.deleted', "Ville d'intervention « {$name} » supprimée");

        return $this->success(null, "Ville d'intervention supprimée avec succès.");
    }
}
