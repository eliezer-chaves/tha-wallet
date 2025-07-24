<?php

namespace App\Enums;

enum eTransactionType: string
{
    case TRANSFER = 'Transferência';
    case DEPOSIT = 'Depósito';
    case WITHDRAWAL = 'Saque';
    case PAYMENT = 'Pagamento';
    case INVOICE = 'Fatura/Cobrança';
    case ADJUSTMENT = 'Ajuste';
    case FEE = 'Tarifa';
    case INTEREST = 'Juros';
    case REVERSAL = 'Estorno';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function color(): string
    {
        return match ($this) {
            self::TRANSFER => '#2962ff',       // Azul
            self::DEPOSIT => '#00c853',        // Verde
            self::WITHDRAWAL => '#ff5252',     // Vermelho
            self::PAYMENT => '#ffab00',        // Amarelo
            self::INVOICE => '#aa00ff',        // Roxo
            self::ADJUSTMENT => '#607d8b',     // Cinza
            self::FEE => '#ff6d00',            // Laranja
            self::INTEREST => '#00b8d4',       // Ciano
            self::REVERSAL => '#c51162',       // Rosa
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::TRANSFER => 'swap-horizontal',
            self::DEPOSIT => 'arrow-down-circle',
            self::WITHDRAWAL => 'arrow-up-circle',
            self::PAYMENT => 'credit-card',
            self::INVOICE => 'file-invoice',
            self::ADJUSTMENT => 'sliders-h',
            self::FEE => 'percentage',
            self::INTEREST => 'chart-line',
            self::REVERSAL => 'undo',
        };
    }

    public function isPositive(): bool
    {
        return match ($this) {
            self::DEPOSIT, self::INTEREST, self::REVERSAL => true,
            default => false,
        };
    }

    public function isNegative(): bool
    {
        return match ($this) {
            self::WITHDRAWAL, self::PAYMENT, self::FEE => true,
            default => false,
        };
    }
}