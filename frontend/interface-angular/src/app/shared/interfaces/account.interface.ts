export interface iAccount {
  acc_id?: number;
  usr_id: number;
  acc_name: string;
  acc_type: string;
  acc_color: string;
  acc_currency: string; // Novo campo
  acc_initial_value: number;
  acc_current_balance: number;
}