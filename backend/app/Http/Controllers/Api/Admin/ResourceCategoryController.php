<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Models\ResourceCategory;
use Illuminate\Http\Request;

class ResourceCategoryController extends Controller
{
    use GeneratesUniqueSlug;

    public function index()
    {
        return $this->success(ResourceCategory::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100']]);
        $data['slug'] = $this->uniqueSlug($data['name'], ResourceCategory::class);

        $category = ResourceCategory::create($data);

        return $this->success($category, 'Catégorie créée.', 201);
    }

    public function destroy(ResourceCategory $resourceCategory)
    {
        if ($resourceCategory->resources()->exists()) {
            return $this->error('Impossible de supprimer une catégorie utilisée par des ressources.', 422);
        }

        $resourceCategory->delete();

        return $this->success(null, 'Catégorie supprimée.');
    }
}
