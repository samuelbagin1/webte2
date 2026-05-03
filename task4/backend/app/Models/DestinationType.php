<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['code', 'name_sk'])]
class DestinationType extends Model
{
    public function destinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class);
    }
}
