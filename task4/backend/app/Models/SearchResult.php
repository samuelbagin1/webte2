<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['search_id', 'destination_id', 'match_score'])]
class SearchResult extends Model
{
    protected function casts(): array
    {
        return [
            'match_score' => 'float',
        ];
    }

    public function search(): BelongsTo
    {
        return $this->belongsTo(Search::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
