# Integração Angular - PayPal e Firebase

Guia completo para integrar PayPal e Firebase no frontend Angular do comunyCAR.

---

## 📋 Índice

1. [Serviço de Pagamentos](#serviço-de-pagamentos)
2. [Componente de Compra de Créditos](#componente-de-compra-de-créditos)
3. [Integração Firebase Push](#integração-firebase-push)
4. [Exemplos de Uso](#exemplos-de-uso)

---

## Serviço de Pagamentos

### Criar `src/app/services/payment.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentPackage {
  id: string;
  credits: number;
  price: number;
  discount?: number;
  popular?: boolean;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  approvalUrl?: string;
  transactionId?: string;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/trpc/payments`;

  // Pacotes de créditos predefinidos
  creditPackages: PaymentPackage[] = [
    { id: 'small', credits: 10, price: 9.90 },
    { id: 'medium', credits: 25, price: 19.90, discount: 5 },
    { id: 'large', credits: 50, price: 39.90, discount: 10, popular: true },
    { id: 'xlarge', credits: 100, price: 69.90, discount: 20 }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Obter pacotes de créditos
   */
  getPackages(): PaymentPackage[] {
    return this.creditPackages;
  }

  /**
   * Criar pagamento no PayPal
   */
  createPayment(creditsAmount: number, amount: number): Observable<PaymentResponse> {
    const returnUrl = `${window.location.origin}/payment-success`;
    const cancelUrl = `${window.location.origin}/payment-cancel`;

    return this.http.post<PaymentResponse>(`${this.apiUrl}.createPayment`, {
      creditsAmount,
      amount,
      returnUrl,
      cancelUrl
    });
  }

  /**
   * Executar pagamento aprovado
   */
  executePayment(paymentId: string, payerId: string, creditsAmount: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}.executePayment`, {
      paymentId,
      payerId,
      creditsAmount
    });
  }

  /**
   * Obter histórico de pagamentos
   */
  getPaymentHistory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}.getPaymentHistory`);
  }

  /**
   * Testar conexão PayPal (admin)
   */
  testPayPalConnection(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}.testPayPalConnection`, {});
  }

  /**
   * Testar conexão Firebase (admin)
   */
  testFirebaseConnection(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}.testFirebaseConnection`, {});
  }
}
```

---

## Componente de Compra de Créditos

### Criar `src/app/components/buy-credits/buy-credits.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService, PaymentPackage } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-buy-credits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buy-credits.component.html',
  styleUrls: ['./buy-credits.component.scss']
})
export class BuyCreditsComponent implements OnInit {
  packages: PaymentPackage[] = [];
  selectedPackage: PaymentPackage | null = null;
  isLoading = false;
  paymentInProgress = false;

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.packages = this.paymentService.getPackages();

