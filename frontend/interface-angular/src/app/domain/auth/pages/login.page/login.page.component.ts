import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
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
import { cpfValidator } from '../../../../shared/functions/cpf.validator';
import { passwordStrengthValidator } from '../../../../shared/functions/passwordStrength.validator';

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

  formLogin = new FormGroup({
    cpf: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthCpf), cpfValidator()]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(this.minLengthPassword), passwordStrengthValidator()]),
  })
  
  onSubmit() {

  }
}
