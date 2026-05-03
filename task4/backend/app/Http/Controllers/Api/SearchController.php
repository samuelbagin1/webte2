<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchRequest;
use App\Models\Destination;
use App\Models\Search;
use App\Services\DestinationPayloadService;
use App\Services\ScoringService;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function __invoke(
        SearchRequest $request,
        ScoringService $scoringService,
        DestinationPayloadService $payloadService,
    ) {
        $data = $request->validated();
        $month = (int) $data['month'];

        $destinations = Destination::query()
            ->with(['country', 'types', 'monthlyClimates'])
            ->get();

        $results = $destinations
            ->map(function (Destination $destination) use ($data, $month, $scoringService, $payloadService): ?array {
                $score = $scoringService->score($destination, $data, $month);

                if ($score <= 0) {
                    return null;
                }

                return [
                    ...$payloadService->toArray($destination, $month),
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
}
