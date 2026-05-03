<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Middleware\TrackVisit;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class VisitController extends Controller
{
    public function track(Request $request)
    {
        Visit::query()->create([
            'ip_hash' => TrackVisit::hashIp((string) $request->ip()),
            'visited_at' => Carbon::now(),
        ]);

        return response()->json(['tracked' => true], 201);
    }
}
