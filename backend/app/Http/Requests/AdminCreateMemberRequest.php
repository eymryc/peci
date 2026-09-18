<?php

namespace App\Http\Requests;

use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminCreateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'telephone' => $this->normalizePhone($this->input('telephone')),
            'whatsapp' => $this->normalizePhone($this->input('whatsapp')),
        ]);
    }

    private function normalizePhone(?string $value): ?string
    {
        return $value ? preg_replace('/[^0-9+]/', '', $value) : $value;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:100'],
            'prenoms' => ['required', 'string', 'max:150'],
            'date_naissance' => ['nullable', 'date', 'before:today'],
            'sexe' => ['nullable', 'in:M,F'],
            'telephone' => [
                'required', 'string', 'regex:/^\+?[0-9]{8,15}$/',
                Rule::unique('members', 'telephone')->where(fn ($q) => $q->where('status', '!=', Member::STATUS_REJECTED)),
            ],
            'whatsapp' => ['nullable', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'ville' => ['nullable', 'string', 'max:100'],
            'commune' => ['nullable', 'string', 'max:100'],
            'profession' => ['nullable', 'string', 'max:150'],
            'membership_type_id' => ['nullable', 'exists:membership_types,id'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['nullable', Rule::in([
                Member::STATUS_PENDING,
                Member::STATUS_UNDER_REVIEW,
                Member::STATUS_APPROVED,
            ])],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'telephone.regex' => 'Le numéro de téléphone est invalide.',
            'telephone.unique' => 'Ce numéro de téléphone est déjà associé à un membre PECI.',
        ];
    }
}
