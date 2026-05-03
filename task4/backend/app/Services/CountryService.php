<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class CountryService
{
    /**
     * @return array<string, mixed>|null
     */
    public function getInfo(string $isoCode): ?array
    {
        $isoCode = strtoupper($isoCode);

        return Cache::remember("country:info:{$isoCode}", now()->addDay(), function () use ($isoCode): ?array {
            try {
                $response = Http::timeout(5)->get("https://restcountries.com/v3.1/alpha/{$isoCode}", [
                    'fields' => 'population,region,subregion,languages,timezones',
                ]);

                if (! $response->successful()) {
                    return null;
                }

                $country = $response->json('0');

                if (! is_array($country)) {
                    return null;
                }

                return [
                    'population' => $country['population'] ?? null,
                    'region' => $country['region'] ?? null,
                    'subregion' => $country['subregion'] ?? null,
                    'languages' => array_values($country['languages'] ?? []),
                    'timezones' => $country['timezones'] ?? [],
                ];
            } catch (Throwable) {
                return null;
            }
        });
    }
}
