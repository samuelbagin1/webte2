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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Vyber presne dve destinácie na porovnanie.',
            'ids.array' => 'Destinácie na porovnanie musia byť odoslané ako zoznam.',
            'ids.size' => 'Na porovnanie vyber presne dve destinácie.',
            'ids.*.required' => 'Chýba destinácia na porovnanie.',
            'ids.*.integer' => 'Identifikátor destinácie musí byť celé číslo.',
            'ids.*.distinct' => 'Na porovnanie vyber dve rôzne destinácie.',
            'ids.*.exists' => 'Jedna z vybraných destinácií neexistuje.',
            'month.required' => 'Zadaj mesiac porovnania.',
            'month.integer' => 'Mesiac musí byť celé číslo.',
            'month.between' => 'Mesiac musí byť od 1 do 12.',
        ];
    }
}
