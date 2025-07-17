import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { cpfValidator } from '../../../../shared/functions/cpf.validator';
import { passwordStrengthValidator } from '../../../../shared/functions/passwordStrength.validator';
import { LoadingService } from '../../../../shared/services/loading.service';
import { AuthService } from '../../../../core/services/auth.service.service';
import { iLoginRequest } from '../../../../shared/interfaces/loginRequest.interface';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-login.page',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NzFormModule, NzInputModule, NzSelectModule, NzGridModule, CommonModule, NzDatePickerModule, NgxMaskDirective, NzRadioModule, NzCheckboxModule, NzButtonModule, NzIconModule, NzInputNumberModule],
  templateUrl: './login.page.component.html',
  providers: [provideNgxMask()],
  styleUrl: './login.page.component.css',
})
export class LoginPageComponent {
  minLengthCpf: number = 11;
  passwordVisible: boolean = false
  minLengthPassword: number = 6;
  loadingService = inject(LoadingService);
  error: string | null = null;
  private notificationService = inject(NzNotificationService)
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  formLogin = new FormGroup({
    cpf: new FormControl<string>('47565827886', [Validators.required, Validators.minLength(this.minLengthCpf), cpfValidator()]),
    password: new FormControl<string>('Senai@301', [Validators.required, Validators.minLength(this.minLengthPassword), passwordStrengthValidator()]),
  })

  onSubmit() {
    if (this.formLogin.valid) {
      this.loadingService.startLoading('logginButton');

      const usr_cpf = this.formLogin.value.cpf;
      const password = this.formLogin.value.password;

      if (typeof usr_cpf === 'string' && typeof password === 'string') {
        this.authService.login(usr_cpf, password).subscribe({
          next: () => {
            this.router.navigate(['/home/dashboard']);
            this.loadingService.stopLoading('logginButton');
          },
          error: (error) => {
            this.notificationService.error(error.title, error.message)
            this.loadingService.stopLoading('logginButton');
          }
        });
      } else {
        this.error = 'Preencha todos os campos corretamente.';
        this.loadingService.stopLoading('logginButton');
      }
    } else {
      this.error = 'Formulário inválido. Verifique os campos.';
      this.loadingService.stopLoading('logginButton');
    }
  }

}
