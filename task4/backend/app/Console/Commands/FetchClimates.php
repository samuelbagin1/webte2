<?php

namespace App\Console\Commands;

use App\Models\Destination;
use App\Models\MonthlyClimate;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class FetchClimates extends Command
{
    protected $signature = 'climate:fetch';

    protected $description = 'Fetch and aggregate monthly climate data for seeded destinations.';

    public function handle(): int
    {
        $endYear = CarbonImmutable::now()->subYear()->year;
        $startYear = $endYear - 4;
        $startDate = "{$startYear}-01-01";
        $endDate = "{$endYear}-12-31";

        $this->info("Fetching climate archive data for {$startYear}-{$endYear}.");

        Destination::query()
            ->orderBy('name')
            ->each(function (Destination $destination) use ($startDate, $endDate): void {
                $this->line("Fetching {$destination->name}...");

                $response = $this->fetchArchive($destination, $startDate, $endDate);

                if ($response->failed()) {
                    throw new \RuntimeException("Open-Meteo request failed for {$destination->name}.");
                }

                $daily = $response->json('daily');

                if (
                    ! is_array($daily)
                    || ! isset($daily['time'], $daily['temperature_2m_mean'], $daily['temperature_2m_min'], $daily['temperature_2m_max'])
                ) {
                    throw new \RuntimeException("Open-Meteo response is missing daily temperatures for {$destination->name}.");
                }

                $monthly = $this->aggregateByMonth(
                    $daily['time'],
                    $daily['temperature_2m_mean'],
                    $daily['temperature_2m_min'],
                    $daily['temperature_2m_max'],
                );

                foreach ($monthly as $month => $values) {
                    MonthlyClimate::updateOrCreate(
                        [
                            'destination_id' => $destination->id,
                            'month' => $month,
                        ],
                        [
                            'temp_avg' => $values['temp_avg'],
                            'temp_min' => $values['temp_min'],
                            'temp_max' => $values['temp_max'],
                        ],
                    );
                }

                $this->info("Stored 12 monthly climate rows for {$destination->name}.");

                sleep(2);
            });

        $this->info('Climate data fetch completed.');

        return self::SUCCESS;
    }

    private function fetchArchive(Destination $destination, string $startDate, string $endDate): Response
    {
        $query = [
            'latitude' => $destination->latitude,
            'longitude' => $destination->longitude,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'daily' => 'temperature_2m_mean,temperature_2m_min,temperature_2m_max',
            'timezone' => 'UTC',
        ];

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $response = Http::connectTimeout(30)
                    ->timeout(60)
                    ->get('https://archive-api.open-meteo.com/v1/archive', $query);
            } catch (ConnectionException $exception) {
                if ($attempt === 5) {
                    throw $exception;
                }

                $this->warn("Open-Meteo connection failed for {$destination->name}; waiting before retry {$attempt}/5.");
                sleep(15);

                continue;
            }

            if ($response->status() !== 429) {
                return $response;
            }

            $this->warn("Open-Meteo rate limit reached for {$destination->name}; waiting before retry {$attempt}/5.");
            sleep(65);
        }

        return $response;
    }

    /**
     * @param  array<int, string>  $dates
     * @param  array<int, float|null>  $means
     * @param  array<int, float|null>  $mins
     * @param  array<int, float|null>  $maxes
     * @return array<int, array{temp_avg: float, temp_min: float, temp_max: float}>
     */
    private function aggregateByMonth(array $dates, array $means, array $mins, array $maxes): array
    {
        $buckets = [];

        foreach ($dates as $index => $date) {
            if (! isset($means[$index], $mins[$index], $maxes[$index])) {
                continue;
            }

            $month = (int) substr($date, 5, 2);
            $buckets[$month]['means'][] = (float) $means[$index];
            $buckets[$month]['mins'][] = (float) $mins[$index];
            $buckets[$month]['maxes'][] = (float) $maxes[$index];
        }

        $result = [];

        for ($month = 1; $month <= 12; $month++) {
            if (empty($buckets[$month]['means'])) {
                throw new \RuntimeException("No temperature data available for month {$month}.");
            }

            $result[$month] = [
                'temp_avg' => round(array_sum($buckets[$month]['means']) / count($buckets[$month]['means']), 2),
                'temp_min' => round(min($buckets[$month]['mins']), 2),
                'temp_max' => round(max($buckets[$month]['maxes']), 2),
            ];
        }

        return $result;
    }
}
