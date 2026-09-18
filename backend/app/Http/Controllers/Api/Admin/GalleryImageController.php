<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminGalleryImageRequest;
use App\Http\Resources\GalleryImageResource;
use App\Models\ActivityLog;
use App\Models\GalleryImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryImageController extends Controller
{
    public function index()
    {
        $images = GalleryImage::orderBy('order')->orderByDesc('created_at')->get();

        return $this->success(GalleryImageResource::collection($images));
    }

    public function store(AdminGalleryImageRequest $request)
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);
        $data['is_featured'] = $request->boolean('is_featured', false);
        $data['order'] = $data['order'] ?? ((GalleryImage::max('order') ?? -1) + 1);

        $data['image_path'] = $request->file('image')->store('gallery', 'public');
        unset($data['image']);

        $image = GalleryImage::create($data);

        ActivityLog::record($request->user()->id, 'gallery_image.created', 'Image ajoutée à la galerie', $image);

        return $this->success(new GalleryImageResource($image), 'Image ajoutée avec succès.', 201);
    }

    public function update(AdminGalleryImageRequest $request, GalleryImage $galleryImage)
    {
        $data = $request->validated();
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }
        if ($request->has('is_featured')) {
            $data['is_featured'] = $request->boolean('is_featured');
        }

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($galleryImage->image_path);
            $data['image_path'] = $request->file('image')->store('gallery', 'public');
        }
        unset($data['image']);

        $galleryImage->update($data);

        ActivityLog::record($request->user()->id, 'gallery_image.updated', 'Image de la galerie modifiée', $galleryImage);

        return $this->success(new GalleryImageResource($galleryImage->fresh()), 'Image mise à jour avec succès.');
    }

    public function destroy(Request $request, GalleryImage $galleryImage)
    {
        Storage::disk('public')->delete($galleryImage->image_path);
        $galleryImage->delete();

        ActivityLog::record($request->user()->id, 'gallery_image.deleted', 'Image supprimée de la galerie');

        return $this->success(null, 'Image supprimée avec succès.');
    }
}
