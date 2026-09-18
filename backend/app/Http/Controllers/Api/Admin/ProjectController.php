<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Resources\ProjectDetailResource;
use App\Http\Resources\ProjectResource;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\ProjectUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    use GeneratesUniqueSlug;

    public function index(Request $request)
    {
        $query = Project::query()->with(['images', 'updates']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('q')) {
            $query->where('title', 'like', '%'.$request->string('q').'%');
        }

        $projects = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => ProjectResource::collection($projects->items()),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    public function show(Project $project)
    {
        return $this->success(new ProjectDetailResource($project->load(['images', 'updates'])));
    }

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['title'], Project::class);

        if ($request->hasFile('cover_image')) {
            $data['cover_image_path'] = $request->file('cover_image')->store('projects', 'public');
        }

        $project = Project::create($data);

        ActivityLog::record($request->user()->id, 'project.created', "Projet « {$project->title} » créé", $project);

        return $this->success(new ProjectDetailResource($project), 'Projet créé avec succès.', 201);
    }

    public function update(StoreProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        if (isset($data['title']) && $data['title'] !== $project->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], Project::class, $project->id);
        }

        if ($request->hasFile('cover_image')) {
            if ($project->cover_image_path) {
                Storage::disk('public')->delete($project->cover_image_path);
            }
            $data['cover_image_path'] = $request->file('cover_image')->store('projects', 'public');
        }

        $project->update($data);

        ActivityLog::record($request->user()->id, 'project.updated', "Projet « {$project->title} » modifié", $project);

        return $this->success(new ProjectDetailResource($project->fresh(['images', 'updates'])), 'Projet mis à jour.');
    }

    public function destroy(Request $request, Project $project)
    {
        if ($project->cover_image_path) {
            Storage::disk('public')->delete($project->cover_image_path);
        }

        $title = $project->title;
        $project->delete();

        ActivityLog::record($request->user()->id, 'project.deleted', "Projet « {$title} » supprimé");

        return $this->success(null, 'Projet supprimé.');
    }

    public function storeImage(Request $request, Project $project)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'caption' => ['nullable', 'string', 'max:255'],
        ]);

        $image = ProjectImage::create([
            'project_id' => $project->id,
            'path' => $request->file('image')->store('projects/gallery', 'public'),
            'caption' => $request->input('caption'),
            'order' => $project->images()->max('order') + 1,
        ]);

        return $this->success([
            'id' => $image->id,
            'url' => Storage::disk('public')->url($image->path),
            'caption' => $image->caption,
            'order' => $image->order,
        ], 'Image ajoutée.', 201);
    }

    public function destroyImage(Project $project, ProjectImage $image)
    {
        abort_if($image->project_id !== $project->id, 404);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return $this->success(null, 'Image supprimée.');
    }

    public function storeUpdate(Request $request, Project $project)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'date' => ['required', 'date'],
        ]);

        $update = $project->updates()->create($data);

        return $this->success($update, 'Étape ajoutée.', 201);
    }

    public function destroyUpdate(Project $project, ProjectUpdate $update)
    {
        abort_if($update->project_id !== $project->id, 404);

        $update->delete();

        return $this->success(null, 'Étape supprimée.');
    }
}
