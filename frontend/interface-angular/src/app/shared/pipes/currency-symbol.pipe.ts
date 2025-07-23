// currency-symbol.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { eCurrency } from '../enums/currency.enum';

@Pipe({ name: 'currencySymbol' })
export class CurrencySymbolPipe implements PipeTransform {
  transform(value: string): string {
    return eCurrency[value as keyof typeof eCurrency]?.symbol || value;
  }
}