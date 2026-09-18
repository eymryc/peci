<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'regex:/^[0-9+() -]{8,20}$/'],
            'amount' => ['required', 'integer', 'min:1000'],
            'method' => ['nullable', 'string', 'in:orange_money,mtn_money,moov_money,wave,card'],
            'is_anonymous' => ['sometimes', 'boolean'],
        ];
    }
}
