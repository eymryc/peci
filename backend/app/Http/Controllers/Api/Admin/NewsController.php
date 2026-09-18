<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\ActivityLog;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request)
    {
        $query = News::query()->with('category');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('q')) {
            $query->where('title', 'like', '%'.$request->string('q').'%');
        }

        $news = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => NewsResource::collection($news->items()),
            'pagination' => [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'total' => $news->total(),
            ],
        ]);
    }

    public function show(News $article)
    {
        return $this->success(new NewsResource($article->load('category')));
    }

    public function store(StoreNewsRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['title'], News::class);
        $data['status'] = $data['status'] ?? News::STATUS_DRAFT;

        if ($data['status'] === News::STATUS_PUBLISHED && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('news', 'public');
        }

        $article = News::create($data);

        ActivityLog::record($request->user()->id, 'news.created', "Actualité « {$article->title} » créée", $article);

        return $this->success(new NewsResource($article), 'Actualité créée avec succès.', 201);
    }

    public function update(StoreNewsRequest $request, News $article)
    {
        $data = $request->validated();

        if (isset($data['title']) && $data['title'] !== $article->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], News::class, $article->id);
        }

        if (($data['status'] ?? $article->status) === News::STATUS_PUBLISHED && ! $article->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        if ($request->hasFile('image')) {
            if ($article->image_path) {
                Storage::disk('public')->delete($article->image_path);
            }
            $data['image_path'] = $request->file('image')->store('news', 'public');
        }

        $article->update($data);

        ActivityLog::record($request->user()->id, 'news.updated', "Actualité « {$article->title} » modifiée", $article);

        return $this->success(new NewsResource($article->fresh('category')), 'Actualité mise à jour.');
    }

    public function destroy(Request $request, News $article)
    {
        if ($article->image_path) {
            Storage::disk('public')->delete($article->image_path);
        }

        $title = $article->title;
        $article->delete();

        ActivityLog::record($request->user()->id, 'news.deleted', "Actualité « {$title} » supprimée");

        return $this->success(null, 'Actualité supprimée.');
    }
}
