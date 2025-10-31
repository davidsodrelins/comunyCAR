import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Componente de Dashboard
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  creditsBalance: number = 0;
  vehiclesCount: number = 0;
  alertsReceivedCount: number = 0;
  alertsSentCount: number = 0;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carregar dados do dashboard
   */
  loadDashboardData(): void {
    this.loading = true;

    // Obter usuário atual
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Erro ao obter usuário:', error);
        this.notificationService.error('Erro ao carregar dados do usuário');
      }
    });

    // Obter saldo de créditos
    this.apiService.getCreditsBalance().subscribe({
      next: (data) => {
        this.creditsBalance = data.balance;
      },
      error: (error) => {
        console.error('Erro ao obter saldo:', error);
      }
    });

    // Obter veículos
    this.apiService.listVehicles().subscribe({
      next: (data) => {
        this.vehiclesCount = data.length;
      },
      error: (error) => {
        console.error('Erro ao listar veículos:', error);
      }
    });

    // Obter alertas recebidos
    this.apiService.getReceivedAlerts().subscribe({
      next: (data) => {
        this.alertsReceivedCount = data.length;
      },
      error: (error) => {
        console.error('Erro ao obter alertas recebidos:', error);
      }
    });

    // Obter alertas enviados
    this.apiService.getSentAlerts().subscribe({
      next: (data) => {
        this.alertsSentCount = data.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao obter alertas enviados:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Fazer logout
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.success('Logout realizado com sucesso');
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        this.notificationService.error('Erro ao fazer logout');
      }
    });
  }
}
