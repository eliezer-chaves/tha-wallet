import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../domain/auth/services/user.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // URLs públicas que não requerem autenticação
  const publicUrls = ['/auth/login', '/auth/register']; // Ajuste conforme suas rotas
  if (publicUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getToken();
  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout().subscribe(() => {
          router.navigate(['/auth/login'], {
            queryParams: { sessionExpired: true }
          });
        });
      }
      return throwError(() => error);
    })
  );
};