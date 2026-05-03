<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'country_id',
    'latitude',
    'longitude',
    'flight_hours_from_vienna',
    'description_sk',
    'image_url',
])]
class Destination extends Model
{
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'flight_hours_from_vienna' => 'float',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function types(): BelongsToMany
    {
        return $this->belongsToMany(DestinationType::class);
    }

    public function monthlyClimates(): HasMany
    {
        return $this->hasMany(MonthlyClimate::class);
    }
}
