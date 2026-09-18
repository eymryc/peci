<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Models\NewsCategory;
use Illuminate\Http\Request;

class NewsCategoryController extends Controller
{
    use GeneratesUniqueSlug;

    public function index()
    {
        return $this->success(NewsCategory::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100']]);
        $data['slug'] = $this->uniqueSlug($data['name'], NewsCategory::class);

        $category = NewsCategory::create($data);

        return $this->success($category, 'Catégorie créée.', 201);
    }

    public function destroy(NewsCategory $newsCategory)
    {
        if ($newsCategory->news()->exists()) {
            return $this->error('Impossible de supprimer une catégorie utilisée par des actualités.', 422);
        }

        $newsCategory->delete();

        return $this->success(null, 'Catégorie supprimée.');
    }
}
