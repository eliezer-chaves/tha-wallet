import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/user.service';
import { iUser } from '../../../../shared/interfaces/user.interface';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home.page',
  imports: [CommonModule],
  templateUrl: './home.page.component.html',
  styleUrl: './home.page.component.css'
})
export class HomePageComponent {

  currentUser$: Observable<iUser | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
    
  }

  logout(){
    this.authService.logout()
            this.router.navigate(['/auth']);
  }
}
