import { Component, OnInit } from '@angular/core';
import { CommonModule, FormsModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Componente para Envio de Alertas
 */
@Component({
  selector: 'app-send-alert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-alert.component.html',
  styleUrls: ['./send-alert.component.scss']
})
export class SendAlertComponent implements OnInit {
  fixedAlerts: any[] = [];
  selectedAlertId: number | null = null;
  plate: string = '';
  personalizedMessage: string = '';
  usePersonalized: boolean = false;
  creditsBalance: number = 0;
  loading: boolean = false;
  submitting: boolean = false;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadFixedAlerts();
    this.loadCreditsBalance();
  }

  /**
   * Carregar alertas fixos
   */
  loadFixedAlerts(): void {
    this.loading = true;
    this.apiService.getFixedAlerts().subscribe({
      next: (data) => {
        this.fixedAlerts = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar alertas fixos:', error);
        this.notificationService.error('Erro ao carregar alertas');
        this.loading = false;
      }
    });
  }

  /**
   * Carregar saldo de créditos
   */
  loadCreditsBalance(): void {
    this.apiService.getCreditsBalance().subscribe({
      next: (data) => {
        this.creditsBalance = data.balance;
      },
      error: (error) => {
        console.error('Erro ao carregar créditos:', error);
      }
    });
  }

  /**
   * Enviar alerta fixo
   */
  sendFixedAlert(): void {
    if (!this.plate.trim()) {
      this.notificationService.warning('Por favor, informe a placa do veículo');
      return;
    }

    if (!this.selectedAlertId) {
      this.notificationService.warning('Por favor, selecione um tipo de alerta');
      return;
    }

    this.submitting = true;

    this.apiService.sendFixedAlert({
      plate: this.plate.toUpperCase(),
      fixedAlertId: this.selectedAlertId
    }).subscribe({
      next: (data) => {
        this.notificationService.success('Alerta enviado com sucesso!');
        this.plate = '';
        this.selectedAlertId = null;
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao enviar alerta:', error);
        this.notificationService.error('Erro ao enviar alerta. Verifique se a placa existe.');
        this.submitting = false;
      }
    });
  }

  /**
   * Enviar alerta personalizado
   */
  sendPersonalizedAlert(): void {
    if (!this.plate.trim()) {
      this.notificationService.warning('Por favor, informe a placa do veículo');
      return;
    }

    if (!this.personalizedMessage.trim()) {
      this.notificationService.warning('Por favor, digite uma mensagem');
      return;
    }

    if (this.creditsBalance < 1) {
      this.notificationService.error('Você não possui créditos suficientes. Compre créditos para enviar mensagens personalizadas.');
      return;
    }

    this.submitting = true;

    this.apiService.sendPersonalizedAlert({
      plate: this.plate.toUpperCase(),
      message: this.personalizedMessage
    }).subscribe({
      next: (data) => {
        this.notificationService.success('Alerta personalizado enviado com sucesso!');
        this.plate = '';
        this.personalizedMessage = '';
        this.usePersonalized = false;
        this.loadCreditsBalance();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao enviar alerta:', error);
        this.notificationService.error('Erro ao enviar alerta personalizado');
        this.submitting = false;
      }
    });
  }

  /**
   * Enviar alerta
   */
  sendAlert(): void {
    if (this.usePersonalized) {
      this.sendPersonalizedAlert();
    } else {
      this.sendFixedAlert();
    }
  }
}
