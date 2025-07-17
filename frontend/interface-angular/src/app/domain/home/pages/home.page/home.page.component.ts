import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service.service';
import { iUser } from '../../../../shared/interfaces/user.interface';
import { AsyncPipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.page.component.html',
  styleUrl: './home.page.component.css'
})
export class HomePageComponent implements OnInit, OnDestroy {
  currentUser$: Observable<iUser | null>;
  private subscription!: Subscription;
  isLoading = true;
  currentUser: iUser | null = null;
  userName: string | undefined = ''

  constructor(private authService: AuthService) {

    this.currentUser$ = this.authService.currentUser$;
    
    this.subscription = this.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userName = this.currentUser?.usr_first_name
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
