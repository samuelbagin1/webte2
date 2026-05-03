<?php

namespace App\Services;

use App\Models\Country;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class CurrencyService
{
    public function getRateFromEur(string $currency): ?float
    {
        $currency = strtoupper($currency);

        if ($currency === 'EUR') {
            return null;
        }

        $rates = $this->getRates();
        $rate = $rates[$currency] ?? null;

        return is_numeric($rate) ? (float) $rate : null;
    }

    /**
     * @return array<string, float>
     */
    private function getRates(): array
    {
        return Cache::remember('currency:rates:eur', now()->addHours(6), function (): array {
            $currencies = Country::query()
                ->whereNotNull('currency_code')
                ->where('currency_code', '!=', 'EUR')
                ->distinct()
                ->pluck('currency_code')
                ->map(fn (string $currency): string => strtoupper($currency))
                ->unique()
                ->values();

            if ($currencies->isEmpty()) {
                return [];
            }

            try {
                $response = Http::timeout(5)->get('https://api.frankfurter.app/latest', [
                    'from' => 'EUR',
                    'to' => $currencies->implode(','),
                ]);

                if (! $response->successful()) {
                    return [];
                }

                $rates = $response->json('rates');

                return is_array($rates) ? $rates : [];
            } catch (Throwable) {
                return [];
            }
        });
    }
}
