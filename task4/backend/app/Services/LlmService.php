<?php

namespace App\Services;

use App\Models\Destination;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class LlmService
{
    public function __construct(
        private readonly WeatherService $weatherService,
    ) {}

    public function generateWhyNow(Destination $destination, int $month): string
    {
        return Cache::remember("why_now:{$destination->id}:{$month}", now()->addDay(), function () use ($destination, $month): string {
            $weather = $this->weatherService->getCurrent($destination->latitude, $destination->longitude);
            $apiKey = config('services.openai.key');

            if (! is_string($apiKey) || $apiKey === '') {
                return $this->fallbackText($destination, $month, $weather);
            }

            try {
                $response = Http::withToken($apiKey)
                    ->timeout(15)
                    ->post('https://api.openai.com/v1/responses', [
                        'model' => config('services.openai.model', 'gpt-5.4-mini'),
                        'max_output_tokens' => 200,
                        'input' => [
                            [
                                'role' => 'system',
                                'content' => 'Píš po slovensky, vecne a turisticky užitočne. Odpoveď má mať najviac 3 krátke vety.',
                            ],
                            [
                                'role' => 'user',
                                'content' => $this->prompt($destination, $month, $weather),
                            ],
                        ],
                    ]);

                if (! $response->successful()) {
                    return $this->fallbackText($destination, $month, $weather);
                }

                return $this->extractText($response->json()) ?: $this->fallbackText($destination, $month, $weather);
            } catch (Throwable) {
                return $this->fallbackText($destination, $month, $weather);
            }
        });
    }

    /**
     * @param  array<string, mixed>  $weather
     */
    private function prompt(Destination $destination, int $month, array $weather): string
    {
        $destination->loadMissing(['country', 'types']);
        $types = $destination->types->pluck('name_sk')->implode(', ');

        return sprintf(
            'Destinácia: %s, krajina: %s, mesiac cesty: %d, typy: %s, aktuálne počasie: %s, aktuálna teplota: %s. Vysvetli, prečo sa oplatí cestovať práve teraz.',
            $destination->name,
            $destination->country?->name_sk ?? 'neznáma',
            $month,
            $types !== '' ? $types : 'neuvedené',
            $weather['description_sk'] ?? 'nedostupné',
            isset($weather['temperature']) && is_numeric($weather['temperature'])
                ? sprintf('%.1f °C', (float) $weather['temperature'])
                : 'nedostupná',
        );
    }

    /**
     * @param  array<string, mixed>  $weather
     */
    private function fallbackText(Destination $destination, int $month, array $weather): string
    {
        $temperature = isset($weather['temperature']) && is_numeric($weather['temperature'])
            ? sprintf(' Aktuálna teplota je približne %.1f °C.', (float) $weather['temperature'])
            : '';

        return sprintf(
            '%s je v mesiaci %d dobrá voľba podľa aktuálnych podmienok a typu destinácie.%s Počasie si pred cestou ešte over podľa najnovšej predpovede.',
            $destination->name,
            $month,
            $temperature,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function extractText(array $payload): ?string
    {
        if (isset($payload['output_text']) && is_string($payload['output_text'])) {
            return trim($payload['output_text']);
        }

        foreach ($payload['output'] ?? [] as $output) {
            foreach ($output['content'] ?? [] as $content) {
                if (($content['type'] ?? null) === 'output_text' && isset($content['text'])) {
                    return trim((string) $content['text']);
                }
            }
        }

        return null;
    }
}
