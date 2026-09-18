<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MembershipPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['adhesion', 'cotisation'])],
            'period' => ['required_if:type,cotisation', 'nullable', 'date_format:Y-m'],
            'method' => ['required', Rule::in(['orange_money', 'mtn_money', 'moov_money', 'wave', 'card'])],
        ];
    }
}
