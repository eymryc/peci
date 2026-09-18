<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = in_array($this->method(), ['PUT', 'PATCH']);
        $required = $isUpdate ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'max:255'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'description' => [$required, 'string'],
            'location' => ['nullable', 'string', 'max:150'],
            'region' => ['nullable', 'string', 'max:100'],
            'objective' => ['nullable', 'string'],
            'budget' => ['nullable', 'integer', 'min:0'],
            'beneficiaries' => ['nullable', 'integer', 'min:0'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['nullable', Rule::in(['planned', 'ongoing', 'completed', 'suspended'])],
            'partners' => ['nullable', 'array'],
            'partners.*' => ['string'],
            'results' => ['nullable', 'array'],
            'results.*' => ['string'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
        ];
    }
}
