// src/app/domain/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { GuestGuard } from '../../core/guards/guest.guard.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () => import('../../domain/auth/pages/login.page/login.page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'register',
    canActivate: [GuestGuard],
    loadComponent: () => import('../../domain/auth/pages/create-account.page/create-account.page.component').then(m => m.CreateAccountPageComponent)
  }
];