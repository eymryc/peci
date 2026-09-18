<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNewsRequest extends FormRequest
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
            'news_category_id' => ['nullable', 'exists:news_categories,id'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => [$required, 'string'],
            'author' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', Rule::in(['draft', 'published'])],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
