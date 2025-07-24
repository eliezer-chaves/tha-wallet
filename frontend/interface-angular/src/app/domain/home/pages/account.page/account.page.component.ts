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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { iBalanceSummary } from '../../../../shared/interfaces/balanceSummary.interace';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

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
    NzSpinModule,
    NzSwitchModule
  ],
  templateUrl: './account.page.component.html',
  styleUrl: './account.page.component.css'
})
export class AccountPageComponent implements OnInit, OnDestroy {

  @Input() accountData: iAccount | null = null;
  @Input() accountEditData: iAccount | null = null;

  @Output() formSubmitted = new EventEmitter<void>();

  componentLoading = false;
  accountForm!: FormGroup;
  accountEditForm!: FormGroup;
  accountTypes: string[] = [];
  minLengthName = environment.minLengthName;
  modalAddAccountVisible = false;
  modalEditAccountVisible = false;
  balances$: Observable<iBalanceSummary>;
  accounts: any[] = [];
  currencies: Array<{ value: string, name: string, symbol: string }> = [];
  selectedCurrency: { value: string, name: string, symbol: string } | null = null;

  // Nova propriedade para controlar se o valor é negativo
  isNegativeValue: boolean = false;

  // Propriedades para formatação
  stringSalary: string = '';
  floatSalary: number = 0;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private modal: NzModalService,

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
    this.editForm();

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

  private editForm(): void {
    this.accountEditForm = new FormGroup({
      acc_name: new FormControl('', [
        Validators.required,
        Validators.minLength(this.minLengthName)
      ]),
      acc_type: new FormControl('', [
        Validators.required
      ]),
      acc_id: new FormControl(''),
    });
  }


  // ============= MÉTODOS PARA FORMATAÇÃO DE MOEDA =============

