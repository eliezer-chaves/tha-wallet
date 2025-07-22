<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Middleware\JwtFromCookieMiddleware;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware([JwtFromCookieMiddleware::class, 'auth:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // 📘 CRUD de contas
    Route::get('/accounts/types', [AccountController::class, 'accountTypes']);

    Route::apiResource('accounts', AccountController::class)->except(['create', 'edit']);

});
