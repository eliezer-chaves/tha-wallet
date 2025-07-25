import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { catchError, combineLatest, filter, forkJoin, map, Observable, of, startWith, Subscription, tap } from 'rxjs';
import { TransactionService } from '../../services/transaction.service';
import { AccountService } from '../../services/account.service';
import { LoadingService } from '../../../../shared/services/loading.service';
import { ComponentLoadingService } from '../../../../shared/services/component-loading.service';
import { iTransaction } from '../../../../shared/interfaces/transaction.interface';
import { iAccount } from '../../../../shared/interfaces/account.interface';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-transfer.page',
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
    NzAlertModule,
    NzDatePickerModule,
    NzTypographyModule,
    NzDropDownModule,
    NzAvatarModule,
    NzMenuModule,
    NzSwitchModule,

  ],
  templateUrl: './transfer.page.component.html',
  styleUrl: './transfer.page.component.css'
})
export class TransferPageComponent implements OnInit, OnDestroy {
  @Input() transactionData: iTransaction | null = null;
  @Input() transactionEditData: iTransaction | null = null;
  @Output() formSubmitted = new EventEmitter<void>();

  componentLoading = false;
  transactionForm!: FormGroup;
  transactionEditForm!: FormGroup;
  transactionTypes: Array<{ value: string, label: string }> = [];
  accounts: iAccount[] = [];
  transactions$: Observable<iTransaction[]>;
  accounts$: Observable<iAccount[]>;
  minLengthDescription = environment.minLengthDescription || 3;
  currencies: Array<{ value: string, name: string, symbol: string }> = [];
  accountsMessage?: string = 'Para começar a gerenciar suas transações, é necessário ter pelo menos 2 contas cadastradas.'
  modalAddTransactionVisible = false;
  modalEditTransactionVisible = false;

  // Propriedades para formatação de valor - Modal de adicionar
  stringAmount: string = '';
  floatAmount: number = 0;

  // Propriedades para formatação de valor - Modal de editar
  editStringAmount: string = '';
  editFloatAmount: number = 0;
  stringSalary: string = '';
  floatSalary: number = 0;

