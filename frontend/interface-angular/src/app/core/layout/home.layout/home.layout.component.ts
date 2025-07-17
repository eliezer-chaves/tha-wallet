import { NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-home.layout',
  imports: [RouterModule, NzBreadCrumbModule, NzIconModule, NzMenuModule, NzLayoutModule, NgClass],
  templateUrl: './home.layout.component.html',
  styleUrl: './home.layout.component.css'
})
export class HomeLayoutComponent {


  private router = inject(Router);
  isCollapsed = true;

  constructor(private elementRef: ElementRef) { }


  toggleSider(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  @ViewChild('sider') siderRef!: ElementRef;
  @ViewChild('trigger') triggerRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    const clickedSider = this.siderRef?.nativeElement?.contains(target) ?? false;
    const clickedTrigger = this.triggerRef?.nativeElement?.contains(target) ?? false;

    if (!clickedSider && !clickedTrigger && !this.isCollapsed) {
      this.isCollapsed = true;
    }
  }

  goToProfile() {
    this.router.navigate(['/home/profile']);
  }
  goToHome(){
    this.router.navigate(['/home/dashboard'])
  }


}