    // Verificar se voltou do PayPal
    this.route.queryParams.subscribe(params => {
      if (params['paymentId'] && params['payerId']) {
        this.completePayment(params['paymentId'], params['payerId']);
      }
    });
  }

  /**
   * Selecionar pacote
   */
  selectPackage(pkg: PaymentPackage): void {
    this.selectedPackage = pkg;
  }

  /**
   * Iniciar pagamento
   */
  startPayment(): void {
    if (!this.selectedPackage) {
      this.notificationService.error('Selecione um pacote');
      return;
    }

    this.isLoading = true;
    this.paymentService.createPayment(
      this.selectedPackage.credits,
      this.selectedPackage.price
    ).subscribe({
      next: (response) => {
        if (response.success && response.approvalUrl) {
          // Redirecionar para PayPal
          window.location.href = response.approvalUrl;
        } else {
          this.notificationService.error('Erro ao criar pagamento');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Erro ao criar pagamento:', error);
        this.notificationService.error('Erro ao processar pagamento');
        this.isLoading = false;
      }
    });
  }

  /**
   * Completar pagamento após retorno do PayPal
   */
  private completePayment(paymentId: string, payerId: string): void {
    if (!this.selectedPackage) {
      this.notificationService.error('Sessão expirada. Tente novamente.');
      return;
    }

    this.paymentInProgress = true;
    this.paymentService.executePayment(
      paymentId,
      payerId,
      this.selectedPackage.credits
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(`${this.selectedPackage?.credits} créditos adicionados com sucesso!`);
          this.selectedPackage = null;
          // Recarregar saldo de créditos
          // this.creditsService.refreshBalance();
        } else {
          this.notificationService.error(response.error || 'Erro ao processar pagamento');
        }
        this.paymentInProgress = false;
      },
      error: (error) => {
        console.error('Erro ao executar pagamento:', error);
        this.notificationService.error('Erro ao processar pagamento');
        this.paymentInProgress = false;
      }
    });
  }

  /**
   * Calcular preço com desconto
   */
  getDiscountedPrice(pkg: PaymentPackage): number {
    if (!pkg.discount) return pkg.price;
    return pkg.price - (pkg.price * pkg.discount / 100);
  }

  /**
   * Calcular economia
   */
  getSavings(pkg: PaymentPackage): number {
    if (!pkg.discount) return 0;
    return pkg.price * pkg.discount / 100;
  }
}
```

### Criar `src/app/components/buy-credits/buy-credits.component.html`

```html
<div class="buy-credits-container">
  <div class="header">
    <h1>Comprar Créditos</h1>
    <p>Selecione um pacote e envie alertas personalizados</p>
  </div>

  <div class="packages-grid">
    <div *ngFor="let pkg of packages" 
         class="package-card" 
         [class.selected]="selectedPackage?.id === pkg.id"
         [class.popular]="pkg.popular"
         (click)="selectPackage(pkg)">
      
      <div *ngIf="pkg.popular" class="popular-badge">Popular</div>
      
      <div class="package-content">
        <h3>{{ pkg.credits }} Créditos</h3>
        
        <div class="price-section">
          <span class="price">R$ {{ getDiscountedPrice(pkg).toFixed(2) }}</span>
          <span *ngIf="pkg.discount" class="original-price">R$ {{ pkg.price.toFixed(2) }}</span>
        </div>

        <div *ngIf="pkg.discount" class="discount-badge">
          Economize R$ {{ getSavings(pkg).toFixed(2) }}
        </div>

        <p class="description">
          {{ pkg.credits }} alertas personalizados
        </p>

        <button class="btn-select" 
                [disabled]="isLoading || paymentInProgress"
                (click)="selectPackage(pkg)">
          Selecionar
        </button>
      </div>
    </div>
  </div>

  <div *ngIf="selectedPackage" class="checkout-section">
    <div class="checkout-card">
      <h2>Resumo do Pedido</h2>
      
      <div class="order-summary">
        <div class="summary-row">
          <span>Pacote:</span>
          <strong>{{ selectedPackage.credits }} Créditos</strong>
        </div>
        <div class="summary-row">
          <span>Preço:</span>
          <strong>R$ {{ getDiscountedPrice(selectedPackage).toFixed(2) }}</strong>
        </div>
        <div *ngIf="selectedPackage.discount" class="summary-row discount">
          <span>Desconto:</span>
          <strong>-R$ {{ getSavings(selectedPackage).toFixed(2) }}</strong>
        </div>
      </div>

      <button class="btn-pay" 
              [disabled]="isLoading || paymentInProgress"
              (click)="startPayment()">
        <span *ngIf="!isLoading && !paymentInProgress">Pagar com PayPal</span>
        <span *ngIf="isLoading">Processando...</span>
        <span *ngIf="paymentInProgress">Completando pagamento...</span>
      </button>

      <p class="payment-info">
        🔒 Pagamento seguro via PayPal
      </p>
    </div>
  </div>
</div>
```

### Criar `src/app/components/buy-credits/buy-credits.component.scss`

```scss
.buy-credits-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .header {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #333;
    }

    p {
      color: #666;
      font-size: 16px;
    }
  }

  .packages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;

    .package-card {
      position: relative;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;

      &:hover {
        border-color: #007bff;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
      }

      &.selected {
        border-color: #007bff;
        background: #f0f7ff;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
      }

      &.popular {
        border-color: #28a745;
        transform: scale(1.05);

        .popular-badge {
          display: block;
        }
      }

      .popular-badge {
        display: none;
        position: absolute;
        top: -10px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
      }

      .package-content {
        h3 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #333;
        }

        .price-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;

          .price {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
          }

          .original-price {
            font-size: 16px;
            color: #999;
            text-decoration: line-through;
          }
        }

        .discount-badge {
          background: #fff3cd;
          color: #856404;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .description {
          color: #666;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .btn-select {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 4px;
          background: #007bff;
          color: white;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;

          &:hover:not(:disabled) {
            background: #0056b3;
          }

          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }
  }

  .checkout-section {
    display: flex;
    justify-content: center;
    margin-top: 40px;

    .checkout-card {
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 30px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);

      h2 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #333;
      }

      .order-summary {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 20px;

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;

          &:last-child {
            margin-bottom: 0;
          }

          &.discount {
            color: #28a745;
            font-weight: bold;
          }
        }
      }

      .btn-pay {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 4px;
        background: #28a745;
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          background: #218838;
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }

      .payment-info {
        text-align: center;
        color: #666;
        font-size: 12px;
        margin-top: 15px;
      }
    }
  }
}

