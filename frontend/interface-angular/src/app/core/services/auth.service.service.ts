import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { iUpdateUserData, iUser, iUserRegister } from '../../shared/interfaces/user.interface';
import { environment } from '../../environment/environment'
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API_URL = environment.apiUrl;

  // Armazena o estado do usuário logado
  private currentUserSubject = new BehaviorSubject<iUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Tenta carregar o usuário salvo no localStorage
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

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

    return this.http.post<any>(`${this.API_URL}/register`, mapped).pipe(
      tap(response => {
        this.setSession(response.token, response.user);
        this.router.navigate(['/home/dashboard']);
      }),
      catchError(this.handleError)
    );
  }


  // Login com CPF e senha
  login(usr_cpf: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { usr_cpf, password }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.getMe().subscribe();
      }),
      catchError(this.handleError)

    );
  }
  updateUser(data: iUpdateUserData): Observable<iUser> {
    const mapped = {
      usr_password: data.usr_password, // senha atual
      usr_first_name: data.usr_first_name,
      usr_last_name: data.usr_last_name,
      usr_cpf: data.usr_cpf,
      usr_email: data.usr_email,
      usr_phone: data.usr_phone,
      usr_birth_date: data.usr_birth_date,
      usr_address: data.usr_address,
    };

    return this.http.put<iUser>(`${this.API_URL}/user`, mapped).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }


  // Pega dados do usuário logado
  getMe(): Observable<iUser> {
    return this.http.get<iUser>(`${this.API_URL}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/home/dashboard']);
      }),
      catchError(this.handleError)

    );
  }

  // Logout
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
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

  // Helpers
  private setSession(token: string, user: iUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private setToken(token: string) {
    localStorage.setItem('token', token);
  }

  private clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private handleError(error: any) {
    if (error.error?.error_type) {
      // Erro customizado vindo do backend
      return throwError(() => ({
        type: error.error.error_type,
        title: error.error.error_title,
        message: error.error.error_message
      }));
    }

    // Erro inesperado ou estrutura diferente
    return throwError(() => ({
      type: 'unexpected_error',
      title: 'Erro inesperado',
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
    }));
  }

}
