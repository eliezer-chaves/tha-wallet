import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../domain/auth/services/user.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Acessamos o Observable diretamente (sem chamar como função)
  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/auth/login'], {
          queryParams: { redirectUrl: router.url }
        });
      }
      return true;
    })
  );
}; 