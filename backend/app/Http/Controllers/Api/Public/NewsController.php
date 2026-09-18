<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsResource;
use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = News::query()->where('status', News::STATUS_PUBLISHED)->with('category');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        }

        $news = $query->orderByDesc('published_at')->paginate($request->integer('per_page', 12));

        return $this->success([
            'items' => NewsResource::collection($news->items()),
            'pagination' => [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'total' => $news->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $article = News::where('slug', $slug)
            ->where('status', News::STATUS_PUBLISHED)
            ->with('category')
            ->firstOrFail();

        return $this->success(new NewsResource($article));
    }
}
