export function formatToBRL(value: number): string {
  const isNegative = value < 0;
  const absoluteValue = Math.abs(value);

  const valueStr = absoluteValue.toFixed(2);
  const [integerPart, decimalPart] = valueStr.split('.');
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${isNegative ? '-' : ''}${withThousands},${decimalPart}`;
}