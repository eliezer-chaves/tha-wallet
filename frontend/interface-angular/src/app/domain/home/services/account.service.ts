import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { iAccount } from '../../../shared/interfaces/account.interface';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { iBalanceSummary } from '../../../shared/interfaces/balanceSummary.interace';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private API_URL = environment.apiUrl;

  // Armazena o estado das contas e tipos em memória
  private accountsSubject = new BehaviorSubject<iAccount[] | null>(null);
  public accounts$ = this.accountsSubject.asObservable();

  private typesSubject = new BehaviorSubject<string[] | null>(null);
  public types$ = this.typesSubject.asObservable();

  private balancesSubject = new BehaviorSubject<iBalanceSummary | null>(null);
  public balances$ = this.balancesSubject.asObservable();

  // Cache para as moedas
  private currenciesSubject = new BehaviorSubject<Array<{ value: string, name: string, symbol: string }> | null>(null);
  public currencies$ = this.currenciesSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Obtém o saldo total das contas agrupado por moeda
   * @param forceRefresh Ignora o cache e força requisição ao servidor
   */
  getBalances(forceRefresh = false): Observable<iBalanceSummary> {
    if (!forceRefresh && this.balancesSubject.value !== null) {
      return of(this.balancesSubject.value);
    }

    return this.http.get<{ success: boolean, data: iBalanceSummary }>(`${this.API_URL}/accounts/totals`, { withCredentials: true }).pipe(
      map(res => res.data),
      tap(balances => this.balancesSubject.next(balances)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtém as moedas disponíveis (com cache)
   * @param forceRefresh Ignora o cache e força requisição ao servidor
   */
  getCurrencies(forceRefresh = false): Observable<Array<{ value: string, name: string, symbol: string }>> {
    if (!forceRefresh && this.currenciesSubject.value !== null) {
      return of(this.currenciesSubject.value);
    }

    return this.http.get<{ currencies: Array<{ value: string, name: string, symbol: string, color?: string }> }>(
      `${this.API_URL}/accounts/currencies`,
      { withCredentials: true }
    ).pipe(
      map(res => {
        // Extrai as moedas do objeto currencies e remove a propriedade color se existir
        const currencies = res.currencies || [];
        return currencies.map(currency => ({
          value: currency.value,
          name: currency.name,
          symbol: currency.symbol
        }));
      }),
      tap(currencies => {
        console.log('Moedas carregadas:', currencies);
        this.currenciesSubject.next(currencies);
      }),
      catchError(error => {
        console.error('Erro ao carregar moedas:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Atualiza os saldos (equivalente ao refreshAccounts para os balances)
   */
  refreshBalances(): Observable<iBalanceSummary> {
    return this.getBalances(true);
  }

  /**
   * Atualiza as moedas do cache
   */
  refreshCurrencies(): Observable<Array<{ value: string, name: string, symbol: string }>> {
    return this.getCurrencies(true);
  }

  // Buscar contas (com cache por padrão)
  loadAccounts(forceRefresh = false): Observable<iAccount[]> {
    if (!forceRefresh && this.accountsSubject.value !== null) {
      return of(this.accountsSubject.value);
    }

    return this.http.get<{ success: boolean, data: iAccount[] }>(`${this.API_URL}/accounts`, { withCredentials: true }).pipe(
      map(res => res.data || res as any), // Fallback para caso não venha wrapped
      tap(accounts => this.accountsSubject.next(accounts)),
      catchError(this.handleError)
    );
  }

  // Buscar tipos de conta (com cache por padrão)
  loadAccountTypes(forceRefresh = false): Observable<string[]> {
    if (!forceRefresh && this.typesSubject.value !== null) {
      return of(this.typesSubject.value);
    }

    return this.http.get<{ success: boolean, data: { types: string[] } }>(`${this.API_URL}/accounts/types`, { withCredentials: true }).pipe(
      map(res => res.data?.types || (res as any).types || []), // Múltiplos fallbacks
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
    return this.http.post<{ success: boolean, data: iAccount }>(`${this.API_URL}/accounts`, data, { withCredentials: true }).pipe(
      map(res => res.data || res as any), // Fallback para caso não venha wrapped
      tap(() => {
        // Atualiza tanto as contas quanto os saldos após criar
        this.refreshAccounts().subscribe();
        this.refreshBalances().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  updateAccount(id: number, data: iAccount): Observable<iAccount> {
    return this.http.put<{ success: boolean, data: iAccount }>(`${this.API_URL}/accounts/${id}`, data, { withCredentials: true }).pipe(
      map(res => res.data || res as any),
      tap(() => {
        this.refreshAccounts().subscribe();
        this.refreshBalances().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/accounts/${id}`, { withCredentials: true }).pipe(
      map(() => void 0),
      tap(() => {
        this.refreshAccounts().subscribe();
        this.refreshBalances().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtém uma conta específica por ID
   */
  getAccountById(id: number): Observable<iAccount> {
    return this.http.get<{ success: boolean, data: iAccount }>(`${this.API_URL}/accounts/${id}`, { withCredentials: true }).pipe(
      map(res => res.data || res as any),
      catchError(this.handleError)
    );
  }

  /**
   * Filtra contas por moeda
   */
  getAccountsByCurrency(currency: string): Observable<iAccount[]> {
    return this.accounts$.pipe(
      map(accounts => accounts?.filter(acc => acc.acc_currency === currency) || [])
    );
  }

  /**
   * Obtém o saldo total de uma moeda específica
   */
  getBalanceByCurrency(currency: string): Observable<number> {
    return this.balances$.pipe(
      map(balances => balances?.totals[currency] || 0)
    );
  }

  /**
   * Verifica se uma moeda está sendo usada por alguma conta
   */
  isCurrencyInUse(currency: string): Observable<boolean> {
    return this.accounts$.pipe(
      map(accounts => accounts?.some(acc => acc.acc_currency === currency) || false)
    );
  }

  /**
   * Obtém todas as moedas em uso pelas contas
   */
  getUsedCurrencies(): Observable<string[]> {
    return this.accounts$.pipe(
      map(accounts => {
        if (!accounts) return [];
        const currencies = accounts.map(acc => acc.acc_currency);
        return [...new Set(currencies)]; // Remove duplicatas
      })
    );
  }

  resetAccountState(): void {
    this.accountsSubject.next(null);
    this.typesSubject.next(null);
    this.balancesSubject.next(null);
    this.currenciesSubject.next(null);
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