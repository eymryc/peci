<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActionRequest;
use App\Http\Resources\ActionResource;
use App\Models\Action;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ActionController extends Controller
{
    use GeneratesUniqueSlug;

    public function index()
    {
        return $this->success(ActionResource::collection(Action::orderBy('order')->get()));
    }

    public function store(StoreActionRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['title'], Action::class);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('actions', 'public');
        }

        $action = Action::create($data);

        ActivityLog::record($request->user()->id, 'action.created', "Action « {$action->title} » créée", $action);

        return $this->success(new ActionResource($action), 'Action créée avec succès.', 201);
    }

    public function update(StoreActionRequest $request, Action $action)
    {
        $data = $request->validated();

        if (isset($data['title']) && $data['title'] !== $action->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], Action::class, $action->id);
        }

        if ($request->hasFile('image')) {
            if ($action->image_path) {
                Storage::disk('public')->delete($action->image_path);
            }
            $data['image_path'] = $request->file('image')->store('actions', 'public');
        }

        $action->update($data);

        ActivityLog::record($request->user()->id, 'action.updated', "Action « {$action->title} » modifiée", $action);

        return $this->success(new ActionResource($action->fresh()), 'Action mise à jour.');
    }

    public function destroy(Request $request, Action $action)
    {
        if ($action->image_path) {
            Storage::disk('public')->delete($action->image_path);
        }

        $title = $action->title;
        $action->delete();

        ActivityLog::record($request->user()->id, 'action.deleted', "Action « {$title} » supprimée");

        return $this->success(null, 'Action supprimée.');
    }
}
