// shared/interfaces/transaction.interface.ts

export interface iTransaction {
  trs_id: number;
  trs_sender_account_id: number | null;
  trs_receiver_account_id: number | null;
  trs_amount: number;
  trs_transfer_type: string;
  trs_description: string | null;
  trs_transfered_at: string; // ISO date string
  created_at: string;
  updated_at: string;
  
  // Relacionamentos (opcional - podem vir do backend)
  senderAccount?: {
    acc_id: number;
    acc_name: string;
    acc_type: string;
  };
  
  receiverAccount?: {
    acc_id: number;
    acc_name: string;
    acc_type: string;
  };
}