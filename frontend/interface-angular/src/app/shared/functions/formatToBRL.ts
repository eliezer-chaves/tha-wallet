// shared/functions/formatToBRL.ts

/**
 * Formata um número para o padrão brasileiro (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão brasileiro (ex: 1.250,00)
 */
export function formatToBRL(value: number): string {
  // Sempre trabalha com valor absoluto para formatação
  const absoluteValue = Math.abs(value);
  
  // Converte para string com 2 casas decimais
  const valueStr = absoluteValue.toFixed(2);
  
  // Separa parte inteira da decimal
  const [integerPart, decimalPart] = valueStr.split('.');
  
  // Adiciona pontos para separar milhares (formato brasileiro)
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Retorna no formato brasileiro com vírgula para decimais
  return `${withThousands},${decimalPart}`;
}

/**
 * Formata valor monetário baseado na moeda especificada
 * @param value - Valor numérico
 * @param currencyCode - Código da moeda (BRL, USD, EUR, etc.)
 * @param symbol - Símbolo da moeda
 * @returns String formatada de acordo com a moeda
 */
export function formatCurrency(value: number, currencyCode: string, symbol: string): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formattedValue: string;

  switch (currencyCode) {
    case 'BRL':
      // Formato brasileiro: R$ 1.250,00
      formattedValue = `${symbol} ${formatToBRL(absValue)}`;
      break;
    
    case 'JPY':
      // Iene não tem decimais: ¥ 1,250
      const jpyValue = Math.round(absValue).toLocaleString('ja-JP');
      formattedValue = `${symbol} ${jpyValue}`;
      break;
    
    case 'EUR':
      // Formato europeu: 1.250,00 €
      const eurValue = absValue.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      formattedValue = `${eurValue} ${symbol}`;
      break;
    
    case 'GBP':
      // Formato britânico: £1,250.00
      const gbpValue = absValue.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      formattedValue = `${symbol}${gbpValue}`;
      break;

    case 'CHF':
      // Formato suíço: CHF 1,250.00
      const chfValue = absValue.toLocaleString('de-CH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      formattedValue = `${symbol} ${chfValue}`;
      break;

    case 'AUD':
    case 'CAD':
      // Formato australiano/canadense: A$ 1,250.00 / C$ 1,250.00
      const audCadValue = absValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      formattedValue = `${symbol} ${audCadValue}`;
      break;

    case 'KRW':
      // Won não tem decimais: ₩ 1,250
      const krwValue = Math.round(absValue).toLocaleString('ko-KR');
      formattedValue = `${symbol} ${krwValue}`;
      break;

    case 'CNY':
      // Formato chinês: ¥ 1,250.00
      const cnyValue = absValue.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      formattedValue = `${symbol} ${cnyValue}`;
      break;
    
    default:
      // Formato americano padrão: $ 1,250.00
      const defaultValue = absValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      formattedValue = `${symbol} ${defaultValue}`;
      break;
  }

  return isNegative ? `-${formattedValue}` : formattedValue;
}

/**
 * Remove formatação monetária e retorna apenas o valor numérico
 * @param formattedValue - String formatada
 * @param currencyCode - Código da moeda
 * @param symbol - Símbolo da moeda
 * @returns Número limpo
 */
export function parseCurrency(formattedValue: string, currencyCode: string, symbol: string): number {
  if (!formattedValue) return 0;

  // Remove símbolo da moeda e espaços
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let cleanValue = formattedValue
    .replace(new RegExp(`^-?${escapeRegex(symbol)}\\s*`, 'g'), '')
    .replace(new RegExp(`\\s*${escapeRegex(symbol)}$`, 'g'), '')
    .trim();

  // Detecta se é negativo
  const isNegative = formattedValue.includes('-');
  if (isNegative) {
    cleanValue = cleanValue.replace('-', '');
  }

  let numericValue = 0;

  switch (currencyCode) {
    case 'BRL':
      // Remove pontos de milhares e substitui vírgula por ponto
      const brlClean = cleanValue.replace(/\./g, '').replace(',', '.');
      numericValue = parseFloat(brlClean) || 0;
      break;
    
    case 'JPY':
    case 'KRW':
      // Remove separadores de milhares, sem decimais
      const jpyKrwClean = cleanValue.replace(/[,\s]/g, '');
      numericValue = parseInt(jpyKrwClean) || 0;
      break;
    
    case 'EUR':
      // Formato alemão: 1.234,56
      const eurClean = cleanValue.replace(/\./g, '').replace(',', '.');
      numericValue = parseFloat(eurClean) || 0;
      break;
    
    default:
      // Formato americano: 1,234.56
      const defaultClean = cleanValue.replace(/,/g, '');
      numericValue = parseFloat(defaultClean) || 0;
      break;
  }

  return isNegative ? -numericValue : numericValue;
}

