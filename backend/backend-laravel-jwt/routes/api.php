<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Middleware\JwtFromCookieMiddleware;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware([JwtFromCookieMiddleware::class, 'auth:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // 📘 CRUD de contas
    Route::get('/accounts/types', [AccountController::class, 'accountTypes']);
    Route::get('/accounts', [AccountController::class, 'index']);
    Route::get('/accounts/totals', [AccountController::class, 'sumBalances']);
    Route::get('/accounts/currencies', [AccountController::class, 'currencyTypes']);
    Route::put('/accounts/{id}', [AccountController::class, 'update']);
    Route::apiResource('accounts', AccountController::class)->except(['create', 'edit']);

     // 📘 CRUD de transações
    Route::get('/transactions/types', [TransactionController::class, 'transferTypes']); // enum list
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
});
