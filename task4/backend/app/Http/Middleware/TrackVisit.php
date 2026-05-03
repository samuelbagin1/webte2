<?php

namespace App\Http\Middleware;

use App\Models\Visit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

class TrackVisit
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Visit::query()->create([
            'ip_hash' => self::hashIp((string) $request->ip()),
            'visited_at' => Carbon::now(),
        ]);

        return $next($request);
    }

    public static function hashIp(string $ip): string
    {
        return hash('sha256', config('app.key').'|'.$ip);
    }
}
