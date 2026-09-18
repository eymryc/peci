<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResourceRequest;
use App\Http\Resources\ResourceFileResource;
use App\Models\ActivityLog;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = Resource::query()->with('category');

        if ($request->filled('q')) {
            $query->where('title', 'like', '%'.$request->string('q').'%');
        }

        $resources = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => ResourceFileResource::collection($resources->items()),
            'pagination' => [
                'current_page' => $resources->currentPage(),
                'last_page' => $resources->lastPage(),
                'total' => $resources->total(),
            ],
        ]);
    }

    public function store(StoreResourceRequest $request)
    {
        $data = $request->validated();
        $data['file_path'] = $request->file('file')->store('resources', 'public');

        $resource = Resource::create($data);

        ActivityLog::record($request->user()->id, 'resource.created', "Ressource « {$resource->title} » créée", $resource);

        return $this->success(new ResourceFileResource($resource), 'Ressource créée avec succès.', 201);
    }

    public function update(StoreResourceRequest $request, Resource $resource)
    {
        $data = $request->validated();

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($resource->file_path);
            $data['file_path'] = $request->file('file')->store('resources', 'public');
        }

        $resource->update($data);

        ActivityLog::record($request->user()->id, 'resource.updated', "Ressource « {$resource->title} » modifiée", $resource);

        return $this->success(new ResourceFileResource($resource->fresh('category')), 'Ressource mise à jour.');
    }

    public function destroy(Request $request, Resource $resource)
    {
        Storage::disk('public')->delete($resource->file_path);

        $title = $resource->title;
        $resource->delete();

        ActivityLog::record($request->user()->id, 'resource.deleted', "Ressource « {$title} » supprimée");

        return $this->success(null, 'Ressource supprimée.');
    }
}
