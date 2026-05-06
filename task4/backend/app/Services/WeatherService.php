<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class WeatherService
{
    /**
     * @var array<int, array{icon: string, description: string}>
     */
    private const WEATHER_CODES = [
        0 => ['icon' => 'sun', 'description' => 'Jasná obloha'],
        1 => ['icon' => 'sun', 'description' => 'Prevažne jasno'],
        2 => ['icon' => 'cloud-sun', 'description' => 'Čiastočne oblačno'],
        3 => ['icon' => 'cloud', 'description' => 'Zamračené'],
        45 => ['icon' => 'cloud-fog', 'description' => 'Hmla'],
        48 => ['icon' => 'cloud-fog', 'description' => 'Námrazová hmla'],
        51 => ['icon' => 'cloud-drizzle', 'description' => 'Slabé mrholenie'],
        53 => ['icon' => 'cloud-drizzle', 'description' => 'Mrholenie'],
        55 => ['icon' => 'cloud-drizzle', 'description' => 'Silné mrholenie'],
        56 => ['icon' => 'cloud-drizzle', 'description' => 'Slabé mrznúce mrholenie'],
        57 => ['icon' => 'cloud-drizzle', 'description' => 'Silné mrznúce mrholenie'],
        61 => ['icon' => 'cloud-rain', 'description' => 'Slabý dážď'],
        63 => ['icon' => 'cloud-rain', 'description' => 'Dážď'],
        65 => ['icon' => 'cloud-rain', 'description' => 'Silný dážď'],
        66 => ['icon' => 'cloud-rain', 'description' => 'Slabý mrznúci dážď'],
        67 => ['icon' => 'cloud-rain', 'description' => 'Silný mrznúci dážď'],
        71 => ['icon' => 'cloud-snow', 'description' => 'Slabé sneženie'],
        73 => ['icon' => 'cloud-snow', 'description' => 'Sneženie'],
        75 => ['icon' => 'cloud-snow', 'description' => 'Silné sneženie'],
        77 => ['icon' => 'snowflake', 'description' => 'Snehové zrná'],
        80 => ['icon' => 'cloud-rain', 'description' => 'Slabé prehánky'],
        81 => ['icon' => 'cloud-rain', 'description' => 'Prehánky'],
        82 => ['icon' => 'cloud-rain-wind', 'description' => 'Silné prehánky'],
        85 => ['icon' => 'cloud-snow', 'description' => 'Slabé snehové prehánky'],
        86 => ['icon' => 'cloud-snow', 'description' => 'Silné snehové prehánky'],
        95 => ['icon' => 'cloud-lightning', 'description' => 'Búrka'],
        96 => ['icon' => 'cloud-lightning', 'description' => 'Búrka so slabým krupobitím'],
        99 => ['icon' => 'cloud-lightning', 'description' => 'Búrka so silným krupobitím'],
    ];

    /**
     * @var array<int, array{name: string, lat: float, lon: float}>
     */
    private const HUBS = [
        ['name' => 'Madrid', 'lat' => 40.4168, 'lon' => -3.7038],
        ['name' => 'Rím', 'lat' => 41.9028, 'lon' => 12.4964],
        ['name' => 'Atény', 'lat' => 37.9838, 'lon' => 23.7275],
        ['name' => 'Istanbul', 'lat' => 41.0082, 'lon' => 28.9784],
        ['name' => 'Dubaj', 'lat' => 25.2048, 'lon' => 55.2708],
    ];

    /**
     * @return array<string, mixed>
     */
    public function getCurrent(float $lat, float $lon): array
    {
        $key = sprintf('weather:current:%s:%s', round($lat, 3), round($lon, 3));

        $cached = Cache::get($key);

        if (is_array($cached)) {
            return $cached;
        }

        $current = $this->fetchCurrent($lat, $lon);

        if ($current !== null) {
            $weather = $current + ['source' => 'open_meteo'];
            Cache::put($key, $weather, now()->addHour());

            return $weather;
        }

        $hub = $this->nearestHub($lat, $lon);
        $fallback = $this->fetchCurrent($hub['lat'], $hub['lon']);

        if ($fallback !== null) {
            $weather = $fallback + [
                'source' => 'open_meteo_hub',
                'fallback_hub' => $hub['name'],
            ];
            Cache::put($key, $weather, now()->addMinutes(5));

            return $weather;
        }

        $weather = $this->offlineFallback($hub['name']);
        Cache::put($key, $weather, now()->addMinutes(5));

        return $weather;
    }

    /**
     * @return array{icon: string, description: string}
     */
    public function describeCode(?int $code): array
    {
        return self::WEATHER_CODES[$code] ?? [
            'icon' => 'cloud-sun',
            'description' => 'Počasie je momentálne nedostupné',
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function fetchCurrent(float $lat, float $lon): ?array
    {
        try {
            $response = Http::timeout(5)->get('https://api.open-meteo.com/v1/forecast', [
                'latitude' => $lat,
                'longitude' => $lon,
                'current' => 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
                'timezone' => 'auto',
            ]);

            if (! $response->successful()) {
                return null;
            }

            $current = $response->json('current');

            if (! is_array($current)) {
                return null;
            }

            $code = isset($current['weather_code']) ? (int) $current['weather_code'] : null;
            $description = $this->describeCode($code);

            return [
                'temperature' => $current['temperature_2m'] ?? null,
                'humidity' => $current['relative_humidity_2m'] ?? null,
                'wind_speed' => $current['wind_speed_10m'] ?? null,
                'weather_code' => $code,
                'icon' => $description['icon'],
                'description_sk' => $description['description'],
                'observed_at' => $current['time'] ?? null,
            ];
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @return array{name: string, lat: float, lon: float}
     */
    private function nearestHub(float $lat, float $lon): array
    {
        return collect(self::HUBS)
            ->sortBy(fn (array $hub): float => $this->distance($lat, $lon, $hub['lat'], $hub['lon']))
            ->first();
    }

    private function distance(float $fromLat, float $fromLon, float $toLat, float $toLon): float
    {
        return (($fromLat - $toLat) ** 2) + (($fromLon - $toLon) ** 2);
    }

    /**
     * @return array<string, mixed>
     */
    private function offlineFallback(string $hub): array
    {
        $description = $this->describeCode(null);

        return [
            'temperature' => null,
            'humidity' => null,
            'wind_speed' => null,
            'weather_code' => null,
            'icon' => $description['icon'],
            'description_sk' => $description['description'],
            'observed_at' => null,
            'source' => 'offline_fallback',
            'fallback_hub' => $hub,
        ];
    }
}
