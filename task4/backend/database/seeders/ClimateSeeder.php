<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\MonthlyClimate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Throwable;

class ClimateSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = Destination::all();

        foreach ($destinations as $destination) {
            $daily = $this->fetchArchive($destination->latitude, $destination->longitude);

            if ($daily === null) {
                $this->command->warn("Skipping {$destination->name} — archive API failed");
                continue;
            }

            foreach ($this->summarizeByMonth($daily) as $month => $stats) {
                MonthlyClimate::query()->updateOrCreate(
                    ['destination_id' => $destination->id, 'month' => $month],
                    $stats,
                );
            }

            $this->command->info("Seeded {$destination->name}");
            sleep(1);
        }
    }

    /** @return array<string, mixed>|null */
    private function fetchArchive(float $lat, float $lon): ?array
    {
        try {
            $response = Http::timeout(20)->get('https://archive-api.open-meteo.com/v1/archive', [
                'latitude'   => $lat,
                'longitude'  => $lon,
                'start_date' => '2025-01-01',
                'end_date'   => '2025-12-31',
                'daily'      => 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
                'timezone'   => 'UTC',
            ]);

            if (! $response->successful()) {
                return null;
            }

            $daily = $response->json('daily');

            return is_array($daily) ? $daily : null;
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @param  array<string, array<int, float|null>>  $daily
     * @return array<int, array<string, float>>
     */
    private function summarizeByMonth(array $daily): array
    {
        $buckets = [];
        foreach ($daily['time'] as $i => $dateStr) {
            $month = (int) substr($dateStr, 5, 2);
            $buckets[$month][] = [
                'tmax'   => $daily['temperature_2m_max'][$i] ?? null,
                'tmin'   => $daily['temperature_2m_min'][$i] ?? null,
                'precip' => $daily['precipitation_sum'][$i] ?? null,
                'wind'   => $daily['wind_speed_10m_max'][$i] ?? null,
            ];
        }

        $result = [];

        foreach ($buckets as $month => $days) {
            $validTemp = array_filter($days, fn ($d) => $d['tmax'] !== null && $d['tmin'] !== null);
            $totalDays = count($days);

            if ($validTemp === []) {
                continue;
            }

            $tmaxArr    = array_column($validTemp, 'tmax');
            $tminArr    = array_column($validTemp, 'tmin');
            $count      = count($validTemp);
            $avgArr     = array_map(fn ($mx, $mn) => ($mx + $mn) / 2.0, $tmaxArr, $tminArr);
            $windValues = array_filter(array_column($days, 'wind'), fn ($w) => $w !== null);
            $rainyDays  = count(array_filter(
                array_column($days, 'precip'),
                fn ($p) => $p !== null && $p >= 1.0
            ));

            $result[$month] = [
                'temp_min'          => round(array_sum($tminArr) / $count, 1),
                'temp_max'          => round(array_sum($tmaxArr) / $count, 1),
                'temp_avg'          => round(array_sum($avgArr)  / $count, 1),
                'precipitation_pct' => round($rainyDays / $totalDays * 100.0, 1),
                'wind_avg'          => $windValues !== []
                    ? round(array_sum($windValues) / count($windValues), 1)
                    : 0.0,
            ];
        }

        return $result;
    }
}
