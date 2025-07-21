<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Middleware\JwtFromCookieMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::middleware([JwtFromCookieMiddleware::class, 'auth:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
});