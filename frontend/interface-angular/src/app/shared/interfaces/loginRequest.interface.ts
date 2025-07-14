/**
 * LOGIN REQUEST - Dados enviados no login
 * Para que serve: Estrutura dos dados enviados para /api/login
 */
export interface iLoginRequest {
  cpf: string;
  password: string;
}
