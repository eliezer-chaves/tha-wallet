import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { LoadingService } from '../../../../shared/services/loading.service';
import { ViacepService } from '../../../../shared/services/viacep.service';
import { AuthService } from '../../../../core/services/auth.service.service';
import { iUser, iUserRegister } from '../../../../shared/interfaces/user.interface';
import { passwordStrengthValidator } from '../../../../shared/functions/passwordStrength.validator';
import { cpfValidator } from '../../../../shared/functions/cpf.validator';
import { NzI18nService, pt_BR } from 'ng-zorro-antd/i18n';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-create-account.page',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NzFormModule, NzInputModule, NzSelectModule, NzGridModule, CommonModule, NzDatePickerModule, NgxMaskDirective, NzRadioModule, NzCheckboxModule, NzButtonModule, NzIconModule, NzInputNumberModule],
  templateUrl: './create-account.page.component.html',
  styleUrl: './create-account.page.component.css',
  providers: [provideNgxMask()],

})
export class CreateAccountPageComponent {

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  hasTyped = false;

  minLengthName = environment.minLengthName;
  minLengthCpf = environment.minLengthCpf;
  minLengthPhone = environment.minLengthPhone;
  minLengthZipCode = environment.minLengthZipCode;
  minLengthPassword = environment.minLengthPassword;

  loadingService = inject(LoadingService);

  constructor(
    private notification: NzNotificationService,
    private authService: AuthService,
    private i18n: NzI18nService,
    private router: Router
  ) { this.i18n.setLocale(pt_BR); }

  formCreateAccount = new FormGroup({
    firstName: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthName)]),
    lastName: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthName)]),
    cpf: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthCpf), cpfValidator()]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthPassword), passwordStrengthValidator()]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
    phone: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthPhone)]),
    birthDate: new FormControl<Date>(new Date, [Validators.required]),
    zipCode: new FormControl('', [
      Validators.required,
      Validators.minLength(this.minLengthZipCode)
    ]),
    street: new FormControl('', Validators.required),
    homeNumber: new FormControl(''),
    complement: new FormControl(''),
    neighborhood: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    termsControl: new FormControl(false, Validators.requiredTrue),
  })

  private viacep = inject(ViacepService);

  static viaCepError(control: AbstractControl): ValidationErrors | null {
    return control.hasError('viaCepError') ? { viaCepError: true } : null;
  }

  viaCEPApi(event: any): void {
    const cep = event.target.value;

    if (cep && cep.length >= 8) {
      this.viacep.searchCep(cep).subscribe({
        next: (data) => {
          if (data.erro) {
            // Define custom error on form control
            this.formCreateAccount.get('userContact.zipCode')?.setErrors({
              viaCepError: true
            });
            return;
          }

          const zipCodeControl = this.formCreateAccount.get('userContact.zipCode');
          if (zipCodeControl?.hasError('viaCepError')) {
            const errors = { ...zipCodeControl.errors };
            delete errors['viaCepError'];
            zipCodeControl.setErrors(Object.keys(errors).length ? errors : null);
          }

          //Update form control
          this.formCreateAccount.patchValue({
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          })
        },
        error: (errorMessage) => {
          // Definir erro de conexão/API
          this.formCreateAccount.get('userContact.zipCode')?.setErrors({
            viaCepError: true
          });
        }
      });
    }
  }

  onPasswordInput() {
    const passwordControl = this.formCreateAccount.get('password');
    this.hasTyped = !!passwordControl?.value;
  }

  validateConfirmPassword($event: any) {
    const confirmPassword = $event.target.value;
    const password = this.formCreateAccount.get('password')?.value;
    const confirmPasswordControl = this.formCreateAccount.get('confirmPassword');

    if (confirmPassword !== password) {
      confirmPasswordControl?.setErrors({ mismatch: true });
      confirmPasswordControl?.markAsTouched();
    } else {
      confirmPasswordControl?.setErrors(null);
    }
  }

  // Prevent paste event to avoid pasting passwords
  // This is a security measure to ensure passwords are not pasted
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }


  private mapFormToUserRegister(formValue: any): iUserRegister {
    return {
      usr_first_name: formValue.firstName,
      usr_last_name: formValue.lastName,
      usr_cpf: formValue.cpf,
      usr_email: formValue.email,
      usr_password: formValue.password,
      usr_password_confirmation: formValue.confirmPassword,
      usr_phone: formValue.phone,
      usr_birth_date: formValue.birthDate,
      usr_address: {
        zip_code: formValue.zipCode,
        street: formValue.street,
        home_number: formValue.homeNumber,
        complement: formValue.complement,
        neighborhood: formValue.neighborhood,
        city: formValue.city,
        state: formValue.state,
      },
      usr_terms_accept: formValue.termsControl,
    };
  }

  onSubmit() {
    if (this.formCreateAccount.valid) {
      this.loadingService.startLoading('submitButton');
      const userData = this.mapFormToUserRegister(this.formCreateAccount.value);

      this.authService.register(userData).subscribe({
        next: () => {
          this.notification.success('Sucesso', 'Usuário criado com sucesso!');
          this.loadingService.stopLoading('submitButton');
          // Navegação já é feita no tap do service
        },
        error: (error) => {
          this.notification.error('Erro', 'Não foi possível criar o usuário.');
          this.loadingService.stopLoading('submitButton');
        }
      });
    } else {
      this.formCreateAccount.markAllAsTouched();
      this.notification.error('Erro', 'Dados inválidos. Verifique os campos destacados.');
    }
  }

}
