<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\MonthlyClimate;

class ScoringService
{
    private const TYPE_WEIGHT = 40.0;

    private const TEMPERATURE_WEIGHT = 35.0;

    private const DISTANCE_WEIGHT = 25.0;

    /**
     * @param  array{trip_types?: array<int, string>, temperature_pref?: string, max_flight_hours?: float|null}  $userPrefs
     */
    public function score(Destination $d, array $userPrefs, int $month): float
    {
        $matchingTypes = $this->matchingTypes($d, $userPrefs['trip_types'] ?? []);

        if ($matchingTypes === []) {
            return 0.0;
        }

        $maxFlightHours = $userPrefs['max_flight_hours'] ?? null;

        if ($maxFlightHours !== null && $d->flight_hours_from_vienna > (float) $maxFlightHours) {
            return 0.0;
        }

        $typeScore = (count($matchingTypes) / count($userPrefs['trip_types'])) * self::TYPE_WEIGHT;
        $temperatureScore = $this->temperatureScore($d, $userPrefs['temperature_pref'] ?? 'any', $month);
        $distanceScore = self::DISTANCE_WEIGHT;

        return round(min(100.0, max(0.0, $typeScore + $temperatureScore + $distanceScore)), 2);
    }

    /**
     * @param  array{trip_types?: array<int, string>, temperature_pref?: string, max_flight_hours?: float|null}  $userPrefs
     * @return array<int, string>
     */
    public function getMatchReasons(Destination $d, array $userPrefs, int $month): array
    {
        $reasons = [];

        foreach ($this->matchingTypes($d, $userPrefs['trip_types'] ?? []) as $type) {
            $reasons[] = $type['name_sk'];
        }

        $climate = $this->monthlyClimate($d, $month);
        if ($climate !== null) {
            $preferenceLabel = match ($userPrefs['temperature_pref'] ?? 'any') {
                'hot' => 'horúco',
                'warm' => 'teplo',
                'mild' => 'príjemne',
                default => 'ľubovoľná teplota',
            };

            $reasons[] = sprintf(
                'V mesiaci %d priemerne %.0f °C — %s',
                $month,
                $climate->temp_avg,
                $preferenceLabel,
            );
        }

        $reasons[] = sprintf('%.1f hod letu z Viedne', $d->flight_hours_from_vienna);

        return $reasons;
    }

    /**
     * @param  array<int, string>  $userTypes
     * @return array<int, array{code: string, name_sk: string}>
     */
    private function matchingTypes(Destination $destination, array $userTypes): array
    {
        if ($userTypes === []) {
            return [];
        }

        return $destination->types
            ->filter(fn ($type) => in_array($type->code, $userTypes, true))
            ->map(fn ($type) => ['code' => $type->code, 'name_sk' => $type->name_sk])
            ->values()
            ->all();
    }

    private function temperatureScore(Destination $destination, string $preference, int $month): float
    {
        if ($preference === 'any') {
            return self::TEMPERATURE_WEIGHT;
        }

        $climate = $this->monthlyClimate($destination, $month);
        if ($climate === null) {
            return 0.0;
        }

        [$low, $high] = match ($preference) {
            'hot' => [28.0, 40.0],
            'warm' => [20.0, 29.0],
            'mild' => [10.0, 19.0],
            default => [10.0, 40.0],
        };

        $avgTemp = $climate->temp_avg;
        if ($avgTemp >= $low && $avgTemp <= $high) {
            return self::TEMPERATURE_WEIGHT;
        }

        $distanceOutside = min(abs($avgTemp - $low), abs($avgTemp - $high));

        return max(0.0, self::TEMPERATURE_WEIGHT - ($distanceOutside * 3));
    }

    private function monthlyClimate(Destination $destination, int $month): ?MonthlyClimate
    {
        return $destination->monthlyClimates->firstWhere('month', $month);
    }
}
