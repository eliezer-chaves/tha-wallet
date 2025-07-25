// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { GuestGuard } from './core/guards/guest.guard.guard';
import { AuthGuard } from './core/guards/auth.guard.guard';
import { AUTH_ROUTES } from './domain/auth/auth.routes';
import { HOME_ROUTES } from './domain/home/home.routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadComponent: () => import('./core/layout/auth.layout/auth.layout.component').then(m => m.AuthLayoutComponent),
    children: AUTH_ROUTES
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () => import('./core/layout/home.layout/home.layout.component').then(m => m.HomeLayoutComponent),
    children: HOME_ROUTES
  }
];