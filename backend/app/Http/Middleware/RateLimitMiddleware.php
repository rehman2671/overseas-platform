<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class RateLimitMiddleware
{
    public function handle(Request $request, Closure $next, $maxAttempts = 60, $decayMinutes = 1)
    {
        $key = 'rate_limit:' . $request->ip();
        $current = Redis::get($key);

        if ($current && $current >= $maxAttempts) {
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.'
            ], 429);
        }

        Redis::incr($key);
        Redis::expire($key, $decayMinutes * 60);

        return $next($request);
    }
}
