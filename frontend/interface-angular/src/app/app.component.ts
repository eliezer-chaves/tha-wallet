import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from './core/services/auth.service.service';
import { first } from 'rxjs';
import { AccountService } from './domain/home/services/account.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {


  constructor(
    private authService: AuthService,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.authService.initializeAuthState().subscribe();

    // Carrega as contas e os tipos de conta no início da aplicação
    this.accountService.loadAccounts().subscribe();
    //this.accountService.loadAccountTypes().subscribe();
  }

}
