import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { iAccount } from '../../../shared/interfaces/account.interface';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AccountService {
  private API_URL = environment.apiUrl;

  // Armazena o estado das contas e tipos em memória
  private accountsSubject = new BehaviorSubject<iAccount[] | null>(null);
  public accounts$ = this.accountsSubject.asObservable();

  private typesSubject = new BehaviorSubject<string[] | null>(null);
  public types$ = this.typesSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Buscar contas (com cache por padrão)
  loadAccounts(forceRefresh = false): Observable<iAccount[]> {
    if (!forceRefresh && this.accountsSubject.value !== null) {
      return of(this.accountsSubject.value);
    }

    return this.http.get<iAccount[]>(`${this.API_URL}/accounts`, { withCredentials: true }).pipe(
      tap(accounts => this.accountsSubject.next(accounts)),
      catchError(this.handleError)
    );
  }

  // Buscar tipos de conta (com cache por padrão)
  loadAccountTypes(forceRefresh = false): Observable<string[]> {
    if (!forceRefresh && this.typesSubject.value !== null) {
      return of(this.typesSubject.value);
    }

    return this.http.get<{ types: string[] }>(`${this.API_URL}/accounts/types`, { withCredentials: true }).pipe(
      map(res => res.types),
      tap(types => this.typesSubject.next(types)),
      catchError(this.handleError)
    );
  }

  // Atualizar estado local manualmente (ex: após create/update/delete)
  refreshAccounts(): Observable<iAccount[]> {
    return this.loadAccounts(true);
  }

  // Métodos de CRUD (mantêm sincronismo com o estado)
  createAccount(data: iAccount): Observable<iAccount> {
    return this.http.post<iAccount>(`${this.API_URL}/accounts`, data, { withCredentials: true }).pipe(
      tap(() => this.refreshAccounts().subscribe()), // atualiza a lista
      catchError(this.handleError)
    );
  }

  updateAccount(id: number, data: iAccount): Observable<iAccount> {
    return this.http.put<iAccount>(`${this.API_URL}/accounts/${id}`, data, { withCredentials: true }).pipe(
      tap(() => this.refreshAccounts().subscribe()),
      catchError(this.handleError)
    );
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/accounts/${id}`, { withCredentials: true }).pipe(
      tap(() => this.refreshAccounts().subscribe()),
      catchError(this.handleError)
    );
  }

  resetAccountState(): void {
    this.accountsSubject.next(null);
    this.typesSubject.next(null);
  }

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
