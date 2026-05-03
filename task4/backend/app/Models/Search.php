<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['trip_types', 'temperature_pref', 'max_flight_hours', 'start_date', 'end_date', 'month'])]
class Search extends Model
{
    protected function casts(): array
    {
        return [
            'trip_types' => 'array',
            'max_flight_hours' => 'float',
            'start_date' => 'date',
            'end_date' => 'date',
            'month' => 'integer',
        ];
    }

    public function results(): HasMany
    {
        return $this->hasMany(SearchResult::class);
    }
}
