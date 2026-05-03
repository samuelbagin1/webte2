<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['iso_code', 'name_sk', 'capital', 'currency_code'])]
class Country extends Model
{
    public function destinations(): HasMany
    {
        return $this->hasMany(Destination::class);
    }
}
