<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StatsService;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function visits(StatsService $statsService)
    {
        return response()->json($statsService->getVisits());
    }

    public function hourly(StatsService $statsService)
    {
        return response()->json($statsService->getHourlyDistribution());
    }

    public function searches(Request $request, StatsService $statsService)
    {
        $data = $request->validate([
            'sort' => ['sometimes', 'in:name,country,count'],
            'order' => ['sometimes', 'in:asc,desc'],
        ], [
            'sort.in' => 'Zvolený stĺpec radenia nie je platný.',
            'order.in' => 'Smer radenia musí byť vzostupný alebo zostupný.',
        ]);

        return response()->json($statsService->getSearchedDestinations(
            $data['sort'] ?? 'count',
            $data['order'] ?? 'desc',
        ));
    }

    public function preferences(StatsService $statsService)
    {
        return response()->json($statsService->getPreferenceStats());
    }
}
