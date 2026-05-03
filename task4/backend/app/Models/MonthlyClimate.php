<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['destination_id', 'month', 'temp_avg', 'temp_min', 'temp_max'])]
class MonthlyClimate extends Model
{
    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'temp_avg' => 'float',
            'temp_min' => 'float',
            'temp_max' => 'float',
        ];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
