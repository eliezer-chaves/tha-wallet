import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service.service';

@Component({
  selector: 'app-profile.page',
  imports: [CommonModule, AsyncPipe],
  templateUrl: './profile.page.component.html',
  styleUrl: './profile.page.component.css'
})
export class ProfilePageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;

  logout() {
    this.authService.logout();
  }
}
