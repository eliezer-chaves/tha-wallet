// home.layout.component.ts
import { NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../../services/auth.service.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home.layout',
  imports: [RouterModule, NzBreadCrumbModule, NzIconModule, NzMenuModule, NzLayoutModule, CommonModule],
  templateUrl: './home.layout.component.html',
  styleUrl: './home.layout.component.css'
})
export class HomeLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = false;

  toggleSider(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  goToProfile() {
    this.router.navigate(['/home/profile']);
  }
  goToAccounts() {
    this.router.navigate(['/home/accounts']);
  }

  goToHome() {
    this.router.navigate(['/home/dashboard']);
  }

  goToTransfers() {
    this.router.navigate(['/home/transfers']);
  }

  logout() {
    this.authService.logout();
  }
}