@media (max-width: 768px) {
  .buy-credits-container {
    .packages-grid {
      grid-template-columns: 1fr;

      .package-card.popular {
        transform: scale(1);
      }
    }

    .checkout-section {
      margin-top: 20px;

      .checkout-card {
        max-width: 100%;
      }
    }
  }
}
```

---

## Integração Firebase Push

### Criar `src/app/services/firebase-push.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    firebase: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class FirebasePushService {
  private messaging: any;

  constructor(private http: HttpClient) {}

  /**
   * Inicializar Firebase Cloud Messaging
   */
  async initializeFirebase(): Promise<void> {
    try {
      // Importar Firebase dinamicamente
      const firebase = await import('firebase/app');
      const messaging = await import('firebase/messaging');

      const firebaseConfig = {
        apiKey: environment.firebase.apiKey,
        authDomain: environment.firebase.authDomain,
        projectId: environment.firebase.projectId,
        storageBucket: environment.firebase.storageBucket,
        messagingSenderId: environment.firebase.messagingSenderId,
        appId: environment.firebase.appId,
      };

      if (!firebase.getApps().length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.messaging = messaging.getMessaging();
      console.log('[Firebase] Initialized successfully');
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
    }
  }

  /**
   * Solicitar permissão e obter token de push
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        await this.initializeFirebase();
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[Firebase] Notification permission denied');
        return null;
      }

      const messaging = await import('firebase/messaging');
      const token = await messaging.getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey
      });

      console.log('[Firebase] Token obtained:', token);
      return token;
    } catch (error) {
      console.error('[Firebase] Error getting token:', error);
      return null;
    }
  }

  /**
   * Registrar token de push no backend
   */
  registerPushToken(token: string, platform: 'android' | 'ios' | 'web'): Promise<any> {
    return this.http.post(`${environment.apiUrl}/trpc/notifications.registerPushToken`, {
      token,
      platform
    }).toPromise();
  }

  /**
   * Escutar mensagens push em foreground
   */
  onMessageReceived(callback: (payload: any) => void): void {
    if (!this.messaging) {
      console.warn('[Firebase] Messaging not initialized');
      return;
    }

    const messaging = require('firebase/messaging');
    messaging.onMessage(this.messaging, (payload: any) => {
      console.log('[Firebase] Message received:', payload);
      callback(payload);

      // Reproduzir som de buzina
      this.playBuzinaSoundIfAvailable();
    });
  }

  /**
   * Reproduzir som de buzina
   */
  private playBuzinaSoundIfAvailable(): void {
    try {
      const audio = new Audio('/assets/sounds/buzina.mp3');
      audio.play().catch(err => console.warn('[Audio] Could not play sound:', err));
    } catch (error) {
      console.warn('[Audio] Error playing sound:', error);
    }
  }
}
```

### Usar no `app.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { FirebasePushService } from './services/firebase-push.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private firebasePushService: FirebasePushService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    // Inicializar Firebase
    await this.firebasePushService.initializeFirebase();

    // Solicitar permissão e registrar token
    const token = await this.firebasePushService.requestPermissionAndGetToken();
    if (token) {
      try {
        await this.firebasePushService.registerPushToken(token, 'web');
        console.log('Push notifications enabled');
      } catch (error) {
        console.error('Error registering push token:', error);
      }
    }

    // Escutar mensagens
    this.firebasePushService.onMessageReceived((payload) => {
      console.log('Push notification received:', payload);
      this.notificationService.info(
        payload.notification?.body || 'Nova notificação'
      );
    });
  }
}
```

---

## Exemplos de Uso

### Exemplo 1: Comprar Créditos

```typescript
// No componente de créditos
import { BuyCreditsComponent } from './components/buy-credits/buy-credits.component';

// Adicionar à rota
const routes: Routes = [
  { path: 'buy-credits', component: BuyCreditsComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-cancel', component: PaymentCancelComponent }
];
```

### Exemplo 2: Enviar Alerta Personalizado

```typescript
// No componente de alertas
import { PaymentService } from './services/payment.service';
import { CreditsService } from './services/credits.service';

export class SendAlertComponent {
  constructor(
    private creditsService: CreditsService,
    private paymentService: PaymentService
  ) {}

  sendPersonalizedAlert(message: string): void {
    // Verificar saldo de créditos
    this.creditsService.getBalance().subscribe(balance => {
      if (balance < 1) {
        // Redirecionar para compra de créditos
        this.router.navigate(['/buy-credits']);
      } else {
        // Enviar alerta
        this.alertsService.sendPersonalized(message).subscribe(() => {
          this.notificationService.success('Alerta enviado!');
        });
      }
    });
  }
}
```

---

## Variáveis de Ambiente

### `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/trpc',
  firebase: {
    apiKey: 'sua_api_key',
    authDomain: 'seu_projeto.firebaseapp.com',
    projectId: 'seu_projeto',
    storageBucket: 'seu_projeto.appspot.com',
    messagingSenderId: 'seu_sender_id',
    appId: 'seu_app_id',
    vapidKey: 'sua_vapid_key'
  }
};
```

---

**Última atualização:** Outubro 2024
**Versão:** 1.0.0
