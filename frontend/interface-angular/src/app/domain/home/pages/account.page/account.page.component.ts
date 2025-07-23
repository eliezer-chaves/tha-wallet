import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AccountService } from '../../services/account.service';
import { iAccount } from '../../../../shared/interfaces/account.interface';
import { filter, forkJoin, Observable, startWith, Subscription, tap } from 'rxjs';
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
import { iBalanceSummary } from '../../../../shared/interfaces/balanceSummary.interace';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

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
    NzDividerModule,
    NzSpinModule
  ],
  templateUrl: './account.page.component.html',
  styleUrl: './account.page.component.css'
})
export class AccountPageComponent implements OnInit, OnDestroy {

  @Input() accountData: iAccount | null = null;
  @Output() formSubmitted = new EventEmitter<void>();

  componentLoading = false;
  accountForm!: FormGroup;
  accountTypes: string[] = [];
  minLengthName = environment.minLengthName;
  modalAddAccountVisible = false;
  balances$: Observable<iBalanceSummary>;
  accounts: any[] = [];
  currencies: Array<{ value: string, name: string, symbol: string }> = [];
  selectedCurrency: { value: string, name: string, symbol: string } | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public accountService: AccountService,
    private notificationService: NzNotificationService,
    public loadingService: LoadingService,
    public componentLoadingService: ComponentLoadingService
  ) {
    this.balances$ = this.accountService.balances$.pipe(
      filter((balance): balance is iBalanceSummary => balance !== null),
      startWith({ totals: {}, accounts_count: 0 } as iBalanceSummary)
    );
  }

  ngOnInit(): void {
    this.componentLoadingService.startLoading('accountPage');
    this.initForm();

    forkJoin([
      this.accountService.loadAccountTypes(),
      this.accountService.loadAccounts(),
      this.accountService.getBalances(),
      this.loadCurrencies()
    ]).subscribe({
      next: ([types, accounts, balances, currencies]) => {
        this.accountTypes = types;
        this.accounts = accounts;
        this.componentLoadingService.stopLoading('accountPage');
      },
      error: (error) => {
        this.notificationService.error('Erro', error);
        this.componentLoadingService.stopLoading('accountPage');
      }
    });
  }

  private loadCurrencies(): Observable<Array<{ value: string, name: string, symbol: string }>> {
    return this.accountService.getCurrencies().pipe(
      tap(currencies => {
        this.currencies = currencies.map(c => ({
          value: c.value,
          name: c.name,
          symbol: c.symbol
        }));
        
        // Define BRL como padrão
        const defaultCurrency = 'BRL';
        this.accountForm.get('acc_currency')?.setValue(defaultCurrency);
        this.selectedCurrency = this.currencies.find(c => c.value === defaultCurrency) || null;
      })
    );
  }

  // Método para lidar com mudança de moeda
  onCurrencyChange(currencyValue: string): void {
    this.selectedCurrency = this.currencies.find(c => c.value === currencyValue) || null;
    // Limpa o valor quando muda a moeda para evitar confusão
    this.stringSalary = '';
    this.floatSalary = 0;
    this.accountForm.get('acc_initial_value')?.setValue(null);
  }

  // Retorna o símbolo da moeda selecionada
  getSelectedCurrencySymbol(): string {
    return this.selectedCurrency?.symbol || 'R$';
  }

  // Retorna o label da moeda selecionada para o input
  getSelectedCurrencyLabel(): string {
    return `Valor Inicial (${this.getSelectedCurrencySymbol()})`;
  }

  // Retorna o símbolo de uma moeda específica
  getCurrencySymbol(currency: string): string {
    const currencyObj = this.currencies.find(c => c.value === currency);
    return currencyObj?.symbol || currency;
  }

  getCurrencyColor(currency: string): string {
    const colors: { [key: string]: string } = {
      'BRL': 'green',
      'USD': 'blue',
      'EUR': 'geekblue',
      'GBP': 'purple',
      'JPY': 'orange',
      'CAD': 'cyan',
      'AUD': 'lime',
      'CHF': 'magenta'
    };

    return colors[currency] || 'default';
  }

  // Helper para extrair as moedas do objeto
  getCurrencies(totals: any): string[] {
    return Object.keys(totals || {});
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
      acc_currency: new FormControl('', [
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
    const currencySymbol = this.getSelectedCurrencySymbol();

    // Remove o símbolo da moeda se existir
    const symbolRegex = new RegExp(`^${currencySymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, '');
    rawValue = rawValue.replace(symbolRegex, '');

    // Se o valor atual for apenas "-", permite (usuário está começando a digitar um negativo)
    if (rawValue === '-') {
      this.stringSalary = `${currencySymbol} -`;
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
      this.stringSalary = isNegative ? `${currencySymbol} -` : '';
      this.floatSalary = 0;
    } else {
      // Converte para número e divide por 100 (para tratar centavos)
      let cents = parseFloat(numbers) / 100;
      if (isNegative) {
        cents = -cents;
      }

      this.floatSalary = cents;
      
      // Formata de acordo com a moeda selecionada
      if (this.selectedCurrency?.value === 'BRL') {
        this.stringSalary = `${currencySymbol} ${formatToBRL(cents)}`;
      } else {
        // Para outras moedas, usa formatação padrão
        const formattedValue = Math.abs(cents).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        this.stringSalary = `${currencySymbol} ${isNegative ? '-' : ''}${formattedValue}`;
      }
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
      const currencySymbol = this.getSelectedCurrencySymbol();

      // Calcula a posição após o símbolo da moeda
      const symbolPosition = currencySymbol.length + 1; // +1 para o espaço

      // Só permite "-" se estiver na posição correta e não existir outro "-"
      if (cursorPosition === symbolPosition && !currentValue.includes('-')) {
        return true;
      }
    }

    // Bloqueia todas as outras teclas
    event.preventDefault();
    return false;
  }

  showModalAddAccount(): void {
    this.modalAddAccountVisible = true;
    
    // Redefine a moeda padrão quando abrir o modal
    if (this.currencies.length > 0) {
      const defaultCurrency = 'BRL';
      const currencyExists = this.currencies.find(c => c.value === defaultCurrency);
      
      if (currencyExists) {
        this.accountForm.get('acc_currency')?.setValue(defaultCurrency);
        this.selectedCurrency = currencyExists;
      } else {
        // Se BRL não existir, usa a primeira moeda disponível
        this.accountForm.get('acc_currency')?.setValue(this.currencies[0].value);
        this.selectedCurrency = this.currencies[0];
      }
      
      console.log('Modal aberto - Moeda selecionada:', this.selectedCurrency);
    } else {
      console.warn('Nenhuma moeda disponível ao abrir o modal');
      // Tenta recarregar as moedas se não estiverem disponíveis
      this.loadCurrencies().subscribe();
    }
  }

  handleOk(): void {
    if (this.accountForm.valid) {
      this.loadingService.startLoading('submitButton');

      const formValue = this.accountForm.getRawValue();
      const accountData: iAccount = {
        ...formValue,
        acc_id: this.accountData?.acc_id,
        acc_currency: formValue.acc_currency,
        usr_id: 0 // Será definido no backend
      };

      this.accountService.createAccount(accountData).subscribe({
        next: () => {
          this.notificationService.success('Sucesso', 'Conta criada com sucesso');
          this.accountForm.reset();
          this.stringSalary = '';
          this.floatSalary = 0;
          this.selectedCurrency = null;
          this.accountService.refreshAccounts().subscribe();
          this.loadingService.stopLoading('submitButton');
          this.accountService.refreshBalances().subscribe();
          this.modalAddAccountVisible = false;
        },
        error: (error) => {
          this.notificationService.error(error.title, error.message);
          this.loadingService.stopLoading('submitButton');
        }
      });
    } else {
      this.accountForm.markAllAsTouched();
    }
  }

  cancelModalAddAccount(): void {
    this.modalAddAccountVisible = false;
    this.accountForm.reset();
    this.stringSalary = '';
    this.floatSalary = 0;
    this.selectedCurrency = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}