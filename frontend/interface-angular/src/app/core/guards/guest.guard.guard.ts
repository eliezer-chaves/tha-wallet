// guest.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service.service';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated().pipe(
      tap(isAuthenticated => {
        if (isAuthenticated) {
          // Redireciona para home se já estiver logado
          this.router.navigate(['/home/dashboard']);
        }
      }),
      map(isAuthenticated => !isAuthenticated) // Inverte o resultado para guests
    );
  }
}