/**
 * Valida se uma string representa um valor monetário válido
 * @param value - String a ser validada
 * @param currencyCode - Código da moeda
 * @returns Boolean indicando se é válido
 */
export function isValidCurrencyInput(value: string, currencyCode: string): boolean {
  if (!value || value.trim() === '') return false;

  // Padrões de validação por moeda
  const patterns: { [key: string]: RegExp } = {
    'BRL': /^-?R\$\s?\d{1,3}(\.\d{3})*,\d{2}$|^-?\d{1,3}(\.\d{3})*,\d{2}$/,
    'USD': /^-?\$\s?\d{1,3}(,\d{3})*\.\d{2}$|^-?\d{1,3}(,\d{3})*\.\d{2}$/,
    'EUR': /^-?\d{1,3}(\.\d{3})*,\d{2}\s?€$|^-?\d{1,3}(\.\d{3})*,\d{2}$/,
    'GBP': /^-?£\d{1,3}(,\d{3})*\.\d{2}$|^-?\d{1,3}(,\d{3})*\.\d{2}$/,
    'JPY': /^-?¥\s?\d{1,3}(,\d{3})*$|^-?\d{1,3}(,\d{3})*$/,
    'KRW': /^-?₩\s?\d{1,3}(,\d{3})*$|^-?\d{1,3}(,\d{3})*$/,
    'CHF': /^-?CHF\s?\d{1,3}(,\d{3})*\.\d{2}$|^-?\d{1,3}(,\d{3})*\.\d{2}$/,
    'AUD': /^-?A\$\s?\d{1,3}(,\d{3})*\.\d{2}$|^-?\d{1,3}(,\d{3})*\.\d{2}$/,
    'CAD': /^-?C\$\s?\d{1,3}(,\d{3})*\.\d{2}$|^-?\d{1,3}(,\d{3})*\.\d{2}$/,
    'CNY': /^-?¥\s?\d{1,3}(,\d{3})*\.\d{2}$|^-?\d{1,3}(,\d{3})*\.\d{2}$/
  };

  const pattern = patterns[currencyCode] || patterns['USD'];
  return pattern.test(value.trim());
}

/**
 * Obtém exemplo de formato para placeholder
 * @param currencyCode - Código da moeda
 * @param symbol - Símbolo da moeda
 * @returns String de exemplo
 */
export function getCurrencyPlaceholder(currencyCode: string, symbol: string): string {
  const examples: { [key: string]: string } = {
    'BRL': `${symbol} 1.250,00`,
    'USD': `${symbol} 1,250.00`,
    'EUR': `1.250,00 ${symbol}`,
    'GBP': `${symbol}1,250.00`,
    'JPY': `${symbol} 1,250`,
    'KRW': `${symbol} 1,250`,
    'CHF': `${symbol} 1,250.00`,
    'AUD': `${symbol} 1,250.00`,
    'CAD': `${symbol} 1,250.00`,
    'CNY': `${symbol} 1,250.00`
  };

  return examples[currencyCode] || `${symbol} 1,250.00`;
}

/**
 * Obtém informações específicas de formatação para cada moeda
 * @param currencyCode - Código da moeda
 * @returns Objeto com informações da moeda
 */
export function getCurrencyInfo(currencyCode: string): {
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
  spaceAfterSymbol: boolean;
} {
  const currencyInfo: { [key: string]: any } = {
    'BRL': {
      decimalPlaces: 2,
      thousandsSeparator: '.',
      decimalSeparator: ',',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    },
    'USD': {
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    },
    'EUR': {
      decimalPlaces: 2,
      thousandsSeparator: '.',
      decimalSeparator: ',',
      symbolPosition: 'after',
      spaceAfterSymbol: true
    },
    'GBP': {
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolPosition: 'before',
      spaceAfterSymbol: false
    },
    'JPY': {
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    },
    'KRW': {
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    },
    'CHF': {
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    },
    'AUD': {
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    },
    'CAD': {
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    },
    'CNY': {
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      symbolPosition: 'before',
      spaceAfterSymbol: true
    }
  };

  return currencyInfo[currencyCode] || currencyInfo['USD'];
}