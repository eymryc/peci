<?php

namespace App\Http\Requests;

use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // `merge()` rend la clé "présente" même à null, ce qui casserait la
        // règle `sometimes` sur les champs non envoyés — on ne normalise que
        // ce qui a réellement été fourni.
        $merge = [];
        if ($this->has('telephone')) {
            $merge['telephone'] = $this->normalizePhone($this->input('telephone'));
        }
        if ($this->has('whatsapp')) {
            $merge['whatsapp'] = $this->normalizePhone($this->input('whatsapp'));
        }
        $this->merge($merge);
    }

    private function normalizePhone(?string $value): ?string
    {
        return $value ? preg_replace('/[^0-9+]/', '', $value) : $value;
    }

    public function rules(): array
    {
        /** @var Member $member */
        $member = $this->route('member');

        return [
            'nom' => ['sometimes', 'required', 'string', 'max:100'],
            'prenoms' => ['sometimes', 'required', 'string', 'max:150'],
            'date_naissance' => ['nullable', 'date', 'before:today'],
            'sexe' => ['nullable', 'in:M,F'],
            'telephone' => [
                'sometimes', 'required', 'string', 'regex:/^\+?[0-9]{8,15}$/',
                Rule::unique('members', 'telephone')->ignore($member->id)
                    ->where(fn ($q) => $q->where('status', '!=', Member::STATUS_REJECTED)),
            ],
            'whatsapp' => ['nullable', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($member->user_id)],
            'ville' => ['nullable', 'string', 'max:100'],
            'commune' => ['nullable', 'string', 'max:100'],
            'profession' => ['nullable', 'string', 'max:150'],
            'membership_type_id' => ['nullable', 'exists:membership_types,id'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:4096'],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['sometimes', Rule::in([
                Member::STATUS_PENDING,
                Member::STATUS_UNDER_REVIEW,
                Member::STATUS_APPROVED,
                Member::STATUS_REJECTED,
                Member::STATUS_SUSPENDED,
                Member::STATUS_EXPIRED,
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
