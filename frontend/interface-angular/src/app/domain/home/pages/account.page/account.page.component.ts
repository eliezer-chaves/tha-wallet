import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AccountService } from '../../services/account.service';
import { iAccount } from '../../../../shared/interfaces/account.interface';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { LoadingService } from '../../../../shared/services/loading.service';
import { formatToBRL } from '../../../../shared/functions/formatToBRL';

@Component({
  selector: 'app-account.page',
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzGridModule,
    NzButtonModule,
    NzInputNumberModule],
  templateUrl: './account.page.component.html',
  styleUrl: './account.page.component.css'
})
export class AccountPageComponent implements OnInit, OnDestroy {

  @Input() accountData: iAccount | null = null;
  @Output() formSubmitted = new EventEmitter<void>();

  accountForm!: FormGroup;
  accountTypes: string[] = [];
  minLengthName = environment.minLengthName;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private accountService: AccountService,
    private notificationService: NzNotificationService,
    public loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadAccountTypes();
    this.initForm();
  }

  private loadAccountTypes(): void {
    const sub = this.accountService.getAccountTypes().subscribe({
      next: (types) => {
        this.accountTypes = types;
      },
      error: (err) => {
        this.notificationService.error('Erro', 'Não foi possível carregar os tipos de conta');
      }
    });
    this.subscriptions.add(sub);
  }

  private initForm(): void {
    this.accountForm = new FormGroup({
      acc_name: new FormControl('', [
        Validators.required,
        Validators.minLength(this.minLengthName)
      ]),
      acc_type: new FormControl('', [
        Validators.required
      ]),
      acc_initial_value: new FormControl('', [
        Validators.required,
      ])
    });


  }

  stringSalary: string = '';
  floatSalary: number = 0;

  onSalaryChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) {
      return;
    }

    const value = target.value;

    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      this.stringSalary = '';
      this.floatSalary = 0;
    } else {
      const cents = parseFloat(numbers) / 100;
      this.floatSalary = cents;
      // this.stringSalary = `R$ ${this.formatToBRL(cents)}`;
      this.stringSalary = `R$ ${formatToBRL(cents)}`
    }
    this.accountForm.get('acc_initial_value')?.setValue(this.floatSalary, { emitEvent: false });

  }



  onSubmit(): void {
    if (this.accountForm.valid) {
      this.loadingService.startLoading('submitButton')

      const formValue = this.accountForm.getRawValue();
      const accountData: iAccount = {
        ...formValue,
        acc_id: this.accountData?.acc_id
      }

      this.accountService.createAccount(accountData).subscribe({
        next: () => {
          this.notificationService.success('Sucesso', 'Conta criada com sucesso')
          this.accountForm.reset()
          this.loadingService.stopLoading('submitButton')
        },
        error: (error) => {
          this.notificationService.error(error.title, error.message)
          this.loadingService.stopLoading('submitButton')

        }
      })
    }
  };

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}