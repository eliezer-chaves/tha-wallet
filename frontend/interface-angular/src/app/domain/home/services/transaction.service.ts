import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { iTransaction } from '../../../shared/interfaces/transaction.interface';
import { AccountService } from './account.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private API_URL = environment.apiUrl;

  // Armazena o estado das transações em memória
  private transactionsSubject = new BehaviorSubject<iTransaction[] | null>(null);
  public transactions$ = this.transactionsSubject.asObservable();

  // Armazena os tipos de transação
  private typesSubject = new BehaviorSubject<Array<{ value: string, label: string }> | null>(null);
  public types$ = this.typesSubject.asObservable();
  
  // Subject para notificar sobre mudanças que afetam saldos
  private balanceChangeSubject = new Subject<void>();
  public balanceChange$ = this.balanceChangeSubject.asObservable();

  // Subject para notificar sobre novas transações
  private transactionCreatedSubject = new Subject<iTransaction>();
  public transactionCreated$ = this.transactionCreatedSubject.asObservable();

  constructor(private http: HttpClient, private accountService: AccountService) { }

  /**
   * Carrega todas as transações do usuário (com cache)
   * @param forceRefresh Ignora o cache e força requisição ao servidor
   */
  loadTransactions(forceRefresh = false): Observable<iTransaction[]> {
    if (!forceRefresh && this.transactionsSubject.value !== null) {
      return of(this.transactionsSubject.value);
    }

    return this.http.get<{ success: boolean, data: iTransaction[] }>(
      `${this.API_URL}/transactions`,
      { withCredentials: true }
    ).pipe(
      map(res => res.data || []), // Garante que sempre retorne um array
      tap(transactions => this.transactionsSubject.next(transactions)),
      catchError(error => {
        // Em caso de erro, emite um array vazio e loga o erro
        console.error('Erro ao carregar transações:', error);
        return of([]);
      }),
      tap(res => console.log('Resposta da API de transações:', res)),
    );
  }

  /**
   * Carrega os tipos de transação (com cache)
   * @param forceRefresh Ignora o cache e força requisição ao servidor
   */
  loadTransactionTypes(forceRefresh = false): Observable<Array<{ value: string, label: string }>> {
    if (!forceRefresh && this.typesSubject.value !== null) {
      return of(this.typesSubject.value);
    }

    return this.http.get<{ types: Array<{ value: string, label: string }> }>(
      `${this.API_URL}/transactions/types`,
      { withCredentials: true }
    ).pipe(
      map(res => res.types),
      tap(types => this.typesSubject.next(types)),
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza o cache de transações
   */
  refreshTransactions(): Observable<iTransaction[]> {
    return this.loadTransactions(true);
  }

  /**
   * Cria uma nova transação e atualiza saldos
   */
  createTransaction(data: Omit<iTransaction, 'trs_id'>): Observable<iTransaction> {
    return this.http.post<{ success: boolean, data: iTransaction }>(
      `${this.API_URL}/transactions`,
      data,
      { withCredentials: true }
    ).pipe(
      map(res => res.data),
      switchMap(newTransaction => {
        // Atualiza os saldos das contas primeiro
        return this.accountService.refreshBalances().pipe(
          map(() => newTransaction)
        );
      }),
      tap(newTransaction => {
        // Notifica sobre mudança nos saldos
        this.balanceChangeSubject.next();
        
        // Notifica todos os subscribers sobre a nova transação
        this.transactionCreatedSubject.next(newTransaction);

        // Atualiza a lista local de transações
        const current = this.transactionsSubject.value || [];
        this.transactionsSubject.next([newTransaction, ...current]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza uma transação existente e os saldos
   */
  updateTransaction(id: number, data: Partial<iTransaction>): Observable<iTransaction> {
    return this.http.put<{ success: boolean, data: iTransaction }>(
      `${this.API_URL}/transactions/${id}`,
      data,
      { withCredentials: true }
    ).pipe(
      map(res => res.data),
      switchMap(updatedTransaction => {
        // Atualiza os saldos das contas primeiro
        return this.accountService.refreshBalances().pipe(
          map(() => updatedTransaction)
        );
      }),
      tap(() => {
        // Notifica sobre mudança nos saldos
        this.balanceChangeSubject.next();
        
        // Atualiza a lista de transações
        this.refreshTransactions().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Deleta uma transação e atualiza saldos
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<{ success: boolean }>(
      `${this.API_URL}/transactions/${id}`,
      { withCredentials: true }
    ).pipe(
      map(() => void 0),
      switchMap(() => {
        // Atualiza os saldos das contas primeiro
        return this.accountService.refreshBalances().pipe(
          map(() => void 0)
        );
      }),
      tap(() => {
        // Notifica sobre mudança nos saldos
        this.balanceChangeSubject.next();
        
        // Atualiza a lista de transações
        this.refreshTransactions().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtém uma transação específica por ID
   */
  getTransactionById(id: number): Observable<iTransaction> {
    return this.http.get<{ success: boolean, data: iTransaction }>(
      `${this.API_URL}/transactions/${id}`,
      { withCredentials: true }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  /**
   * Filtra transações por conta
   */
  getTransactionsByAccount(accountId: number): Observable<iTransaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions?.filter(t =>
        t.trs_sender_account_id === accountId ||
        t.trs_receiver_account_id === accountId
      ) || [])
    );
  }

  /**
   * Filtra transações por tipo
   */
  getTransactionsByType(type: string): Observable<iTransaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions?.filter(t => t.trs_transfer_type === type) || [])
    );
  }

  /**
   * Filtra transações por período
   */
  getTransactionsByDateRange(startDate: Date, endDate: Date): Observable<iTransaction[]> {
    return this.transactions$.pipe(
      map(transactions => transactions?.filter(t => {
        const date = new Date(t.trs_transfered_at);
        return date >= startDate && date <= endDate;
      }) || [])
    );
  }

  /**
   * Reseta o estado do serviço
   */
  resetTransactionState(): void {
    this.transactionsSubject.next(null);
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