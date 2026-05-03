<?php

use App\Http\Controllers\Api\CompareController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\VisitController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

Route::post('/search', SearchController::class);
Route::get('/destinations/{destination}', [DestinationController::class, 'show']);
Route::get('/destinations/{destination}/why-now', [DestinationController::class, 'whyNow']);
Route::get('/compare', CompareController::class);

Route::get('/stats/visits', [StatsController::class, 'visits']);
Route::get('/stats/hourly', [StatsController::class, 'hourly']);
Route::get('/stats/searches', [StatsController::class, 'searches']);
Route::get('/stats/preferences', [StatsController::class, 'preferences']);

Route::post('/visits/track', [VisitController::class, 'track']);
