import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, switchMap, tap, catchError, throwError, shareReplay, map } from 'rxjs';
import { Router } from '@angular/router';
import { iUpdateUserData, iUser, iUserRegister } from '../../shared/interfaces/user.interface';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API_URL = environment.apiUrl;

  // Armazena o estado do usuário logado
  private currentUserSubject = new BehaviorSubject<iUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Flag para controlar se a inicialização já foi feita
  private isInitialized = false;
  private initializationPromise: Observable<iUser | null> | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Cadastro de novo usuário
  register(data: iUserRegister): Observable<any> {
    const mapped = {
      usr_first_name: data.usr_first_name,
      usr_last_name: data.usr_last_name,
      usr_cpf: data.usr_cpf,
      usr_email: data.usr_email,
      usr_password: data.usr_password,
      usr_password_confirmation: data.usr_password_confirmation,
      usr_phone: data.usr_phone,
      usr_birth_date: data.usr_birth_date,
      usr_address: data.usr_address,
      usr_terms_accept: data.usr_terms_accept
    };

    return this.http.post<any>(`${this.API_URL}/register`, mapped, { withCredentials: true }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.isInitialized = true;
        this.router.navigate(['/home/dashboard']);
      }),
      catchError(this.handleError)
    );
  }

  // Login com CPF e senha
  login(usr_cpf: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { usr_cpf, password }, {
      withCredentials: true
    }).pipe(
      switchMap(() => this.getMe()),
      tap(() => {
        this.isInitialized = true;
        this.router.navigate(['/home/dashboard']);
      }),
      catchError(this.handleError)
    );
  }

  // Atualiza dados do usuário
  updateUser(data: iUpdateUserData): Observable<iUser> {
    const mapped = {
      usr_password: data.usr_password,
      usr_first_name: data.usr_first_name,
      usr_last_name: data.usr_last_name,
      usr_cpf: data.usr_cpf,
      usr_email: data.usr_email,
      usr_phone: data.usr_phone,
      usr_birth_date: data.usr_birth_date,
      usr_address: data.usr_address,
    };

    return this.http.put<iUser>(`${this.API_URL}/user`, mapped, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }

  // Método simplificado para buscar dados do usuário
  getMe(): Observable<iUser> {
    return this.http.get<iUser>(`${this.API_URL}/me`, {
      withCredentials: true
    }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        if (error.status === 401) {
          this.currentUserSubject.next(null);
        }
        return this.handleError(error);
      })
    );
  }

  // Método para inicializar o estado de autenticação
  initializeAuthState(): Observable<iUser | null> {
    // Se já foi inicializado, retorna o estado atual
    if (this.isInitialized) {
      return of(this.currentUserSubject.value);
    }

    // Se já existe uma inicialização em progresso, retorna ela
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Cria uma nova inicialização
    this.initializationPromise = this.getMe().pipe(
      tap(() => this.isInitialized = true),
      catchError(() => {
        this.isInitialized = true;
        this.currentUserSubject.next(null);
        return of(null);
      }),
      shareReplay(1) // Compartilha o resultado entre múltiplas subscrições
    );

    return this.initializationPromise;
  }

  // Método para verificar se o usuário está autenticado (aguarda inicialização)
  isAuthenticated(): Observable<boolean> {
    return this.initializeAuthState().pipe(
      map(user => !!user)
    );
  }

  // Logout destrói o cookie no backend
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.clearSession();
        this.router.navigate(['/auth']);
      },
      error: () => {
        this.clearSession();
        this.router.navigate(['/auth']);
      }
    });
  }

  private clearSession() {
    this.currentUserSubject.next(null);
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // Método síncrono para verificar se há usuário em cache
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Tratamento de erros estruturado
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
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    }));
  }
}