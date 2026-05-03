<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['ip_hash', 'visited_at'])]
class Visit extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'visited_at' => 'datetime',
        ];
    }
}
