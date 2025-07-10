<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::prefix('v1')->group(function() {
    // Rotas públicas (sem autenticação)
    Route::post('/usuarios', [UserController::class, 'store']);
    
    // Futuras rotas autenticadas virão aqui:
    // Route::middleware('auth:api')->group(function() {
    //     Rotas protegidas...
    // });
});