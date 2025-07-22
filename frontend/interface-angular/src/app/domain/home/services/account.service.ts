import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { iAccount } from '../../../shared/interfaces/account.interface';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AccountService {

  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Lista todas as contas do usuário logado
  getAccounts(): Observable<iAccount[]> {
    return this.http.get<iAccount[]>(`${this.API_URL}/accounts`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Retorna uma conta específica pelo ID
  getAccountById(id: number): Observable<iAccount> {
    return this.http.get<iAccount>(`${this.API_URL}/accounts/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Cria uma nova conta
  createAccount(data: iAccount): Observable<iAccount> {
    return this.http.post<iAccount>(`${this.API_URL}/accounts`, data, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Atualiza uma conta existente
  updateAccount(id: number, data: iAccount): Observable<iAccount> {
    return this.http.put<iAccount>(`${this.API_URL}/accounts/${id}`, data, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Remove uma conta
  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/accounts/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Busca os tipos de contas disponíveis (enum do Laravel)
  getAccountTypes(): Observable<string[]> {
    return this.http.get<{ types: string[] }>(`${this.API_URL}/accounts/types`, { withCredentials: true })
      .pipe(
        map(res => res.types),
        catchError(this.handleError)
      );
  }

  // Tratamento de erros estruturado igual ao AuthService
  private handleError(error: any) {
    if (error.error?.error_type) {
      return throwError(() => ({
        type: error.error.error_type,
        title: error.error.error_title,
        message: error.error.error_message
      }));
    }

    return throwError(() => ({
      type: 'unexpected_error',
      title: 'Erro inesperado',
      message: 'Erro no servidor. Tente novamente mais tarde.'
    }));
  }
}
