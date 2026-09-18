<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActionResource;
use App\Models\Action;

class ActionController extends Controller
{
    public function index()
    {
        $actions = Action::orderBy('order')->get();

        return $this->success(ActionResource::collection($actions));
    }

    public function show(string $slug)
    {
        $action = Action::where('slug', $slug)->firstOrFail();

        return $this->success(new ActionResource($action));
    }
}
