import { iUserAddress } from "./userAdress.interface";

export interface iUser {
    usr_first_name: string;
    usr_last_name: string;
    usr_cpf: string;
    usr_email: string;
    // Removido: usr_password: string;
    // Removido: usr_password_confirmation?: string;
    usr_phone: string;
    usr_birth_date: Date;
    usr_address: iUserAddress;
    usr_terms_accept?: boolean;
}

// Nova interface para os dados enviados na atualização
export interface iUpdateUserData {
    usr_password: string; // Senha atual para validação (renomeado)
    usr_first_name: string;
    usr_last_name: string;
    usr_cpf: string;
    usr_email: string;
    usr_phone?: string;
    usr_birth_date?: Date;
    usr_address?: iUserAddress;
}