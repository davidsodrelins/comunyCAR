import { Component, OnInit } from '@angular/core';
import { CommonModule, FormsModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Componente de Preferências de Notificação
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  preferences: any = {
    emailEnabled: true,
    whatsappEnabled: false,
    pushEnabled: false
  };

  whatsappStatus: any = {
    connected: false,
    status: 'disconnected'
  };

  phoneNumber: string = '';
  qrCode: string = '';
  loading: boolean = false;
  submitting: boolean = false;
  showWhatsappForm: boolean = false;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPreferences();
    this.loadWhatsappStatus();
  }

  /**
   * Carregar preferências
   */
  loadPreferences(): void {
    this.loading = true;
    this.apiService.getNotificationPreferences().subscribe({
      next: (data) => {
        this.preferences = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar preferências:', error);
        this.notificationService.error('Erro ao carregar preferências');
        this.loading = false;
      }
    });
  }

  /**
   * Carregar status do WhatsApp
   */
  loadWhatsappStatus(): void {
    this.apiService.getWhatsappStatus().subscribe({
      next: (data) => {
        this.whatsappStatus = data;
      },
      error: (error) => {
        console.error('Erro ao carregar status:', error);
      }
    });
  }

  /**
   * Atualizar preferências
   */
  updatePreferences(): void {
    this.submitting = true;

    this.apiService.updateNotificationPreferences(this.preferences).subscribe({
      next: (data) => {
        this.notificationService.success('Preferências atualizadas com sucesso!');
        this.preferences = data;
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar preferências:', error);
        this.notificationService.error('Erro ao atualizar preferências');
        this.submitting = false;
      }
    });
  }

  /**
   * Conectar WhatsApp
   */
  connectWhatsapp(): void {
    if (!this.phoneNumber.trim()) {
      this.notificationService.warning('Por favor, informe seu número de telefone');
      return;
    }

    this.submitting = true;

    this.apiService.connectWhatsapp({ phoneNumber: this.phoneNumber }).subscribe({
      next: (data) => {
        this.whatsappStatus = data;
        this.qrCode = data.qrCode;
        this.notificationService.info('Escaneie o QR code com seu WhatsApp');
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao conectar WhatsApp:', error);
        this.notificationService.error('Erro ao conectar WhatsApp');
        this.submitting = false;
      }
    });
  }

  /**
   * Desconectar WhatsApp
   */
  disconnectWhatsapp(): void {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) {
      return;
    }

    this.submitting = true;

    this.apiService.disconnectWhatsapp().subscribe({
      next: () => {
        this.notificationService.success('WhatsApp desconectado com sucesso!');
        this.whatsappStatus = { connected: false, status: 'disconnected' };
        this.phoneNumber = '';
        this.qrCode = '';
        this.showWhatsappForm = false;
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao desconectar:', error);
        this.notificationService.error('Erro ao desconectar WhatsApp');
        this.submitting = false;
      }
    });
  }

  /**
   * Alternar formulário WhatsApp
   */
  toggleWhatsappForm(): void {
    this.showWhatsappForm = !this.showWhatsappForm;
    if (!this.showWhatsappForm) {
      this.phoneNumber = '';
      this.qrCode = '';
    }
  }
}
