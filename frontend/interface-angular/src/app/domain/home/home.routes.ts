// src/app/domain/home/home.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard.guard';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('../home/pages/home.page/home.page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('../home/pages/profile.page/profile.page.component').then(m => m.ProfilePageComponent)
  },
  {
    path: 'accounts',
    canActivate: [AuthGuard],
    loadComponent: () => import('../home/pages/account.page/account.page.component').then(m => m.AccountPageComponent)
  }
];