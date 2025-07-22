<?php

namespace App\Enums;

enum eAccountType: string
{
    case INVESTIMENTO = 'Investimento';
    case POUPANCA = 'Poupança';
    case CONTA_CORRENTE = 'Conta Corrente';

    case CONTA_EXTERIOR = 'Conta no Exterior';


    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

     public function color(): string
    {
        return match($this) {
            self::INVESTIMENTO => '#ff6d00',
            self::POUPANCA => '#00ea71ff',
            self::CONTA_CORRENTE => '#bf0096ff',
            self::CONTA_EXTERIOR => '#2962ff',
        };
    }
}
