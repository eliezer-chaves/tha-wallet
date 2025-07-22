export function formatToBRL(value: number): string {
    const valueStr = value.toFixed(2);
    const [integerPart, decimalPart] = valueStr.split('.');
    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withThousands},${decimalPart}`;
}