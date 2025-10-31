import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**
 * Serviço de Notificações (Toast)
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  /**
   * Mostrar mensagem de sucesso
   */
  success(message: string, title: string = 'Sucesso'): void {
    this.toastr.success(message, title);
  }

  /**
   * Mostrar mensagem de erro
   */
  error(message: string, title: string = 'Erro'): void {
    this.toastr.error(message, title);
  }

  /**
   * Mostrar mensagem de aviso
   */
  warning(message: string, title: string = 'Aviso'): void {
    this.toastr.warning(message, title);
  }

  /**
   * Mostrar mensagem de informação
   */
  info(message: string, title: string = 'Informação'): void {
    this.toastr.info(message, title);
  }
}
