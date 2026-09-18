<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResourceFileResource;
use App\Models\Resource;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = Resource::query()->with('category');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        }

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

    public function download(Resource $resource)
    {
        $resource->increment('downloads_count');

        return $this->success(['downloads_count' => $resource->downloads_count]);
    }
}
