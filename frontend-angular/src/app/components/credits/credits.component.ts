import { Component, OnInit } from '@angular/core';
import { CommonModule, FormsModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Componente de Gestão de Créditos
 */
@Component({
  selector: 'app-credits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent implements OnInit {
  creditsBalance: number = 0;
  transactions: any[] = [];
  loading: boolean = false;
  submitting: boolean = false;

  // Formulário de compra
  purchaseAmount: number = 10;
  paymentMethod: string = 'stripe';

  // Pacotes predefinidos
  packages = [
    { amount: 10, price: 'R$ 9,90' },
    { amount: 25, price: 'R$ 19,90' },
    { amount: 50, price: 'R$ 39,90' },
    { amount: 100, price: 'R$ 79,90' }
  ];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCreditsData();
  }

  /**
   * Carregar dados de créditos
   */
  loadCreditsData(): void {
    this.loading = true;

    // Obter saldo
    this.apiService.getCreditsBalance().subscribe({
      next: (data) => {
        this.creditsBalance = data.balance;
      },
      error: (error) => {
        console.error('Erro ao obter saldo:', error);
      }
    });

    // Obter transações
    this.apiService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao obter transações:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Selecionar pacote
   */
  selectPackage(amount: number): void {
    this.purchaseAmount = amount;
  }

  /**
   * Comprar créditos
   */
  purchaseCredits(): void {
    if (this.purchaseAmount <= 0) {
      this.notificationService.warning('Selecione uma quantidade válida de créditos');
      return;
    }

    this.submitting = true;

    this.apiService.purchaseCredits({
      amount: this.purchaseAmount,
      paymentMethod: this.paymentMethod
    }).subscribe({
      next: (data) => {
        this.notificationService.success(`${this.purchaseAmount} créditos adicionados com sucesso!`);
        this.creditsBalance = data.balance;
        this.loadCreditsData();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao comprar créditos:', error);
        this.notificationService.error('Erro ao processar compra. Tente novamente.');
        this.submitting = false;
      }
    });
  }
}
