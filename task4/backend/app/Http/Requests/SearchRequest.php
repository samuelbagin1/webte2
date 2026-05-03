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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'trip_types.required' => 'Vyber aspoň jeden typ dovolenky.',
            'trip_types.array' => 'Typy dovolenky musia byť odoslané ako zoznam.',
            'trip_types.min' => 'Vyber aspoň jeden typ dovolenky.',
            'trip_types.*.in' => 'Vybraný typ dovolenky nie je platný.',
            'temperature_pref.required' => 'Vyber preferovanú teplotu.',
            'temperature_pref.in' => 'Vybraná teplota nie je platná.',
            'max_flight_hours.numeric' => 'Maximálny čas letu musí byť číslo.',
            'max_flight_hours.min' => 'Maximálny čas letu nemôže byť záporný.',
            'start_date.required' => 'Zadaj začiatok pobytu.',
            'start_date.date' => 'Začiatok pobytu musí byť platný dátum.',
            'end_date.required' => 'Zadaj koniec pobytu.',
            'end_date.date' => 'Koniec pobytu musí byť platný dátum.',
            'end_date.after_or_equal' => 'Koniec pobytu nemôže byť pred začiatkom.',
            'month.required' => 'Zadaj mesiac cesty.',
            'month.integer' => 'Mesiac musí byť celé číslo.',
            'month.between' => 'Mesiac musí byť od 1 do 12.',
        ];
    }
}
