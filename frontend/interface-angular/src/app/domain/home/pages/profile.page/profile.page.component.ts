import { Component, inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service.service';
import { iUser } from '../../../../shared/interfaces/user.interface';
import { environment } from '../../../../environment/environment';
import { cpfValidator } from '../../../../shared/functions/cpf.validator';
import { passwordStrengthValidator } from '../../../../shared/functions/passwordStrength.validator';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { ViacepService } from '../../../../shared/services/viacep.service';

@Component({
  selector: 'app-profile-page',
  imports: [ ReactiveFormsModule, FormsModule, NzFormModule, NzInputModule, NzSelectModule, NzGridModule, CommonModule, NzDatePickerModule, NgxMaskDirective, NzRadioModule, NzCheckboxModule, NzButtonModule, NzIconModule, NzInputNumberModule],
  templateUrl: './profile.page.component.html',
  styleUrls: ['./profile.page.component.css'],
  providers: [provideNgxMask()],

})
export class ProfilePageComponent implements OnDestroy {
  currentUser$: Observable<iUser | null>;
  private subscription!: Subscription;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  hasTyped = false;
  minLengthName = environment.minLengthName;
  minLengthCpf = environment.minLengthCpf;
  minLengthPhone = environment.minLengthPhone;
  minLengthZipCode = environment.minLengthZipCode;
  minLengthPassword = environment.minLengthPassword;

  // Variáveis para os dados do usuário
  firstName = '';
  lastName = '';
  cpf = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  birthDate = new Date();
  zipCode = '';
  street = '';
  homeNumber = '';
  complement = '';
  neighborhood = '';
  city = '';
  state = '';

  formUpdateUser!: FormGroup;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;

    this.subscription = this.currentUser$.subscribe(user => {
      if (user) {
        // Atribui os valores às variáveis
        this.firstName = user.usr_first_name;
        this.lastName = user.usr_last_name;
        this.cpf = user.usr_cpf;
        this.email = user.usr_email;
        this.phone = user.usr_phone;
        this.birthDate = new Date(user.usr_birth_date);

        const address = user.usr_address;
        if (address) {
          this.zipCode = address.zip_code;
          this.street = address.street;
          this.homeNumber = address.home_number;
          this.complement = address.complement;
          this.neighborhood = address.neighborhood;
          this.city = address.city;
          this.state = address.state;
        }

        // Agora que os dados estão carregados, criamos o form
        this.createForm();
      }
    });
  }

  createForm() {
    this.formUpdateUser = new FormGroup({
      firstName: new FormControl<string>(this.firstName, [Validators.required, Validators.minLength(environment.minLengthName)]),
      lastName: new FormControl<string>(this.lastName, [Validators.required, Validators.minLength(environment.minLengthName)]),
      cpf: new FormControl<string>(this.cpf, [Validators.required, Validators.minLength(environment.minLengthCpf), cpfValidator()]),
      email: new FormControl<string>(this.email, [Validators.required, Validators.email]),
      password: new FormControl<string>(this.password, [Validators.required, Validators.minLength(environment.minLengthPassword), passwordStrengthValidator()]),
      confirmPassword: new FormControl<string>(this.confirmPassword, [Validators.required]),
      phone: new FormControl<string>(this.phone, [Validators.required, Validators.minLength(environment.minLengthPhone)]),
      birthDate: new FormControl<Date>(this.birthDate, [Validators.required]),
      zipCode: new FormControl(this.zipCode, [Validators.required, Validators.minLength(environment.minLengthZipCode)]),
      street: new FormControl(this.street, Validators.required),
      homeNumber: new FormControl(this.homeNumber),
      complement: new FormControl(this.complement),
      neighborhood: new FormControl(this.neighborhood, Validators.required),
      city: new FormControl(this.city, Validators.required),
      state: new FormControl(this.state, Validators.required),
    });
  }
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
            this.formUpdateUser.get('userContact.zipCode')?.setErrors({
              viaCepError: true
            });
            return;
          }

          const zipCodeControl = this.formUpdateUser.get('userContact.zipCode');
          if (zipCodeControl?.hasError('viaCepError')) {
            const errors = { ...zipCodeControl.errors };
            delete errors['viaCepError'];
            zipCodeControl.setErrors(Object.keys(errors).length ? errors : null);
          }

          //Update form control
          this.formUpdateUser.patchValue({
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf


          });
        },
        error: (errorMessage) => {
          // Definir erro de conexão/API
          this.formUpdateUser.get('userContact.zipCode')?.setErrors({
            viaCepError: true
          });
        }
      });
    }
  }

  onPasswordInput() {
    const passwordControl = this.formUpdateUser.get('password');
    this.hasTyped = !!passwordControl?.value;
  }

  validateConfirmPassword($event: any) {
    const confirmPassword = $event.target.value;
    const password = this.formUpdateUser.get('password')?.value;
    const confirmPasswordControl = this.formUpdateUser.get('confirmPassword');

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


  onSubmit() {
    if (this.formUpdateUser.valid) {
      const updatedUser = this.formUpdateUser.value;
      console.log('Usuário atualizado:', updatedUser);
    } else {
      this.formUpdateUser.markAllAsTouched();
    }
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
