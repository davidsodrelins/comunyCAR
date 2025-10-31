import { Component, OnInit } from '@angular/core';
import { CommonModule, FormsModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

/**
 * Componente de Gestão de Veículos
 */
@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  vehicles: any[] = [];
  loading: boolean = false;
  showForm: boolean = false;
  submitting: boolean = false;

  // Formulário
  formData = {
    plate: '',
    brand: '',
    model: '',
    color: ''
  };

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  /**
   * Carregar veículos
   */
  loadVehicles(): void {
    this.loading = true;
    this.apiService.listVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar veículos:', error);
        this.notificationService.error('Erro ao carregar veículos');
        this.loading = false;
      }
    });
  }

  /**
   * Alternar formulário
   */
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  /**
   * Resetar formulário
   */
  resetForm(): void {
    this.formData = {
      plate: '',
      brand: '',
      model: '',
      color: ''
    };
  }

  /**
   * Criar novo veículo
   */
  createVehicle(): void {
    if (!this.formData.plate.trim()) {
      this.notificationService.warning('Por favor, informe a placa');
      return;
    }

    if (!this.formData.brand.trim()) {
      this.notificationService.warning('Por favor, informe a marca');
      return;
    }

    if (!this.formData.model.trim()) {
      this.notificationService.warning('Por favor, informe o modelo');
      return;
    }

    this.submitting = true;

    this.apiService.createVehicle({
      plate: this.formData.plate.toUpperCase(),
      brand: this.formData.brand,
      model: this.formData.model,
      color: this.formData.color
    }).subscribe({
      next: (data) => {
        this.notificationService.success('Veículo cadastrado com sucesso!');
        this.resetForm();
        this.showForm = false;
        this.loadVehicles();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao criar veículo:', error);
        this.notificationService.error('Erro ao cadastrar veículo');
        this.submitting = false;
      }
    });
  }
}
