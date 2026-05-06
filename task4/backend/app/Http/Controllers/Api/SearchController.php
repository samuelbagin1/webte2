<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchRequest;
use App\Models\Destination;
use App\Models\Search;
use App\Services\ScoringService;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function __invoke(
        SearchRequest $request,
        ScoringService $scoringService,
    ) {
        $data = $request->validated();
        $month = (int) $data['month'];
        $maxFlightHours = $data['max_flight_hours'] ?? null;

        $destinations = Destination::query()
            ->with([
                'country',
                'types',
                'monthlyClimates',
            ])
            ->whereHas(
                'types',
                fn ($query) => $query->whereIn('code', $data['trip_types']),
            )
            ->when(
                $maxFlightHours !== null,
                fn ($query) => $query->where('flight_hours_from_vienna', '<=', $maxFlightHours),
            )
            ->get();

        $results = $destinations
            ->map(function (Destination $destination) use ($data, $month, $scoringService): ?array {
                $score = $scoringService->score($destination, $data, $month);

                if ($score <= 0) {
                    return null;
                }

                return [
                    ...$this->toSearchResult($destination),
                    'match_score' => $score,
                    'reasons' => $scoringService->getMatchReasons($destination, $data, $month),
                ];
            })
            ->filter()
            ->sortByDesc('match_score')
            ->take(20)
            ->values();

        DB::transaction(function () use ($data, $results): void {
            $search = Search::query()->create([
                'trip_types' => $data['trip_types'],
                'temperature_pref' => $data['temperature_pref'],
                'max_flight_hours' => $data['max_flight_hours'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'month' => $data['month'],
            ]);

            $search->results()->createMany(
                $results
                    ->map(fn (array $result) => [
                        'destination_id' => $result['id'],
                        'match_score' => $result['match_score'],
                    ])
                    ->all(),
            );
        });

        return response()->json($results);
    }

    /**
     * @return array<string, mixed>
     */
    private function toSearchResult(Destination $destination): array
    {
        $country = $destination->country;

        return [
            'id' => $destination->id,
            'name' => $destination->name,
            'image_url' => $destination->image_url,
            'country' => [
                'id' => $country->id,
                'iso_code' => $country->iso_code,
                'name_sk' => $country->name_sk,
                'flag_url' => sprintf('https://www.geonames.org/flags/x/%s.gif', strtolower($country->iso_code)),
            ],
        ];
    }
}
