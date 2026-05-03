<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompareRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->query('ids'))) {
            $this->merge([
                'ids' => array_values(array_filter(explode(',', $this->query('ids')), fn (string $id) => $id !== '')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'size:2'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:destinations,id'],
            'month' => ['required', 'integer', 'between:1,12'],
        ];
    }
}
