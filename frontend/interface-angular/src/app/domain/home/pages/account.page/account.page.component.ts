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
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDividerModule } from 'ng-zorro-antd/divider';

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
    NzInputNumberModule,
    NzIconModule,
    NzModalModule,
    NzCardModule,
    NzTagModule,
    NzListModule,
    NzEmptyModule,
    NzDividerModule
  ],
  templateUrl: './account.page.component.html',
  styleUrl: './account.page.component.css'
})
export class AccountPageComponent implements OnInit, OnDestroy {

  @Input() accountData: iAccount | null = null;
  @Output() formSubmitted = new EventEmitter<void>();

  accountForm!: FormGroup;
  accountTypes: string[] = [];
  minLengthName = environment.minLengthName;
  modalAddAccountVisible = false;

  accounts: any[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private accountService: AccountService,
    private notificationService: NzNotificationService,
    public loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadAccountTypes();
    this.initForm();
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        console.log(this.accounts)
      },
      error: (err) => {
        console.error(err);
      }
    });
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
    if (!target) return;

    let rawValue = target.value;

    // Remove "R$ " se existir (para processar apenas o valor)
    rawValue = rawValue.replace(/^R\$\s*/, '');

    // Se o valor atual for apenas "-", permite (usuário está começando a digitar um negativo)
    if (rawValue === '-') {
      this.stringSalary = 'R$ -';
      this.floatSalary = 0;
      return;
    }

    // Se depois de limpar ficou vazio, limpa o campo
    if (!rawValue) {
      this.stringSalary = '';
      this.floatSalary = 0;
      this.accountForm.get('acc_initial_value')?.setValue(null, { emitEvent: false });
      return;
    }

    // Verifica se começa com negativo ANTES de remover não-dígitos
    const isNegative = rawValue.startsWith('-');

    // Remove tudo que não for dígito (mas preserva a informação do sinal)
    const numbers = rawValue.replace(/\D/g, '');

    // Se não há números, mostra apenas o sinal se aplicável
    if (!numbers) {
      this.stringSalary = isNegative ? 'R$ -' : '';
      this.floatSalary = 0;
    } else {
      // Converte para número e divide por 100 (para tratar centavos)
      let cents = parseFloat(numbers) / 100;
      if (isNegative) {
        cents = -cents; // Aplica o sinal negativo
      }

      this.floatSalary = cents;
      this.stringSalary = `R$ ${formatToBRL(cents)}`;
    }

    // Atualiza o formControl sem emitir evento
    this.accountForm.get('acc_initial_value')?.setValue(this.floatSalary, { emitEvent: false });
  }

  // Função para prevenir teclas inválidas
  onKeyPress(event: KeyboardEvent): boolean {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];

    // Permite teclas de controle
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }

    // Permite números
    if (event.key >= '0' && event.key <= '9') {
      return true;
    }

    // Permite "-" apenas no início e se ainda não existe um
    if (event.key === '-') {
      const target = event.target as HTMLInputElement;
      const currentValue = target.value;
      const cursorPosition = target.selectionStart || 0;

      // Só permite "-" se estiver no início e não existir outro "-"
      if (cursorPosition === 0 && !currentValue.includes('-')) {
        return true;
      }
    }

    // Bloqueia todas as outras teclas
    event.preventDefault();
    return false;
  }


  showModalAddAccount(): void {
    this.modalAddAccountVisible = true;
  }

  handleOk(): void {
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
          this.loadAccounts()
          this.loadingService.stopLoading('submitButton')
          this.modalAddAccountVisible = false;
        },
        error: (error) => {
          this.notificationService.error(error.title, error.message)
          this.loadingService.stopLoading('submitButton')
        }
      })
    }
  }



  cancelModalAddAccount(): void {
    this.modalAddAccountVisible = false;
    this.accountForm.reset()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}