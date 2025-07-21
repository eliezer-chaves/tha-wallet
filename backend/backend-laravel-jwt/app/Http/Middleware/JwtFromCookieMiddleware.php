<?php

// app/Http/Middleware/JwtFromCookieMiddleware.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class JwtFromCookieMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($token = $request->cookie('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        return $next($request);
    }
}
