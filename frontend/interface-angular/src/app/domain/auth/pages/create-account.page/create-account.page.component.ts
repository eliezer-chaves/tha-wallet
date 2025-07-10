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

@Component({
  selector: 'app-create-account.page',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NzFormModule, NzInputModule, NzSelectModule, NzGridModule, CommonModule, NzDatePickerModule, NgxMaskDirective, NzRadioModule, NzCheckboxModule, NzButtonModule, NzIconModule, NzInputNumberModule],
  templateUrl: './create-account.page.component.html',
  styleUrl: './create-account.page.component.css',
  providers: [provideNgxMask()],

})
export class CreateAccountPageComponent {

  //For debug 
  // These variables are initialized with default values
  // They can be used to pre-fill the form fields or for testing purposes
  firstName: string = 'Eliezer';
  lastName: string = 'Chaves';
  birthDate: Date = new Date(1999, 0, 27);
  cpf: string = '47565827886';

  ratingList: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // Variables to control the salary field
  stringSalary: string = '';
  floatSalary: number = 0;

  // These variables are initialized with default values
  // They can be used to pre-fill the form fields or for testing purposes
  phone: string = '12992156300';
  zipCode: string = '12040-65';
  homeNumber: string = '1467';
  complement: string = 'Bl 25 - Apt 101';
  email: string = "chaves.eliezer@outlook.com";
  password: string = 'Senai@301';
  confirmPassword: string = 'Senai@301';

  // These variables control the visibility of the password and confirm password fields
  // They are used to toggle between showing and hiding the password input
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  // This variable is used to track if the user has started typing in the password field
  // It is set to true when the user types in the password field
  hasTyped = false;

  // Minimum lengths for validation
  // These values can be adjusted as needed
  // They are used to set the minimum length for the respective fields
  minLengthName: number = 2;
  minLengthCpf: number = 11;
  minLengthPhone: number = 10;
  minLengthZipCode: number = 8;
  minLengthPassword: number = 6;

  // Inject the LoadingService to manage loading states
  // This service is used to show or hide loading indicators during form submission
  loadingService = inject(LoadingService);

  constructor(
    private notification: NzNotificationService,
  ) { }

  // Form group for the create account form
  // This form group contains nested form groups for user information, contact details, and credentials
  // Each nested form group contains form controls with their respective validators
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

  // Submit form handler
  // This method is called when the form is submitted
  onSubmit() {
    // if (this.formCreateAccount.valid) {
    //   this.loadingService.startLoading('submitButton');

    //   this.formCreateAccount.patchValue({
    //     // Update the form with the formatted salary value
    //     userInfo: {
    //       salary: this.floatSalary
    //     }
    //   });

    //   console.log(this.formCreateAccount.value)

    //   // Here you can handle the form submission, e.g., send data to a server
    //   this.userApi.createUser(this.formCreateAccount.value)
    //     .subscribe({
    //       next: (response) => {
    //         // Success
    //         this.notification.success('Form Loaded', 'The create account form has been successfully loaded.');
    //         this.loadingService.stopLoading('submitButton');

    //       },
    //       error: (error) => {
    //         // Error
    //         this.notification.error('Invalid', 'There was an error creating the account. Please try again later.');
    //         this.loadingService.stopLoading('submitButton');
    //       }
    //     });
    // } else {
    //   console.log('Form is invalid');
    //   if (this.formCreateAccount.invalid) {
    //     this.formCreateAccount.markAllAsTouched();
    //     return;
    //   }
    // }
  }



}
