import { iUserAddress } from "./userAdress.interface";

export interface iUser {
    usr_first_name: string;
    usr_last_name: string;
    usr_cpf: string;
    usr_email: string;
    usr_password: string;
    usr_password_confirmation: string;
    usr_phone: string;
    usr_birth_date: Date;
    usr_address: iUserAddress;
    usr_terms_accept: boolean;
}
