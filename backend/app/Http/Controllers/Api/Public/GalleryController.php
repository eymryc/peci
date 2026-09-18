<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index(Request $request)
    {
        $query = GalleryImage::where('is_active', true)->orderBy('order')->orderByDesc('created_at');

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        return $this->success(GalleryImageResource::collection($query->get()));
    }
}
