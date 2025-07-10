import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { RegisterService } from '../../services/user.service';
import { iUser } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-create-account.page',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NzFormModule, NzInputModule, NzSelectModule, NzGridModule, CommonModule, NzDatePickerModule, NgxMaskDirective, NzRadioModule, NzCheckboxModule, NzButtonModule, NzIconModule, NzInputNumberModule],
  templateUrl: './create-account.page.component.html',
  styleUrl: './create-account.page.component.css',
  providers: [provideNgxMask()],

})
export class CreateAccountPageComponent {

  firstName: string = 'Eliezer';
  lastName: string = 'Chaves';
  birthDate: Date = new Date(1999, 0, 27);
  cpf: string = '47565827886';
  stringSalary: string = '';
  floatSalary: number = 0;
  phone: string = '12992156300';
  zipCode: string = '12040-65';
  homeNumber: string = '1467';
  complement: string = 'Bl 25 - Apt 101';
  email: string = "chaves.eliezer@outlook.com";
  password: string = 'Senai@301';
  confirmPassword: string = 'Senai@301';

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  hasTyped = false;

  minLengthName: number = 2;
  minLengthCpf: number = 11;
  minLengthPhone: number = 10;
  minLengthZipCode: number = 8;
  minLengthPassword: number = 6;

  loadingService = inject(LoadingService);

  constructor(
    private notification: NzNotificationService,
    private userApi: RegisterService

  ) { }

  formCreateAccount = new FormGroup({
    firstName: new FormControl<string>(this.firstName, [Validators.required, Validators.minLength(this.minLengthName)]),
    lastName: new FormControl<string>(this.lastName, [Validators.required, Validators.minLength(this.minLengthName)]),
    cpf: new FormControl<string>(this.cpf, [Validators.required, Validators.minLength(this.minLengthCpf)]),
    email: new FormControl<string>(this.email, [Validators.required, Validators.email]),
    password: new FormControl<string>(this.password, [Validators.required, Validators.minLength(this.minLengthPassword)]),
    confirmPassword: new FormControl(this.confirmPassword, [Validators.required]),
    phone: new FormControl<string>(this.phone, [Validators.required, Validators.minLength(this.minLengthPhone)]),
    birthDate: new FormControl<Date>(this.birthDate, [Validators.required]),
    zipCode: new FormControl(this.zipCode, [
      Validators.required,
      Validators.minLength(this.minLengthZipCode)
    ]), street: new FormControl('', Validators.required),
    homeNumber: new FormControl(this.homeNumber),
    complement: new FormControl(this.complement),
    neighborhood: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    termsControl: new FormControl(true, Validators.requiredTrue),
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


          });
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

  // Password input handler 
  // This method is called when the user types in the password field
  // It sets the hasTyped variable to true if the user has typed anything
  onPasswordInput() {
    const passwordControl = this.formCreateAccount.get('userCredentials.password');
    this.hasTyped = !!passwordControl?.value;
  }

  // Validate confirm password
  // This method checks if the confirm password matches the original password 
  validateConfirmPassword($event: any) {
    const confirmPassword = $event.target.value;
    const password = this.formCreateAccount.get('userCredentials.password')?.value;
    const confirmPasswordControl = this.formCreateAccount.get('userCredentials.confirmPassword');

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


  private mapFormToUser(formValue: any): iUser {
    return {
      usr_first_name: formValue.firstName,
      usr_last_name: formValue.lastName,
      usr_identity: formValue.cpf,
      usr_email: formValue.email,
      usr_password: formValue.password,
      usr_password_confirmation: formValue.confirmPassword,
      usr_phone: formValue.phone,
      usr_birth_date: formValue.birthDate,
      usr_address: {
        street: formValue.street,
        home_number: formValue.homeNumber,
        complement: formValue.complement,
        neighborhood: formValue.neighborhood,
        city: formValue.city,
        state: formValue.state,
        zip_code: formValue.zipCode
      },
      usr_terms_accept: Boolean(formValue.termsControl),
      // Adicione outros campos conforme necessário
    };
  }
  onSubmit() {
    if (this.formCreateAccount.valid) {
      this.loadingService.startLoading('submitButton');
      const userData = this.mapFormToUser(this.formCreateAccount.value);

      this.userApi.registerUser(userData)
        .subscribe({
          next: (response) => {
            this.notification.success('Sucesso', 'Usuario Criado');
            //this.router.navigate(['/login']);
            this.loadingService.stopLoading('submitButton');

          },
          error: (error) => {
            if (error.field) {
              // Define o erro no campo específico
              const control = this.formCreateAccount.get(error.field);
              if (control) {
                control.setErrors({ serverError: error.message });
                control.markAsTouched();
                this.loadingService.stopLoading('submitButton');

              }
            }

            // Mostra notificação com o erro
            this.notification.error('Erro', error.message);
            this.loadingService.stopLoading('submitButton');

          },
          complete: () => {
            this.loadingService.stopLoading('submitButton');
          }
        });
    } else {
      this.formCreateAccount.markAllAsTouched();
      this.loadingService.stopLoading('submitButton');

      this.notification.error('Erro', 'Dados inválidos. Verifique os campos destacados.');
    }
  }
}
