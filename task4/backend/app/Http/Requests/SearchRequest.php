<?php

namespace App\Http\Requests;

use App\Models\DestinationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $typeCodes = DestinationType::query()->pluck('code')->all();

        return [
            'trip_types' => ['required', 'array', 'min:1'],
            'trip_types.*' => ['required', 'string', Rule::in($typeCodes)],
            'temperature_pref' => ['required', Rule::in(['hot', 'warm', 'mild', 'any'])],
            'max_flight_hours' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'month' => ['required', 'integer', 'between:1,12'],
        ];
    }
}
