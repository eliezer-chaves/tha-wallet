<?php

return [
    'defaults' => [
        'guard' => 'web',  // Usando web como padrão para sessões
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',  // Driver de sessão tradicional
            'provider' => 'users',
        ],
        
        'api' => [
            'driver' => 'sanctum',  // Sanctum para API
            'provider' => 'users',
            'hash' => false,
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class, // Removido env() para maior clareza
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];