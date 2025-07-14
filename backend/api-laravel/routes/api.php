<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

Route::prefix('v1')->group(function () {
    // Rotas públicas (sem autenticação)
    Route::post('/usuarios', [UserController::class, 'store']); // Rota original
    Route::post('/register', [AuthController::class, 'register']); // Nova rota de registro
    Route::post('/login', [AuthController::class, 'login']); // Nova rota de login

    /**
     * ROTAS PROTEGIDAS - Precisam de token Bearer
     * Para que serve: Só usuários autenticados podem acessar
     * O middleware 'auth:sanctum' verifica se o token é válido
     */
    Route::middleware('auth:sanctum')->group(function () {
        // Rotas de autenticação
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Aqui você pode adicionar suas outras rotas protegidas
        // Exemplo:
        // Route::get('/pedidos', [PedidoController::class, 'index']);
        // Route::apiResource('produtos', ProdutoController::class);

        // Rotas adicionais do UserController (se necessário)
        // Route::get('/usuarios/{id}', [UserController::class, 'show']);
    });
});