  // Propriedades para controle de caracteres na descrição
  descriptionCount: number = 0;
  editDescriptionCount: number = 0;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private modal: NzModalService,
    private router: Router,
    public transactionService: TransactionService,
    public accountService: AccountService,
    private notificationService: NzNotificationService,
    public loadingService: LoadingService,
    public componentLoadingService: ComponentLoadingService
  ) {
    this.transactions$ = this.transactionService.transactions$.pipe(
      map(transactions => transactions || []),
      startWith([] as iTransaction[])
    );

    this.accounts$ = this.accountService.accounts$.pipe(
      map(accounts => accounts || []),
      startWith([] as iAccount[])
    );
  }

  ngOnInit(): void {
    this.componentLoadingService.startLoading('transactionPage');
    this.initForm();
    this.initEditForm();

    // Combina observables para reagir a mudanças nos saldos
    this.subscriptions.add(
      this.transactionService.balanceChange$.subscribe(() => {
        // Quando há mudança nos saldos, recarrega as contas
        this.accountService.refreshBalances().subscribe();
      })
    );

    forkJoin([
      this.transactionService.loadTransactionTypes(),
      this.accountService.loadAccounts(),
      this.loadCurrencies(),
      this.transactionService.loadTransactions().pipe(
        catchError(() => of([]))
      )
    ]).subscribe({
      next: ([types, accounts, currencies, transactions]) => {
        this.transactionTypes = types;
        this.accounts = accounts;
        if (this.accounts.length == 0) {
          this.accountsMessage = 'Para começar a gerenciar suas transações, é necessário ter pelo menos 2 contas cadastradas.'
        }
        if (this.accounts.length == 1) {
          this.accountsMessage = 'Para começar a gerenciar suas transações, é necessário cadastrar mais uma conta.'
        }
        this.componentLoadingService.stopLoading('transactionPage');
      },
      error: (error) => {
        if (error.status !== 404) {
        }
        this.componentLoadingService.stopLoading('transactionPage');
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
      })
    );
  }

  private initForm(): void {
    this.transactionForm = new FormGroup({
      trs_sender_account_id: new FormControl(null),
      trs_receiver_account_id: new FormControl(null),
      trs_amount: new FormControl('', [Validators.required, Validators.min(0.01)]),
      trs_transfer_type: new FormControl('', [Validators.required]),
      trs_description: new FormControl('', [
        Validators.maxLength(200)
      ]),
      trs_transfered_at: new FormControl(new Date(), [Validators.required])
    });

    this.transactionForm.addValidators(this.atLeastOneAccountValidator);
  }

  private initEditForm(): void {
    this.transactionEditForm = new FormGroup({
      trs_id: new FormControl(''),
      trs_sender_account_id: new FormControl(null),
      trs_receiver_account_id: new FormControl(null),
      trs_amount: new FormControl('', [Validators.required, Validators.min(0.01)]),
      trs_transfer_type: new FormControl('', [Validators.required]),
      trs_description: new FormControl('', [
        Validators.maxLength(200)
      ]),
      trs_transfered_at: new FormControl('', [Validators.required])
    });

    this.transactionEditForm.addValidators(this.atLeastOneAccountValidator);
  }

  private atLeastOneAccountValidator(control: AbstractControl): ValidationErrors | null {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const senderId = control.get('trs_sender_account_id')?.value;
    const receiverId = control.get('trs_receiver_account_id')?.value;

    if (!senderId && !receiverId) {
      return { atLeastOneAccount: true };
    }

    return null;
  }

  // ============= MÉTODOS DE NAVEGAÇÃO =============

  navigateToAccounts(): void {
    this.router.navigate(['/home/accounts']);
  }

  // ============= MÉTODOS DE FORMATAÇÃO DE MOEDA =============

  private formatCurrencyValue(value: number, currencyCode: string): string {
    const currency = this.currencies.find(c => c.value === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    const absValue = Math.abs(value);

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

  getPlaceholder(): string {
    const currencyCode = this.getSelectedCurrencyCode();
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

  private formatToBRL(value: number): string {
    const valueStr = value.toFixed(2);
    const [integerPart, decimalPart] = valueStr.split('.');
    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${withThousands},${decimalPart}`;
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ============= MÉTODOS PARA TOGGLE NEGATIVO/POSITIVO - REMOVIDOS =============
  // Removido toggle de valores negativos/positivos

  // ============= MÉTODOS DE INPUT - MODAL ADICIONAR =============

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    const rawValue = target.value;
    const currencyCode = this.getSelectedCurrencyCode();

    const currency = this.currencies.find(c => c.value === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    let cleanValue = rawValue.replace(new RegExp(`^${this.escapeRegex(symbol)}\\s*`, 'g'), '').trim();

    if (!cleanValue) {
      this.stringAmount = '';
      this.floatAmount = 0;
      this.stringSalary = '';
      this.transactionForm.get('trs_amount')?.setValue(null, { emitEvent: false });
      return;
    }

    const numbersOnly = cleanValue.replace(/[^\d]/g, '');

    if (!numbersOnly) {
      this.stringAmount = '';
      this.floatAmount = 0;
      this.stringSalary = '';
      return;
    }

    let numericValue = 0;

    if (currencyCode === 'JPY' || currencyCode === 'KRW') {
      numericValue = parseInt(numbersOnly);
    } else {
      numericValue = parseFloat(numbersOnly) / 100;
    }

    this.floatAmount = numericValue; // Sempre positivo
    this.stringAmount = this.formatCurrencyValue(numericValue, currencyCode);
    this.stringSalary = this.stringAmount;

    this.transactionForm.get('trs_amount')?.setValue(this.floatAmount, { emitEvent: false });
  }

  // ============= MÉTODOS DE INPUT - MODAL EDITAR =============

  onEditValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    const rawValue = target.value;
    const currencyCode = this.getEditSelectedCurrencyCode();

    const currency = this.currencies.find(c => c.value === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    let cleanValue = rawValue.replace(new RegExp(`^${this.escapeRegex(symbol)}\\s*`, 'g'), '').trim();

    if (!cleanValue) {
      this.editStringAmount = '';
      this.editFloatAmount = 0;
      this.transactionEditForm.get('trs_amount')?.setValue(null, { emitEvent: false });
      return;
    }

    const numbersOnly = cleanValue.replace(/[^\d]/g, '');

    if (!numbersOnly) {
      this.editStringAmount = '';
      this.editFloatAmount = 0;
      return;
    }

    let numericValue = 0;

    if (currencyCode === 'JPY' || currencyCode === 'KRW') {
      numericValue = parseInt(numbersOnly);
    } else {
      numericValue = parseFloat(numbersOnly) / 100;
    }

    this.editFloatAmount = numericValue; // Sempre positivo
    this.editStringAmount = this.formatCurrencyValue(numericValue, currencyCode);

    this.transactionEditForm.get('trs_amount')?.setValue(this.editFloatAmount, { emitEvent: false });
  }

  onKeyPress(event: KeyboardEvent): boolean {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }

    if (event.key >= '0' && event.key <= '9') {
      return true;
    }

    event.preventDefault();
    return false;
  }

  // ============= MÉTODOS DE FILTRO DE CONTAS =============

  getFilteredSenderAccounts(): iAccount[] {
    // Agrupa contas por moeda
    const accountsByCurrency = this.groupAccountsByCurrency();
    
    // Filtra apenas moedas que têm 2 ou mais contas
    const validCurrencies = Object.keys(accountsByCurrency).filter(
      currency => accountsByCurrency[currency].length >= 2
    );

    // Retorna apenas contas das moedas válidas
    return this.accounts.filter(acc => 
      acc.acc_id !== undefined && 
      validCurrencies.includes(acc.acc_currency)
    );
  }

  getFilteredReceiverAccounts(): iAccount[] {
    const senderId = this.transactionForm.get('trs_sender_account_id')?.value;

    // Se não há conta remetente selecionada, desabilita o select
    if (!senderId) return [];

    const senderAccount = this.accounts.find(acc => acc.acc_id === senderId);
    if (!senderAccount) return [];

    // Retorna contas da mesma moeda, excluindo a conta remetente
    return this.accounts.filter(acc => 
      acc.acc_id !== undefined && 
      acc.acc_id !== senderId &&
      acc.acc_currency === senderAccount.acc_currency
    );
  }

  getEditFilteredSenderAccounts(): iAccount[] {
    // Agrupa contas por moeda
    const accountsByCurrency = this.groupAccountsByCurrency();
    
    // Filtra apenas moedas que têm 2 ou mais contas
    const validCurrencies = Object.keys(accountsByCurrency).filter(
      currency => accountsByCurrency[currency].length >= 2
    );

    // Retorna apenas contas das moedas válidas
    return this.accounts.filter(acc => 
      acc.acc_id !== undefined && 
      validCurrencies.includes(acc.acc_currency)
    );
  }

  getEditFilteredReceiverAccounts(): iAccount[] {
    const senderId = this.transactionEditForm.get('trs_sender_account_id')?.value;

    // Se não há conta remetente selecionada, desabilita o select
    if (!senderId) return [];

    const senderAccount = this.accounts.find(acc => acc.acc_id === senderId);
    if (!senderAccount) return [];

    // Retorna contas da mesma moeda, excluindo a conta remetente
    return this.accounts.filter(acc => 
      acc.acc_id !== undefined && 
      acc.acc_id !== senderId &&
      acc.acc_currency === senderAccount.acc_currency
    );
  }

  // Método auxiliar para agrupar contas por moeda
  private groupAccountsByCurrency(): { [currency: string]: iAccount[] } {
    return this.accounts.reduce((groups, account) => {
      const currency = account.acc_currency;
      if (!groups[currency]) {
        groups[currency] = [];
      }
      groups[currency].push(account);
      return groups;
    }, {} as { [currency: string]: iAccount[] });
  }

  // Verifica se há contas suficientes para transações
  hasInsufficientAccounts(): boolean {
    const accountsByCurrency = this.groupAccountsByCurrency();
    const validCurrencies = Object.keys(accountsByCurrency).filter(
      currency => accountsByCurrency[currency].length >= 2
    );
    return validCurrencies.length === 0;
  }

  // Obtém mensagem de aviso sobre contas insuficientes
  getInsufficientAccountsMessage(): string {
    const accountsByCurrency = this.groupAccountsByCurrency();
    const singleAccountCurrencies = Object.keys(accountsByCurrency).filter(
      currency => accountsByCurrency[currency].length === 1
    );

    if (singleAccountCurrencies.length > 0) {
      const currencyNames = singleAccountCurrencies.map(currency => {
        const currencyObj = this.currencies.find(c => c.value === currency);
        return currencyObj?.name || currency;
      }).join(', ');
      
      return `Você possui apenas uma conta nas seguintes moedas: ${currencyNames}. Para fazer transações, é necessário ter pelo menos 2 contas da mesma moeda.`;
    }

    return 'Para fazer transações, é necessário ter pelo menos 2 contas da mesma moeda.';
  }

  // Verifica se o select de destino deve estar desabilitado
  isReceiverSelectDisabled(): boolean {
    return !this.transactionForm.get('trs_sender_account_id')?.value;
  }

  // Verifica se o select de destino deve estar desabilitado (modo edição)
  isEditReceiverSelectDisabled(): boolean {
    return !this.transactionEditForm.get('trs_sender_account_id')?.value;
  }

  // ============= MÉTODOS PARA EXIBIR NOME DA CONTA COM MOEDA =============

  getAccountNameWithCurrency(accountId: number | undefined): string {
    if (!accountId) return 'Conta não encontrada';
    
    const account = this.accounts.find(acc => acc.acc_id === accountId);
    if (!account) return 'Conta não encontrada';
    
    const currency = this.currencies.find(c => c.value === account.acc_currency);
    const symbol = currency?.symbol || account.acc_currency;
    
    return `${account.acc_name} (${symbol})`;
  }

  // ============= MÉTODOS DE VALIDAÇÃO DE MOEDAS =============

  hasIncompatibleCurrencies(): boolean {
    const senderId = this.transactionForm.get('trs_sender_account_id')?.value;
    const receiverId = this.transactionForm.get('trs_receiver_account_id')?.value;

    if (!senderId || !receiverId) return false;

    const senderAccount = this.accounts.find(acc => acc.acc_id === senderId);
    const receiverAccount = this.accounts.find(acc => acc.acc_id === receiverId);

    if (!senderAccount || !receiverAccount) return false;

    return senderAccount.acc_currency !== receiverAccount.acc_currency;
  }

  hasEditIncompatibleCurrencies(): boolean {
    const senderId = this.transactionEditForm.get('trs_sender_account_id')?.value;
    const receiverId = this.transactionEditForm.get('trs_receiver_account_id')?.value;

    if (!senderId || !receiverId) return false;

    const senderAccount = this.accounts.find(acc => acc.acc_id === senderId);
    const receiverAccount = this.accounts.find(acc => acc.acc_id === receiverId);

    if (!senderAccount || !receiverAccount) return false;

    return senderAccount.acc_currency !== receiverAccount.acc_currency;
  }

  // ============= MÉTODOS DE EVENTOS DE MUDANÇA =============

  onTransactionTypeChange(type: string): void {
    // Reset valores quando muda o tipo
    this.resetAmountValues();
  }

  onEditTransactionTypeChange(type: string): void {
    // Reset valores quando muda o tipo
    this.resetEditAmountValues();
  }

  onAccountChange(): void {
    // Reset valores quando muda as contas
    this.resetAmountValues();
  }

  onEditAccountChange(): void {
    // Reset valores quando muda as contas
    this.resetEditAmountValues();
  }

  private resetAmountValues(): void {
    this.stringAmount = '';
    this.floatAmount = 0;
    this.stringSalary = '';
    this.transactionForm.get('trs_amount')?.setValue(null);
  }

  private resetEditAmountValues(): void {
    this.editStringAmount = '';
    this.editFloatAmount = 0;
    this.transactionEditForm.get('trs_amount')?.setValue(null);
  }

  // ============= MÉTODOS AUXILIARES DE MOEDA =============

  getSelectedCurrencyCode(): string {
    const senderId = this.transactionForm.get('trs_sender_account_id')?.value;
    const receiverId = this.transactionForm.get('trs_receiver_account_id')?.value;

    if (senderId) {
      const account = this.accounts.find(acc => acc.acc_id === senderId);
      return account?.acc_currency || 'BRL';
    }

    if (receiverId) {
      const account = this.accounts.find(acc => acc.acc_id === receiverId);
      return account?.acc_currency || 'BRL';
    }

    return 'BRL';
  }

  getEditSelectedCurrencyCode(): string {
    const senderId = this.transactionEditForm.get('trs_sender_account_id')?.value;
    const receiverId = this.transactionEditForm.get('trs_receiver_account_id')?.value;

    if (senderId) {
      const account = this.accounts.find(acc => acc.acc_id === senderId);
      return account?.acc_currency || 'BRL';
    }

    if (receiverId) {
      const account = this.accounts.find(acc => acc.acc_id === receiverId);
      return account?.acc_currency || 'BRL';
    }

    return 'BRL';
  }

  getSelectedCurrencySymbol(): string {
    const currencyCode = this.getSelectedCurrencyCode();
    const currency = this.currencies.find(c => c.value === currencyCode);
    return currency?.symbol || 'R$';
  }

  getEditSelectedCurrencySymbol(): string {
    const currencyCode = this.getEditSelectedCurrencyCode();
    const currency = this.currencies.find(c => c.value === currencyCode);
    return currency?.symbol || 'R$';
  }

  getCurrencySymbol(currency: string): string {
    const currencyObj = this.currencies.find(c => c.value === currency);
    return currencyObj?.symbol || currency;
  }

  getAmountPlaceholder(): string {
    const currencyCode = this.getSelectedCurrencyCode();
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

  getEditAmountPlaceholder(): string {
    const currencyCode = this.getEditSelectedCurrencyCode();
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

  // ============= MÉTODOS PARA LABELS DINÂMICOS =============

  getValueLabel(): string {
    const symbol = this.getSelectedCurrencySymbol();
    return `Valor (${symbol})`;
  }

  getEditValueLabel(): string {
    const symbol = this.getEditSelectedCurrencySymbol();
    return `Valor (${symbol})`;
  }

  // ============= MÉTODOS PARA CONTROLE DE DESCRIÇÃO =============

  updateDescriptionCount(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.descriptionCount = target.value.length;
  }

  updateEditDescriptionCount(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.editDescriptionCount = target.value.length;
  }

  // ============= MÉTODOS DE MODAL =============

  showModalAddTransaction(): void {
    this.modalAddTransactionVisible = true;
    this.transactionForm.reset();
    this.transactionForm.patchValue({
      trs_transfered_at: new Date()
    });
    this.resetAmountValues();
    this.descriptionCount = 0;
  }

  openEditModal(transaction: iTransaction): void {
    this.transactionEditData = transaction;

    // Obtém a moeda da transação
    const currencyCode = this.getCurrencyFromTransaction(transaction);
    const absAmount = Math.abs(transaction.trs_amount);

    // Formata o valor para display
    this.editFloatAmount = absAmount; // Sempre usa valor absoluto
    this.editStringAmount = this.formatCurrencyValue(absAmount, currencyCode);

    // Conta caracteres da descrição
    this.editDescriptionCount = transaction.trs_description?.length || 0;

    this.transactionEditForm.patchValue({
      trs_id: transaction.trs_id,
      trs_sender_account_id: transaction.trs_sender_account_id,
      trs_receiver_account_id: transaction.trs_receiver_account_id,
      trs_amount: absAmount, // Sempre positivo
      trs_transfer_type: transaction.trs_transfer_type,
      trs_description: transaction.trs_description,
      trs_transfered_at: new Date(transaction.trs_transfered_at)
    });

    this.modalEditTransactionVisible = true;
  }

  handleOkCreateTransaction(): void {
    if (this.transactionForm.valid && !this.hasIncompatibleCurrencies()) {
      this.loadingService.startLoading('submitButton');

      const formValue = this.transactionForm.getRawValue();
      const transactionData: Omit<iTransaction, 'trs_id'> = {
        trs_sender_account_id: formValue.trs_sender_account_id || null,
        trs_receiver_account_id: formValue.trs_receiver_account_id || null,
        trs_amount: formValue.trs_amount,
        trs_transfer_type: formValue.trs_transfer_type,
        trs_description: formValue.trs_description || null,
        trs_transfered_at: formValue.trs_transfered_at.toISOString(),
        created_at: '',
        updated_at: ''
      };

      this.transactionService.createTransaction(transactionData).subscribe({
        next: () => {
          this.notificationService.success('Sucesso', 'Transação criada com sucesso');
          this.transactionForm.reset();
          this.resetAmountValues();
          this.descriptionCount = 0;
          this.loadingService.stopLoading('submitButton');
          this.modalAddTransactionVisible = false;
        },
        error: (error) => {
          this.notificationService.error(error.title || 'Erro', error.message || 'Erro ao criar transação');
          this.loadingService.stopLoading('submitButton');
        }
      });
    } else {
      this.transactionForm.markAllAsTouched();
    }
  }

  handleOkEditTransaction(): void {
    if (this.transactionEditForm.valid && this.transactionEditData && !this.hasEditIncompatibleCurrencies()) {
      this.loadingService.startLoading('editButton');

      const formValue = this.transactionEditForm.getRawValue();
      const transactionData: Partial<iTransaction> = {
        trs_sender_account_id: formValue.trs_sender_account_id || null,
        trs_receiver_account_id: formValue.trs_receiver_account_id || null,
        trs_amount: formValue.trs_amount,
        trs_transfer_type: formValue.trs_transfer_type,
        trs_description: formValue.trs_description || null,
        trs_transfered_at: formValue.trs_transfered_at.toISOString()
      };

      this.transactionService.updateTransaction(this.transactionEditData.trs_id, transactionData).subscribe({
        next: () => {
          this.notificationService.success('Sucesso', 'Transação atualizada com sucesso');
          this.transactionEditForm.reset();
          this.resetEditAmountValues();
          this.editDescriptionCount = 0;
          this.loadingService.stopLoading('editButton');
          this.modalEditTransactionVisible = false;
        },
        error: (error) => {
          this.notificationService.error(error.title || 'Erro', error.message || 'Erro ao atualizar transação');
          this.loadingService.stopLoading('editButton');
        }
      });
    } else {
      this.transactionEditForm.markAllAsTouched();
    }
  }

  confirmDeleteTransaction(transaction: iTransaction): void {
    this.loadingService.startLoading('deleteButton');
    this.modal.confirm({
      nzTitle: 'Tem certeza que deseja excluir esta transação?',
      nzContent: 'Essa ação é irreversível e afetará o saldo das contas envolvidas.',
      nzOkText: 'Sim, excluir',
      nzCancelText: 'Cancelar',
      nzOkDanger: true,
      nzOnOk: () => this.deleteTransaction(transaction.trs_id),
      nzOnCancel: () => this.loadingService.stopLoading('deleteButton')
    });
  }

  private deleteTransaction(transactionId: number): void {
    this.loadingService.startLoading('deleteButton');

    this.transactionService.deleteTransaction(transactionId).subscribe({
      next: () => {
        this.notificationService.success('Sucesso', 'Transação excluída com sucesso');
        this.loadingService.stopLoading('deleteButton');
        this.modalEditTransactionVisible = false;
      },
      error: (error) => {
        this.notificationService.error(error.title || 'Erro', error.message || 'Erro ao excluir transação');
        this.loadingService.stopLoading('deleteButton');
      }
    });
  }

  cancelModalAddTransaction(): void {
    this.modalAddTransactionVisible = false;
    this.transactionForm.reset();
    this.resetAmountValues();
    this.descriptionCount = 0;
  }

  cancelModalEditTransaction(): void {
    this.modalEditTransactionVisible = false;
    this.transactionEditForm.reset();
    this.resetEditAmountValues();
    this.editDescriptionCount = 0;
    this.transactionEditData = null;
  }

  // ============= MÉTODOS AUXILIARES =============

  getAccountName(accountId: number | null): string {
    if (!accountId) return 'N/A';
    const account = this.accounts.find(acc => acc.acc_id === accountId);
    return account?.acc_name || 'Conta não encontrada';
  }

  getCurrencyFromTransaction(transaction: iTransaction): string {
    // Tenta obter a moeda da conta remetente primeiro
    if (transaction.trs_sender_account_id) {
      const account = this.accounts.find(acc => acc.acc_id === transaction.trs_sender_account_id);
      if (account) return account.acc_currency;
    }

    // Se não houver conta remetente, tenta a conta destinatária
    if (transaction.trs_receiver_account_id) {
      const account = this.accounts.find(acc => acc.acc_id === transaction.trs_receiver_account_id);
      if (account) return account.acc_currency;
    }

    // Retorna BRL como padrão
    return 'BRL';
  }

  getTransactionTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'transfer': '#1890ff',
      'income': '#52c41a',
      'expense': '#ff4d4f',
      'deposit': '#13c2c2',
      'withdrawal': '#fa8c16'
    };
    return colors[type] || '#d9d9d9';
  }

  getTransactionTypeLabel(type: string): string {
    const typeObj = this.transactionTypes.find(t => t.value === type);
    return typeObj?.label || type;
  }

  getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'transfer': 'swap',
      'income': 'arrow-down',
      'expense': 'arrow-up',
      'deposit': 'plus-circle',
      'withdrawal': 'minus-circle'
    };
    return icons[type] || 'transaction';
  }

  formatCurrency(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  isFormValid(form: FormGroup): boolean {
    return form.valid;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}