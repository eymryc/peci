<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectDetailResource;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::query();

        if ($request->filled('region')) {
            $query->where('region', $request->string('region'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $projects = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 12));

        return $this->success([
            'items' => ProjectResource::collection($projects->items()),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $project = Project::where('slug', $slug)->with(['images', 'updates'])->firstOrFail();

        return $this->success(new ProjectDetailResource($project));
    }
}
