<?php

namespace App\Services;

use App\Models\Destination;
use App\Models\MonthlyClimate;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class LlmService
{
    public function generateWhyNow(Destination $destination, int $month, MonthlyClimate $climate): string
    {
        return Cache::remember("why_now:{$destination->id}:{$month}", now()->addDay(), function () use ($destination, $month, $climate): string {
            $apiKey = config('services.openai.key');

            if (! is_string($apiKey) || $apiKey === '') {
                return $this->fallbackText($destination, $month, $climate);
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
                                'content' => $this->prompt($destination, $month, $climate),
                            ],
                        ],
                    ]);

                if (! $response->successful()) {
                    return $this->fallbackText($destination, $month, $climate);
                }

                return $this->extractText($response->json()) ?: $this->fallbackText($destination, $month, $climate);
            } catch (Throwable) {
                return $this->fallbackText($destination, $month, $climate);
            }
        });
    }

    private function prompt(Destination $destination, int $month, MonthlyClimate $climate): string
    {
        $destination->loadMissing(['country', 'types']);
        $types = $destination->types->pluck('name_sk')->implode(', ');

        return sprintf(
            'Destinácia: %s, krajina: %s, mesiac: %d, typy: %s, priemerná teplota: %.1f °C, minimum: %.1f °C, maximum: %.1f °C. Vysvetli, prečo sa oplatí cestovať práve teraz.',
            $destination->name,
            $destination->country?->name_sk ?? 'neznáma',
            $month,
            $types !== '' ? $types : 'neuvedené',
            $climate->temp_avg,
            $climate->temp_min,
            $climate->temp_max,
        );
    }

    private function fallbackText(Destination $destination, int $month, MonthlyClimate $climate): string
    {
        return sprintf(
            '%s je v mesiaci %d dobrá voľba vďaka priemernej teplote okolo %.1f °C. Počasie je vhodné na pohodlné plánovanie programu a výletov bez výrazných extrémov.',
            $destination->name,
            $month,
            $climate->temp_avg,
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
