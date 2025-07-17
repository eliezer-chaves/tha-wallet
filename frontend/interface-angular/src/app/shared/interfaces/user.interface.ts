import { iUserAddress } from "./userAdress.interface";

// Interface base do usuário (dados salvos no banco/localStorage)
export interface iUser {
    usr_first_name: string;
    usr_last_name: string;
    usr_cpf: string;
    usr_email: string;
    usr_phone?: string;
    usr_birth_date?: Date;
    usr_address?: iUserAddress;
    usr_terms_accept?: boolean;
}

// Interface para registro de novo usuário
export interface iUserRegister {
    usr_first_name: string;
    usr_last_name: string;
    usr_cpf: string;
    usr_email: string;
    usr_password: string;
    usr_password_confirmation: string;
    usr_phone?: string;
    usr_birth_date?: Date;
    usr_address?: iUserAddress;
    usr_terms_accept: boolean;
}

// Interface para atualização de usuário existente
export interface iUpdateUserData {
    usr_password: string; // Senha atual para validação
    usr_first_name: string;
    usr_last_name: string;
    usr_cpf: string;
    usr_email: string;
    usr_phone?: string;
    usr_birth_date?: Date;
    usr_address?: iUserAddress;
}