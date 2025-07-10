import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './domain/auth/auth.routes'

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth'
  }, 
  {

    path: 'auth',
    loadComponent: () => import('./core/layout/auth.layout/auth.layout.component').then(m => m.AuthLayoutComponent),
    children: AUTH_ROUTES
  },
]
