<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompareRequest;
use App\Models\Destination;
use App\Services\DestinationPayloadService;

class CompareController extends Controller
{
    public function __invoke(CompareRequest $request, DestinationPayloadService $payloadService)
    {
        $data = $request->validated();
        $month = (int) $data['month'];
        $ids = array_map('intval', $data['ids']);

        $destinations = Destination::query()
            ->with(['country', 'types', 'monthlyClimates'])
            ->whereIn('id', $ids)
            ->get()
            ->sortBy(fn (Destination $destination) => array_search($destination->id, $ids, true))
            ->values()
            ->map(fn (Destination $destination) => $payloadService->toArray($destination, $month));

        return response()->json([
            'destinations' => $destinations,
        ]);
    }
}
