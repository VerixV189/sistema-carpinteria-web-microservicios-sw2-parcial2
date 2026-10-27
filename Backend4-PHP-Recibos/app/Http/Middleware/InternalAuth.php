<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cierra el bypass directo al puerto interno: exige el secreto de malla
 * `x-internal-secret` (lo inyecta el gateway tras validar JWT; n8n y otros
 * servicios lo envían entre sí). `x-user-*` solo aporta contexto — sin el
 * secreto, headers falsificados directos al puerto no pasan.
 */
class InternalAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = env('INTERNAL_SECRET', 'carpinteria-internal-dev');

        if ($request->header('x-internal-secret') === $secret) {
            return $next($request);
        }

        return response()->json(['message' => 'Secreto de malla requerido'], 401);
    }
}
