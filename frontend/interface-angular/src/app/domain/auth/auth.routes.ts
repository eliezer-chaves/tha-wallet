import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login.page/login.page.component').then(m => m.LoginPageComponent),
    },
    {
        path: 'create-account',
        loadComponent: () => import('./pages/create-account.page/create-account.page.component').then(m => m.CreateAccountPageComponent),
    }
]
