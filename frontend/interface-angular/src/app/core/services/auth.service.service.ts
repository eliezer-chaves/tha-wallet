import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { iUser } from '../../shared/interfaces/user.interface';
import { environment } from '../../environment/environment'

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

  // Registrar novo usuário
  register(data: iUser): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, data).pipe(
      tap(response => {
        this.setSession(response.token, response.user);
        this.router.navigate(['/home/dashboard']);
      })
    );
  }

  // Login com CPF e senha
  login(usr_cpf: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { usr_cpf, password }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.getMe().subscribe();
      })
    );
  }


  // Pega dados do usuário logado
  getMe(): Observable<iUser> {
    return this.http.get<iUser>(`${this.API_URL}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/home/dashboard']);
      })
    );
  }

  // Logout
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      next: () => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
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
}
