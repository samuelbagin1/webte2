<?php

namespace Tests\Feature\Api;

use App\Http\Middleware\TrackVisit;
use App\Models\Country;
use App\Models\Destination;
use App\Models\DestinationType;
use App\Models\Search;
use App\Models\MonthlyClimate;
use App\Models\SearchResult;
use App\Models\Visit;
use App\Services\CurrencyService;
use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class Phase4ApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_search_scores_filters_sorts_limits_and_persists_results(): void
    {
        $beach = DestinationType::query()->create(['code' => 'sea_beach', 'name_sk' => 'More a pláž']);
        $city  = DestinationType::query()->create(['code' => 'city_break', 'name_sk' => 'Mestský výlet']);
        $country = $this->country();

        for ($i = 1; $i <= 25; $i++) {
            $destination = $this->destination($country, "Beach {$i}", 2.0);
            $destination->types()->attach($beach);
        }

        $best = $this->destination($country, 'Best Match', 1.5);
        $best->types()->attach([$beach->id, $city->id]);

        // Monthly climate in 'warm' range (20-29°C) → temperature score = 35, total = 40+35+25 = 100
        MonthlyClimate::query()->create([
            'destination_id'    => $best->id,
            'month'             => 7,
            'temp_avg'          => 24.0,
            'temp_min'          => 20.0,
            'temp_max'          => 28.0,
            'precipitation_pct' => 15.0,
            'wind_avg'          => 12.0,
        ]);

        $tooFar = $this->destination($country, 'Too Far', 6.0);
        $tooFar->types()->attach($beach);

        $wrongType = $this->destination($country, 'Wrong Type', 1.0);
        $wrongType->types()->attach($city);

        $response = $this->postJson('/api/search', [
            'trip_types'       => ['sea_beach', 'city_break'],
            'temperature_pref' => 'warm',
            'max_flight_hours' => 3,
            'start_date'       => '2026-07-01',
            'end_date'         => '2026-07-10',
            'month'            => 7,
        ]);

        $response->assertOk()
            ->assertJsonCount(20)
            ->assertJsonPath('0.name', 'Best Match')
            ->assertJsonPath('0.match_score', 100)
            ->assertJsonPath('0.country.flag_url', 'https://www.geonames.org/flags/x/es.gif')
            ->assertJsonMissing(['name' => 'Too Far'])
            ->assertJsonMissing(['name' => 'Wrong Type']);

        $firstResult = $response->json('0');
        $this->assertArrayNotHasKey('current_weather', $firstResult);
        $this->assertArrayNotHasKey('currency_rate', $firstResult);
        $this->assertArrayNotHasKey('external_info', $firstResult['country']);

        // Scoring reads from DB — no open-meteo calls during search
        Http::assertSentCount(0);

        $this->assertDatabaseCount('searches', 1);
        $this->assertDatabaseCount('search_results', 20);
    }

    public function test_search_validation_rejects_invalid_payloads(): void
    {
        DestinationType::query()->create(['code' => 'sea_beach', 'name_sk' => 'More a pláž']);

        $this->postJson('/api/search', [
            'trip_types' => [],
            'temperature_pref' => 'freezing',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-01',
            'month' => 13,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['trip_types', 'temperature_pref', 'end_date', 'month']);
    }

    public function test_destination_detail_returns_country_and_current_weather_with_null_monthly_climate(): void
    {
        Http::fake([
            'api.open-meteo.com/*' => Http::response([
                'current' => [
                    'time' => '2026-05-03T12:00',
                    'temperature_2m' => 22.4,
                    'relative_humidity_2m' => 55,
                    'weather_code' => 2,
                    'wind_speed_10m' => 9.1,
                ],
            ]),
            'restcountries.com/*' => Http::response([
                [
                    'population' => 48000000,
                    'region' => 'Europe',
                    'subregion' => 'Southern Europe',
                    'languages' => ['spa' => 'Spanish'],
                    'timezones' => ['UTC+01:00'],
                ],
            ]),
        ]);

        $type = DestinationType::query()->create(['code' => 'historic', 'name_sk' => 'Historické mestá']);
        $country = $this->country();
        $destination = $this->destination($country, 'Barcelona', 2.4);
        $destination->types()->attach($type);

        $response = $this->getJson("/api/destinations/{$destination->id}?month=7")
            ->assertOk()
            ->assertJsonPath('name', 'Barcelona')
            ->assertJsonPath('country.name_sk', 'Španielsko')
            ->assertJsonPath('country.flag_url', 'https://www.geonames.org/flags/x/es.gif')
            ->assertJsonPath('currency_rate', null)
            ->assertJsonPath('current_weather.temperature', 22.4)
            ->assertJsonPath('current_weather.icon', 'cloud-sun')
            ->assertJsonPath('current_weather.description_sk', 'Čiastočne oblačno')
            ->assertJsonPath('country.external_info.region', 'Europe');

        $response->assertJsonPath('monthly_climate', null);
    }

    public function test_compare_requires_two_ids_and_returns_two_destinations(): void
    {
        Http::fake([
            'api.open-meteo.com/*' => Http::response([
                'current' => [
                    'temperature_2m' => 20,
                    'relative_humidity_2m' => 60,
                    'weather_code' => 0,
                    'wind_speed_10m' => 5,
                ],
            ]),
            'restcountries.com/*' => Http::response([[
                'population' => 1,
                'region' => 'Europe',
                'subregion' => 'Southern Europe',
                'languages' => [],
                'timezones' => [],
            ]]),
        ]);

        $type = DestinationType::query()->create(['code' => 'historic', 'name_sk' => 'Historické mestá']);
        $country = $this->country();
        $first = $this->destination($country, 'First', 1.0);
        $second = $this->destination($country, 'Second', 2.0);
        $first->types()->attach($type);
        $second->types()->attach($type);

        $this->getJson("/api/compare?ids={$first->id}&month=5")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['ids']);

        $this->getJson("/api/compare?ids={$first->id},{$second->id}&month=5")
            ->assertOk()
            ->assertJsonCount(2, 'destinations')
            ->assertJsonPath('destinations.0.name', 'First')
            ->assertJsonPath('destinations.1.name', 'Second');
    }

    public function test_phase_five_services_cache_and_fallbacks_work(): void
    {
        Country::query()->create([
            'iso_code' => 'US',
            'name_sk' => 'Spojené štáty',
            'capital' => 'Washington',
            'currency_code' => 'USD',
        ]);

        Http::fake([
            'api.frankfurter.app/*' => Http::response(['rates' => ['USD' => 1.08]]),
            'api.open-meteo.com/*' => Http::sequence()
                ->pushStatus(500)
                ->push([
                    'current' => [
                        'temperature_2m' => 31,
                        'relative_humidity_2m' => 40,
                        'weather_code' => 0,
                        'wind_speed_10m' => 7,
                    ],
                ]),
        ]);

        $currencyService = app(CurrencyService::class);
        $weatherService = app(WeatherService::class);

        $this->assertNull($currencyService->getRateFromEur('EUR'));
        $this->assertSame(1.08, $currencyService->getRateFromEur('USD'));
        $this->assertSame(1.08, $currencyService->getRateFromEur('USD'));

        $weather = $weatherService->getCurrent(24.0, 54.0);
        $this->assertSame('open_meteo_hub', $weather['source']);
        $this->assertSame('Dubaj', $weather['fallback_hub']);
        $this->assertSame('sun', $weather['icon']);

        Http::assertSentCount(3);
    }

    public function test_current_weather_is_cached_for_repeated_coordinate_requests(): void
    {
        Http::fake([
            'api.open-meteo.com/*' => Http::response([
                'current' => [
                    'temperature_2m' => 24,
                    'relative_humidity_2m' => 50,
                    'weather_code' => 2,
                    'wind_speed_10m' => 6,
                ],
            ]),
        ]);

        $weatherService = app(WeatherService::class);

        $this->assertSame(24, $weatherService->getCurrent(41.3874, 2.1686)['temperature']);
        $this->assertSame(24, $weatherService->getCurrent(41.3874, 2.1686)['temperature']);

        Http::assertSentCount(1);
    }

    public function test_why_now_endpoint_uses_llm_service_with_template_fallback(): void
    {
        config(['services.openai.key' => null]);

        $type = DestinationType::query()->create(['code' => 'historic', 'name_sk' => 'Historické mestá']);
        $country = $this->country();
        $destination = $this->destination($country, 'Rím', 1.7);
        $destination->types()->attach($type);

        Http::fake([
            'api.open-meteo.com/*' => Http::response([
                'current' => [
                    'temperature_2m' => 23.0,
                    'relative_humidity_2m' => 48,
                    'weather_code' => 1,
                    'wind_speed_10m' => 4,
                ],
            ]),
        ]);

        $this->getJson("/api/destinations/{$destination->id}/why-now?month=5")
            ->assertOk()
            ->assertJsonPath('destination_id', $destination->id)
            ->assertJsonPath('month', 5)
            ->assertJsonPath('why_now', 'Rím je v mesiaci 5 dobrá voľba podľa aktuálnych podmienok a typu destinácie. Aktuálna teplota je približne 23.0 °C. Počasie si pred cestou ešte over podľa najnovšej predpovede.');
    }

    public function test_visit_tracking_hashes_ip_and_stats_count_unique_last_hour(): void
    {
        Carbon::setTestNow('2026-05-03 12:00:00');

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])->postJson('/api/visits/track')->assertCreated();
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])->postJson('/api/visits/track')->assertCreated();

        $this->assertDatabaseCount('visits', 2);
        $this->assertDatabaseHas('visits', [
            'ip_hash' => TrackVisit::hashIp('203.0.113.10'),
        ]);
        $this->assertDatabaseMissing('visits', [
            'ip_hash' => '203.0.113.10',
        ]);

        $this->getJson('/api/stats/visits')
            ->assertOk()
            ->assertJson([
                'total' => 2,
                'unique' => 1,
            ]);

        Carbon::setTestNow();
    }

    public function test_stats_endpoints_aggregate_hourly_searches_and_preferences(): void
    {
        $beach = DestinationType::query()->create(['code' => 'sea_beach', 'name_sk' => 'More a pláž']);
        $country = $this->country();
        $destination = $this->destination($country, 'Barcelona', 2.4);
        $destination->types()->attach($beach);

        Visit::query()->create(['ip_hash' => 'a', 'visited_at' => '2026-05-03 02:00:00']);
        Visit::query()->create(['ip_hash' => 'b', 'visited_at' => '2026-05-03 08:00:00']);
        Visit::query()->create(['ip_hash' => 'c', 'visited_at' => '2026-05-03 18:00:00']);
        Visit::query()->create(['ip_hash' => 'd', 'visited_at' => '2026-05-03 22:00:00']);

        $search = Search::query()->create([
            'trip_types' => ['sea_beach'],
            'temperature_pref' => 'warm',
            'max_flight_hours' => 3,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-10',
            'month' => 7,
        ]);
        SearchResult::query()->create([
            'search_id' => $search->id,
            'destination_id' => $destination->id,
            'match_score' => 95,
        ]);

        $this->getJson('/api/stats/hourly')
            ->assertOk()
            ->assertJson([
                '0-6' => 1,
                '6-15' => 1,
                '15-21' => 1,
                '21-24' => 1,
            ]);

        $this->getJson('/api/stats/searches?sort=count&order=desc')
            ->assertOk()
            ->assertJsonPath('0.name', 'Barcelona')
            ->assertJsonPath('0.country', 'Španielsko')
            ->assertJsonPath('0.count', 1);

        $this->getJson('/api/stats/preferences')
            ->assertOk()
            ->assertJsonPath('types.sea_beach', 1)
            ->assertJsonPath('temperatures.warm', 1);
    }

    private function country(): Country
    {
        return Country::query()->firstOrCreate(
            ['iso_code' => 'ES'],
            ['name_sk' => 'Španielsko', 'capital' => 'Madrid', 'currency_code' => 'EUR'],
        );
    }

    private function destination(Country $country, string $name, float $flightHours): Destination
    {
        return Destination::query()->create([
            'name' => $name,
            'country_id' => $country->id,
            'latitude' => 41.3874,
            'longitude' => 2.1686,
            'flight_hours_from_vienna' => $flightHours,
            'description_sk' => "{$name} description",
            'image_url' => null,
        ]);
    }

}
