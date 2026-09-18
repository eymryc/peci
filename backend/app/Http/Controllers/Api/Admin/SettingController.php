<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Http\Requests\UploadSettingImageRequest;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::orderBy('key')->get(['key', 'value', 'type'])->map(fn (Setting $s) => [
            'key' => $s->key,
            'type' => $s->type,
            'value' => match ($s->type) {
                'integer' => (int) $s->value,
                'boolean' => (bool) $s->value,
                'json' => json_decode($s->value, true),
                default => $s->value,
            },
        ]);

        return $this->success($settings);
    }

    public function update(UpdateSettingsRequest $request)
    {
        $existing = Setting::whereIn('key', collect($request->validated('settings'))->pluck('key'))
            ->get()
            ->keyBy('key');

        foreach ($request->validated('settings') as $item) {
            $setting = $existing->get($item['key']);
            $type = $setting?->type ?? 'string';

            $value = match ($type) {
                'integer' => (string) max(0, (int) $item['value']),
                'boolean' => $item['value'] ? '1' : '0',
                'json' => is_array($item['value']) ? json_encode($item['value']) : $item['value'],
                default => (string) $item['value'],
            };

            Setting::set($item['key'], $value, $type);
        }

        ActivityLog::record($request->user()->id, 'settings.updated', 'Paramètres mis à jour ('.count($request->validated('settings')).' clés)');

        return $this->success(null, 'Paramètres mis à jour avec succès.');
    }

    public function uploadImage(UploadSettingImageRequest $request)
    {
        $key = $request->validated('key');
        $setting = Setting::where('key', $key)->first();

        if (! $setting || $setting->type !== 'image') {
            return $this->error("Ce paramètre n'accepte pas d'image.", 422);
        }

        if ($setting->value && ! str_starts_with($setting->value, '/images/')) {
            Storage::disk('public')->delete($setting->value);
        }

        $path = $request->file('image')->store('settings', 'public');
        $url = Storage::disk('public')->url($path);

        Setting::set($key, $url, 'image');

        ActivityLog::record($request->user()->id, 'settings.image_uploaded', "Image du paramètre « {$key} » mise à jour");

        return $this->success(['key' => $key, 'value' => $url], 'Image mise à jour avec succès.');
    }
}
