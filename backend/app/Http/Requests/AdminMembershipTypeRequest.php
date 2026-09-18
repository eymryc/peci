<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminMembershipTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'duration_months' => ['nullable', 'integer', 'min:1', 'max:60'],
            'adhesion_fee' => ['required', 'integer', 'min:0'],
            'cotisation_fee' => ['required', 'integer', 'min:0'],
            'merchandise_items' => ['nullable', 'string', 'max:1000'],
            'card_eligible' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
