export interface iBalanceSummary {
  totals: {
    [currency: string]: number;
  };
  accounts_count: number;
}

// Adicione um tipo para o possível null
export type NullableBalanceSummary = iBalanceSummary | null;