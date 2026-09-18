<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResourceRequest extends FormRequest
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
            'resource_category_id' => ['nullable', 'exists:resource_categories,id'],
            'type' => [$required, Rule::in(['pdf', 'guide', 'fiche', 'document', 'video', 'publication'])],
            'file' => [$isUpdate ? 'nullable' : 'required', 'file', 'max:20480'],
            'description' => ['nullable', 'string'],
        ];
    }
}
