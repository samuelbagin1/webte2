<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['destination_id', 'month', 'temp_avg', 'temp_min', 'temp_max', 'precipitation_pct', 'wind_avg'])]
class MonthlyClimate extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'month'             => 'integer',
            'temp_avg'          => 'float',
            'temp_min'          => 'float',
            'temp_max'          => 'float',
            'precipitation_pct' => 'float',
            'wind_avg'          => 'float',
        ];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
