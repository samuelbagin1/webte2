<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Services\DestinationPayloadService;
use App\Services\LlmService;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    public function show(Request $request, Destination $destination, DestinationPayloadService $payloadService)
    {
        $validated = $request->validate([
            'month' => ['required', 'integer', 'between:1,12'],
        ], [
            'month.required' => 'Zadaj mesiac cesty.',
            'month.integer' => 'Mesiac musí byť celé číslo.',
            'month.between' => 'Mesiac musí byť od 1 do 12.',
        ]);

        return response()->json($payloadService->toArray($destination, (int) $validated['month']));
    }

    public function whyNow(Request $request, Destination $destination, LlmService $llmService)
    {
        $validated = $request->validate([
            'month' => ['required', 'integer', 'between:1,12'],
        ], [
            'month.required' => 'Zadaj mesiac cesty.',
            'month.integer' => 'Mesiac musí byť celé číslo.',
            'month.between' => 'Mesiac musí byť od 1 do 12.',
        ]);

        $month = (int) $validated['month'];

        return response()->json([
            'destination_id' => $destination->id,
            'month' => $month,
            'why_now' => $llmService->generateWhyNow($destination, $month),
        ]);
    }
}
