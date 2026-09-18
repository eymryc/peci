<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::where('key', 'like', 'public_%')
            ->get()
            ->mapWithKeys(fn (Setting $setting) => [
                $setting->key => match ($setting->type) {
                    'integer' => (int) $setting->value,
                    'boolean' => (bool) $setting->value,
                    'json' => json_decode($setting->value, true),
                    default => $setting->value,
                },
            ]);

        return $this->success($settings);
    }
}
