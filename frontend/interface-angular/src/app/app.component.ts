import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from './core/services/auth.service.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Simplesmente inicializa o estado de autenticação
    // Os guards vão lidar com o redirecionamento
    this.authService.initializeAuthState().subscribe({
      next: (user) => {
        //console.log('Auth state initialized:', !!user);
      },
      error: (error) => {
        //console.error('Error initializing auth state:', error);
      }
    });

    
  }

}
