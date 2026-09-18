<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['sometimes', 'string', 'max:100'],
            'prenoms' => ['sometimes', 'string', 'max:150'],
            'telephone' => ['sometimes', 'string', 'regex:/^[0-9+() -]{8,20}$/'],
            'whatsapp' => ['nullable', 'string', 'regex:/^[0-9+() -]{8,20}$/'],
            'ville' => ['nullable', 'string', 'max:100'],
            'commune' => ['nullable', 'string', 'max:100'],
            'profession' => ['nullable', 'string', 'max:150'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
        ];
    }
}
