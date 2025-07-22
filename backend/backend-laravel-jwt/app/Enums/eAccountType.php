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
}
