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
import { AuthService } from '../../services/user.service';
import { iLoginRequest } from '../../../../shared/interfaces/loginRequest.interface';

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

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  formLogin = new FormGroup({
    cpf: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthCpf), cpfValidator()]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthPassword), passwordStrengthValidator()]),
  })

  onSubmit() {
    if (this.formLogin.valid) {
      this.loadingService.startLoading('logginButton');

      const usr_identity = this.formLogin.value.cpf;
      const usr_password = this.formLogin.value.password;

      // Verifica se ambos são strings
      if (typeof usr_identity === 'string' && typeof usr_password === 'string') {
        const loginData: iLoginRequest = {
          usr_identity,
          usr_password
        };
        

        this.authService.login(loginData).subscribe({
          next: () => {
            this.router.navigate(['/home']);
            this.loadingService.stopLoading('logginButton')

          },
          error: (error) => {
            this.error = 'Credenciais inválidas';
            console.error('Login error:', error);
            this.loadingService.stopLoading('logginButton')
          }
        });
      } else {
        this.error = 'Preencha todos os campos corretamente.';
        this.loadingService.stopLoading('logginButton')

      }
    } else {
      this.error = 'Formulário inválido. Verifique os campos.';
      this.loadingService.stopLoading('logginButton')

    }
  }

}