  private formatCurrencyValue(value: number, currencyCode: string): string {
    const currency = this.currencies.find(c => c.value === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    const absValue = Math.abs(value); // Sempre usa valor absoluto no display

    switch (currencyCode) {
      case 'BRL':
        return `${symbol} ${this.formatToBRL(absValue)}`;

      case 'JPY':
        const jpyValue = Math.round(absValue).toLocaleString('ja-JP');
        return `${symbol} ${jpyValue}`;

      case 'EUR':
        const eurValue = absValue.toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return `${eurValue} ${symbol}`;

      case 'GBP':
        const gbpValue = absValue.toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return `${symbol}${gbpValue}`;

      case 'KRW':
        const krwValue = Math.round(absValue).toLocaleString('ko-KR');
        return `${symbol} ${krwValue}`;

      default:
        const defaultValue = absValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return `${symbol} ${defaultValue}`;
    }
  }

  private formatToBRL(value: number): string {
    const valueStr = value.toFixed(2);
    const [integerPart, decimalPart] = valueStr.split('.');
    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withThousands},${decimalPart}`;
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ============= MÉTODOS PARA TOGGLE NEGATIVO/POSITIVO =============

  toggleNegativeValue(): void {
    // Atualiza o valor no form considerando o toggle
    const currentAbsValue = Math.abs(this.floatSalary);
    this.floatSalary = this.isNegativeValue ? -currentAbsValue : currentAbsValue;

    // Atualiza o form control
    this.accountForm.get('acc_initial_value')?.setValue(this.floatSalary, { emitEvent: false });
  }

  // ============= MÉTODOS DE INPUT =============

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    const rawValue = target.value;
    const currencyCode = this.accountForm.get('acc_currency')?.value || 'BRL';

    // Remove símbolo da moeda
    const currency = this.currencies.find(c => c.value === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    let cleanValue = rawValue.replace(new RegExp(`^${this.escapeRegex(symbol)}\\s*`, 'g'), '').trim();

    // Se o campo está vazio
    if (!cleanValue) {
      this.stringSalary = '';
      this.floatSalary = 0;
      this.accountForm.get('acc_initial_value')?.setValue(null, { emitEvent: false });
      return;
    }

    // Extrai apenas números
    const numbersOnly = cleanValue.replace(/[^\d]/g, '');

    if (!numbersOnly) {
      this.stringSalary = '';
      this.floatSalary = 0;
      return;
    }

    // Calcula o valor baseado na moeda (sempre positivo)
    let numericValue = 0;

    if (currencyCode === 'JPY' || currencyCode === 'KRW') {
      numericValue = parseInt(numbersOnly);
    } else {
      numericValue = parseFloat(numbersOnly) / 100;
    }

    // Aplica o sinal baseado no toggle
    const finalValue = this.isNegativeValue ? -numericValue : numericValue;

    this.floatSalary = finalValue;
    this.stringSalary = this.formatCurrencyValue(numericValue, currencyCode); // Mostra sempre positivo

    // Atualiza o form control
    this.accountForm.get('acc_initial_value')?.setValue(this.floatSalary, { emitEvent: false });
  }

  onKeyPress(event: KeyboardEvent): boolean {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];

    // Permite teclas de controle
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }

    // Permite apenas números
    if (event.key >= '0' && event.key <= '9') {
      return true;
    }

    // Bloqueia outras teclas (incluindo sinal de menos)
    event.preventDefault();
    return false;
  }

  // ============= MÉTODOS DE MOEDA =============

  onCurrencyChange(currencyValue: string): void {
    this.selectedCurrency = this.currencies.find(c => c.value === currencyValue) || null;

    // Reset dos valores
    this.stringSalary = '';
    this.floatSalary = 0;
    this.isNegativeValue = false; // Reset do toggle
    this.accountForm.get('acc_initial_value')?.setValue(null);
  }

  getSelectedCurrencySymbol(): string {
    const currencyCode = this.accountForm.get('acc_currency')?.value;
    if (!currencyCode) return 'R$';

    const currency = this.currencies.find(c => c.value === currencyCode);
    return currency?.symbol || currencyCode;
  }

  getSelectedCurrencyLabel(): string {
    return `Valor Inicial (${this.getSelectedCurrencySymbol()})`;
  }

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
      'CHF': 'magenta',
      'CNY': 'red',
      'KRW': 'volcano'
    };

    return colors[currency] || 'default';
  }

  getCurrencies(totals: any): string[] {
    return Object.keys(totals || {});
  }

  getPlaceholder(): string {
    const currencyCode = this.accountForm.get('acc_currency')?.value || 'BRL';
    const currency = this.currencies.find(c => c.value === currencyCode);
    const symbol = currency?.symbol || currencyCode;

    const examples: { [key: string]: string } = {
      'BRL': `${symbol} 1.250,00`,
      'USD': `${symbol} 1,250.00`,
      'EUR': `1.250,00 ${symbol}`,
      'GBP': `${symbol}1,250.00`,
      'JPY': `${symbol} 1,250`,
      'CHF': `${symbol} 1,250.00`,
      'AUD': `${symbol} 1,250.00`,
      'CAD': `${symbol} 1,250.00`,
      'CNY': `${symbol} 1,250.00`,
      'KRW': `${symbol} 1,250`
    };

    return examples[currencyCode] || `${symbol} 1,250.00`;
  }

  // ============= MÉTODOS DE MODAL =============

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
        this.accountForm.get('acc_currency')?.setValue(this.currencies[0].value);
        this.selectedCurrency = this.currencies[0];
      }

      // Reset do toggle
      this.isNegativeValue = false;
      this.stringSalary = '';
      this.floatSalary = 0;
    } else {
      this.loadCurrencies().subscribe();
    }
  }

  openEditModal(acc: iAccount): void {
    this.modalAddAccountVisible = false;

    this.accountEditForm.patchValue({
      acc_name: acc.acc_name,
      acc_color: acc.acc_color,
      acc_type: acc.acc_type,
      acc_id: acc.acc_id
    });
    this.accountEditData = acc; 

    this.modalEditAccountVisible = true;
  }

  handleOkCreateAccount(): void {
    if (this.accountForm.valid) {
      this.loadingService.startLoading('submitButton');

      const formValue = this.accountForm.getRawValue();
      const accountData: iAccount = {
        ...formValue,
        acc_id: this.accountData?.acc_id,
        acc_currency: formValue.acc_currency,
        usr_id: 0
      };

      this.accountService.createAccount(accountData).subscribe({
        next: () => {
          this.notificationService.success('Sucesso', 'Conta criada com sucesso');
          this.accountForm.reset();
          this.stringSalary = '';
          this.floatSalary = 0;
          this.selectedCurrency = null;
          this.isNegativeValue = false; // Reset do toggle
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

  handleOkEditForm(): void {
    this.loadingService.startLoading('editButton');

    if (this.accountEditForm.valid) {
      const formValue = this.accountEditForm.getRawValue();
      const accountID = formValue.acc_id;

      this.accountEditData = formValue

      if (accountID) {
        const accountData: iAccount = {
          ...formValue
        };

        this.accountService.updateAccount(accountID, accountData).subscribe({
          next: () => {
            this.notificationService.success('Sucesso', 'Conta alterada');
            this.accountEditForm.reset();
            this.loadingService.stopLoading('editButton');
            this.modalEditAccountVisible = false;
          },
          error: (error) => {
            this.notificationService.error(error.title, error.message);
            this.loadingService.stopLoading('editButton');
          }
        });
      } else {
        this.loadingService.stopLoading('editButton');
        this.notificationService.error('Erro', 'ID da conta inválido.');
      }
    } else {
      this.accountEditForm.markAllAsTouched();
      this.loadingService.stopLoading('editButton');
    }
  }

  confirmDeleteAccount(): void {
    this.loadingService.startLoading('deleteButton')
    this.modal.confirm({
      nzTitle: 'Tem certeza que deseja excluir esta conta?',
      nzContent: 'Essa ação é irreversível e removerá todas as transações vinculadas a esta conta.',
      nzOkText: 'Sim, excluir',
      nzCancelText: 'Cancelar',
      nzOnOk: () => this.deleteAccount(),
      nzOnCancel: () => this.loadingService.stopLoading('deleteButton')
    });
  }

  private deleteAccount(): void {
    if (!this.accountEditData?.acc_id) return;

    this.accountService.deleteAccount(this.accountEditData.acc_id).subscribe({
      next: () => {
        this.notificationService.success('Sucesso', 'Conta excluída com sucesso!');
        this.modalEditAccountVisible = false;
        this.loadingService.stopLoading('deleteButton');
      },
      error: (error) => {
        this.notificationService.error(error.title, error.message);
        this.loadingService.stopLoading('deleteButton');
      }
    });
  }

  cancelModalAddAccount(): void {
    this.modalAddAccountVisible = false;
    this.accountForm.reset();
    this.stringSalary = '';
    this.floatSalary = 0;
    this.selectedCurrency = null;
    this.isNegativeValue = false; // Reset do toggle
  }

  cancelModalEditAccount(): void {
    this.modalEditAccountVisible = false
    this.accountEditForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}