<?php

namespace App\Services;

use App\Models\Search;
use App\Models\SearchResult;
use App\Models\Visit;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StatsService
{
    /**
     * @return array{total: int, unique: int}
     */
    public function getVisits(): array
    {
        return [
            'total' => Visit::query()->count(),
            'unique' => Visit::query()
                ->where('visited_at', '>=', Carbon::now()->subHour())
                ->distinct('ip_hash')
                ->count('ip_hash'),
        ];
    }

    /**
     * @return array<string, int>
     */
    public function getHourlyDistribution(): array
    {
        $distribution = [
            '0-6' => 0,
            '6-15' => 0,
            '15-21' => 0,
            '21-24' => 0,
        ];

        Visit::query()
            ->select('visited_at')
            ->get()
            ->each(function (Visit $visit) use (&$distribution): void {
                $hour = (int) $visit->visited_at->format('G');

                if ($hour < 6) {
                    $distribution['0-6']++;
                } elseif ($hour < 15) {
                    $distribution['6-15']++;
                } elseif ($hour < 21) {
                    $distribution['15-21']++;
                } else {
                    $distribution['21-24']++;
                }
            });

        return $distribution;
    }

    /**
     * @return Collection<int, object>
     */
    public function getSearchedDestinations(string $sort, string $order): Collection
    {
        $sort = in_array($sort, ['name', 'country', 'count'], true) ? $sort : 'count';
        $order = strtolower($order) === 'asc' ? 'asc' : 'desc';

        $query = SearchResult::query()
            ->join('destinations', 'search_results.destination_id', '=', 'destinations.id')
            ->join('countries', 'destinations.country_id', '=', 'countries.id')
            ->select([
                'destinations.id',
                'destinations.name',
                'countries.name_sk as country',
                DB::raw('COUNT(*) as count'),
            ])
            ->groupBy('destinations.id', 'destinations.name', 'countries.name_sk');

        match ($sort) {
            'name' => $query->orderBy('destinations.name', $order),
            'country' => $query->orderBy('countries.name_sk', $order)->orderBy('destinations.name'),
            default => $query->orderBy('count', $order)->orderBy('destinations.name'),
        };

        return $query->get();
    }

    /**
     * @return array{types: array<string, int>, temperatures: array<string, int>}
     */
    public function getPreferenceStats(): array
    {
        $types = [];
        $temperatures = [];

        Search::query()
            ->select(['trip_types', 'temperature_pref'])
            ->get()
            ->each(function (Search $search) use (&$types, &$temperatures): void {
                foreach ($search->trip_types ?? [] as $type) {
                    $types[$type] = ($types[$type] ?? 0) + 1;
                }

                $temperature = $search->temperature_pref;
                $temperatures[$temperature] = ($temperatures[$temperature] ?? 0) + 1;
            });

        ksort($types);
        ksort($temperatures);

        return [
            'types' => $types,
            'temperatures' => $temperatures,
        ];
    }
}
