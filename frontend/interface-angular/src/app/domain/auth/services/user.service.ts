import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { iUser } from '../../../shared/interfaces/user.interface';
import { iApiResponse } from '../../../shared/interfaces/apiResponse.interface';
import { environment } from '../../../environment/environment';
import { iLoginRequest } from '../../../shared/interfaces/loginRequest.interface';
import { iAuthResponse } from '../../../shared/interfaces/authResponde.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL do seu Laravel

  // BehaviorSubject mantém o último valor emitido
  private currentUserSubject = new BehaviorSubject<iUser | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos para componentes se inscreverem
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verifica se há um usuário logado ao inicializar o service
    this.checkAuthStatus();
  }

  /**
   * REGISTER - Registra novo usuário
   * Para que serve: Envia dados para /api/register e salva token retornado
   */
  register(userData: iUser): Observable<iApiResponse<iUser>> {
    return this.http.post<iApiResponse<iUser>>(`${this.apiUrl}/usuarios`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Se o registro incluir autenticação automática
            this.handleRegisterSuccess(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * LOGIN - Autentica usuário
   * Para que serve: Envia credenciais para /api/login e salva token retornado
   */
  login(credentials: iLoginRequest): Observable<iAuthResponse> {
    return this.http.post<iAuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  /**
   * LOGOUT - Desloga usuário
   * Para que serve: Revoga token no backend e limpa dados locais
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => this.handleLogout()),
        catchError(this.handleError)
      );
  }

  /**
  * GET CURRENT USER - Busca dados do usuário atual
  * Para que serve: Verifica se o token ainda é válido
  */
  getCurrentUser(): Observable<iUser> {
    return this.http.get<iUser>(`${this.apiUrl}/me`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * HANDLE REGISTER SUCCESS - Processa registro bem-sucedido
   */
  private handleRegisterSuccess(user: iUser): void {
    // Aqui você pode implementar login automático após registro se necessário
    this.currentUserSubject.next(user);
    // Note: O token não é armazenado neste fluxo, apenas no login
  }
  /**
     * HANDLE AUTH RESPONSE - Processa resposta de autenticação
     * Para que serve: Salva token e atualiza estado da aplicação
     */
  private handleAuthResponse(response: iAuthResponse): void {
    localStorage.setItem('access_token', response.access_token);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * HANDLE LOGOUT - Processa logout
   * Para que serve: Limpa dados locais e redireciona para login
   */
  private handleLogout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }
  /**
    * CHECK AUTH STATUS - Verifica se usuário está logado
    * Para que serve: Executado na inicialização para manter login
    */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        },
        error: () => this.handleLogout()
      });
    }
  }

  /**
   * MÉTODOS UTILITÁRIOS
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUserValue(): iUser | null {
    return this.currentUserSubject.value;
  }
  

  /**
   * HANDLE ERROR - Tratamento centralizado de erros
   */
  private handleError(error: HttpErrorResponse) {
    // Verifica se é um erro de conexão (servidor offline)
    if (error.status === 0) {
      return throwError(() => ({
        success: false,
        message: 'Servidor fora do ar. Tente novamente mais tarde.'
      }));
    }

    // Retorna o erro do backend como está
    return throwError(() => error.error || {
      success: false,
      message: 'Erro desconhecido'
    });
  }
}