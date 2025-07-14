import { iUser } from "./user.interface";

/**
 * AUTH RESPONSE - Resposta do login/register
 * Para que serve: Estrutura da resposta quando usuário se autentica
 */
export interface iAuthResponse {
  access_token: string;    // Token JWT para autenticação
  token_type: string;      // Sempre "Bearer"
  user: iUser;             // Dados do usuário
}