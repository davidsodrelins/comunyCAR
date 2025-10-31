import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Serviço de API para comunicação com o backend tRPC
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/trpc';

  constructor(private http: HttpClient) {}

  /**
   * Fazer chamada tRPC
   */
  call<T>(router: string, procedure: string, data?: any): Observable<T> {
    const url = `${this.apiUrl}/${router}.${procedure}`;
    return this.http.post<T>(url, data || {});
  }

  /**
   * Obter usuário autenticado
   */
  getMe(): Observable<any> {
    return this.call('auth', 'me');
  }

  /**
   * Logout
   */
  logout(): Observable<any> {
    return this.call('auth', 'logout');
  }

  // ============ Veículos ============

  /**
   * Criar novo veículo
   */
  createVehicle(data: any): Observable<any> {
    return this.call('vehicles', 'create', data);
  }

  /**
   * Listar veículos do usuário
   */
  listVehicles(): Observable<any> {
    return this.call('vehicles', 'list');
  }

  /**
   * Buscar veículo por placa
   */
  getVehicleByPlate(plate: string): Observable<any> {
    return this.call('vehicles', 'getByPlate', { plate });
  }

  /**
   * Adicionar usuário secundário
   */
  addSecondaryUser(data: any): Observable<any> {
    return this.call('vehicles', 'addSecondaryUser', data);
  }

  /**
   * Listar usuários de um veículo
   */
  getVehicleUsers(vehicleId: number): Observable<any> {
    return this.call('vehicles', 'getUsers', { vehicleId });
  }

  // ============ Alertas ============

  /**
   * Listar alertas fixos disponíveis
   */
  getFixedAlerts(): Observable<any> {
    return this.call('alerts', 'getFixedAlerts');
  }

  /**
   * Enviar alerta fixo
   */
  sendFixedAlert(data: any): Observable<any> {
    return this.call('alerts', 'sendFixed', data);
  }

  /**
   * Enviar alerta personalizado
   */
  sendPersonalizedAlert(data: any): Observable<any> {
    return this.call('alerts', 'sendPersonalized', data);
  }

  /**
   * Listar alertas recebidos
   */
  getReceivedAlerts(): Observable<any> {
    return this.call('alerts', 'getReceived');
  }

  /**
   * Listar alertas enviados
   */
  getSentAlerts(): Observable<any> {
    return this.call('alerts', 'getSent');
  }

  // ============ Créditos ============

  /**
   * Obter saldo de créditos
   */
  getCreditsBalance(): Observable<any> {
    return this.call('credits', 'getBalance');
  }

  /**
   * Comprar créditos
   */
  purchaseCredits(data: any): Observable<any> {
    return this.call('credits', 'purchase', data);
  }

  /**
   * Listar transações
   */
  getTransactions(): Observable<any> {
    return this.call('credits', 'getTransactions');
  }

  // ============ Notificações ============

  /**
   * Obter preferências de notificação
   */
  getNotificationPreferences(): Observable<any> {
    return this.call('notifications', 'getPreferences');
  }

  /**
   * Atualizar preferências de notificação
   */
  updateNotificationPreferences(data: any): Observable<any> {
    return this.call('notifications', 'updatePreferences', data);
  }

  /**
   * Registrar token de push
   */
  registerPushToken(data: any): Observable<any> {
    return this.call('notifications', 'registerPushToken', data);
  }

  /**
   * Listar tokens de push
   */
  getPushTokens(): Observable<any> {
    return this.call('notifications', 'getPushTokens');
  }

  /**
   * Conectar WhatsApp
   */
  connectWhatsapp(data: any): Observable<any> {
    return this.call('notifications', 'connectWhatsapp', data);
  }

  /**
   * Desconectar WhatsApp
   */
  disconnectWhatsapp(): Observable<any> {
    return this.call('notifications', 'disconnectWhatsapp');
  }

  /**
   * Obter status do WhatsApp
   */
  getWhatsappStatus(): Observable<any> {
    return this.call('notifications', 'getWhatsappStatus');
  }
}
