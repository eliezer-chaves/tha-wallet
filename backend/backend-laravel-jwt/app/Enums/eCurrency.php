<?php

namespace App\Enums;

enum eCurrency: string
{
    case BRL = 'BRL'; // Real Brasileiro
    case USD = 'USD'; // Dólar Americano
    case EUR = 'EUR'; // Euro
    case GBP = 'GBP'; // Libra Esterlina
    case JPY = 'JPY'; // Iene Japonês
    case CHF = 'CHF'; // Franco Suíço
    case AUD = 'AUD'; // Dólar Australiano
    case CAD = 'CAD'; // Dólar Canadense
    case CNY = 'CNY'; // Yuan Chinês
    case KRW = 'KRW'; // Won Sul-Coreano (exemplo)

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function name(): string
    {
        return match ($this) {
            self::BRL => 'Real Brasileiro',
            self::USD => 'Dólar Americano',
            self::EUR => 'Euro',
            self::GBP => 'Libra Esterlina',
            self::JPY => 'Iene Japonês',
            self::CHF => 'Franco Suíço',
            self::AUD => 'Dólar Australiano',
            self::CAD => 'Dólar Canadense',
            self::CNY => 'Yuan Chinês',
            self::KRW => 'Won Sul-Coreano',

        };
    }

    public function symbol(): string
    {
        return match ($this) {
            self::BRL => 'R$',
            self::USD => '$',
            self::EUR => '€',
            self::GBP => '£',
            self::JPY => '¥',
            self::CHF => 'CHF',
            self::AUD => 'A$',
            self::CAD => 'C$',
            self::CNY => '¥',
            self::KRW => '₩',

        };
    }

    public function color(): string
    {
        return match ($this) {
            self::BRL => '#00aa5b', // Verde
            self::USD => '#85bb65', // Verde dólar
            self::EUR => '#003399', // Azul euro
            self::GBP => '#c41230', // Vermelho libra
            self::JPY => '#bc002d', // Vermelho japonês
            self::CHF => '#d52b1e', // Vermelho suíço
            self::AUD => '#00843D', // Verde australiano
            self::CAD => '#D80621', // Vermelho canadense
            self::CNY => '#de2910', // Vermelho chinês
            self::KRW => '#cd313a', // Vermelho coreano

        };
    }

    public function decimalDigits(): int
    {
        return match ($this) {
            self::JPY => 0, // Iene não tem centavos
            self::KRW => 0, // Won também não tem centavos
            default => 2, // Todas outras moedas usam 2 decimais
        };
    }
}