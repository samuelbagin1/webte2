<?php

namespace App\Services;

use App\Models\Destination;

class DestinationPayloadService
{
    public function __construct(
        private readonly CurrencyService $currencyService,
        private readonly WeatherService $weatherService,
        private readonly CountryService $countryService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(Destination $destination, int $month): array
    {
        $destination->loadMissing(['country', 'types', 'monthlyClimates']);

        $country = $destination->country;
        $climate = $destination->monthlyClimates->firstWhere('month', $month);

        return [
            'id'                       => $destination->id,
            'name'                     => $destination->name,
            'latitude'                 => $destination->latitude,
            'longitude'                => $destination->longitude,
            'flight_hours_from_vienna' => $destination->flight_hours_from_vienna,
            'description_sk'           => $destination->description_sk,
            'image_url'                => $destination->image_url,
            'country' => [
                'id'            => $country->id,
                'iso_code'      => $country->iso_code,
                'name_sk'       => $country->name_sk,
                'capital'       => $country->capital,
                'currency_code' => $country->currency_code,
                'flag_url'      => sprintf('https://www.geonames.org/flags/x/%s.gif', strtolower($country->iso_code)),
                'external_info' => $this->countryService->getInfo($country->iso_code),
            ],
            'types' => $destination->types
                ->map(fn ($type) => [
                    'code'    => $type->code,
                    'name_sk' => $type->name_sk,
                ])
                ->values()
                ->all(),
            'monthly_climate' => $climate === null ? null : [
                'month'             => $climate->month,
                'temp_avg'          => $climate->temp_avg,
                'temp_min'          => $climate->temp_min,
                'temp_max'          => $climate->temp_max,
                'precipitation_pct' => $climate->precipitation_pct,
                'wind_avg'          => $climate->wind_avg,
            ],
            'currency_rate'   => $this->currencyService->getRateFromEur($country->currency_code),
            'current_weather' => $this->weatherService->getCurrent($destination->latitude, $destination->longitude),
        ];
    }
}
