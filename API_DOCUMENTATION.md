# comunyCAR API Documentation

## Base URL
```
https://comunicar.hidalgo.digital/api/v1
```

## Authentication
Todas as requisições devem incluir o header de autenticação:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## Endpoints

### Veículos

#### Criar Veículo
```
POST /vehicles/create
Content-Type: application/json

{
  "plate": "ABC-1234",
  "brand": "Toyota",
  "model": "Corolla",
  "color": "Prata",
  "year": 2022
}

Response 201:
{
  "id": 1,
  "plate": "ABC-1234",
  "brand": "Toyota",
  "model": "Corolla",
  "color": "Prata",
  "year": 2022,
  "ownerId": 1,
  "createdAt": "2024-10-15T14:30:00Z"
}
```

#### Listar Veículos do Usuário
```
GET /vehicles/list

Response 200:
{
  "vehicles": [
    {
      "id": 1,
      "plate": "ABC-1234",
      "brand": "Toyota",
      "model": "Corolla",
      "color": "Prata",
      "year": 2022,
      "users": [
        {
          "id": 1,
          "name": "Maria Silva",
          "role": "owner"
        },
        {
          "id": 2,
          "name": "Pedro Silva",
          "role": "secondary"
        }
      ]
    }
  ]
}
```

#### Buscar Veículo por Placa
```
GET /vehicles/by-plate?plate=ABC-1234

Response 200:
{
  "id": 1,
  "plate": "ABC-1234",
  "brand": "Toyota",
  "model": "Corolla",
  "color": "Prata",
  "year": 2022,
  "users": [...]
}
```

#### Adicionar Usuário Secundário
```
POST /vehicles/add-secondary-user
Content-Type: application/json

{
  "vehicleId": 1,
  "userId": 2
}

Response 201:
{
  "success": true,
  "message": "Usuário adicionado ao veículo"
}
```

---

### Alertas

#### Listar Alertas Fixos Disponíveis
```
GET /alerts/fixed-alerts

Response 200:
{
  "alerts": [
    {
      "id": 1,
      "title": "Faróis Acesos",
      "message": "O farol do seu veículo de placa [PLACA] está aceso. Por favor, verifique."
    },
    {
      "id": 2,
      "title": "Pneu Furado/Baixo",
      "message": "Um dos pneus do seu veículo de placa [PLACA] parece estar furado ou muito baixo."
    },
    ...
  ]
}
```

#### Enviar Alerta Fixo
```
POST /alerts/send-fixed
Content-Type: application/json

{
  "vehiclePlate": "ABC-1234",
  "alertTypeId": 1
}

Response 201:
{
  "id": 1,
  "vehiclePlate": "ABC-1234",
  "alertType": "Faróis Acesos",
  "message": "O farol do seu veículo de placa ABC-1234 está aceso. Por favor, verifique.",
  "status": "sent",
  "timestamp": "2024-10-15T14:30:00Z",
  "recipients": 2
}
```

#### Enviar Alerta Personalizado
```
POST /alerts/send-personalized
Content-Type: application/json

{
  "vehiclePlate": "ABC-1234",
  "message": "Seu veículo está com a porta aberta na Rua X"
}

Response 201:
{
  "id": 2,
  "vehiclePlate": "ABC-1234",
  "message": "Seu veículo está com a porta aberta na Rua X",
  "status": "sent",
  "timestamp": "2024-10-15T14:35:00Z",
  "recipients": 2,
  "creditsUsed": 1,
  "newBalance": 14
}
```

#### Obter Histórico de Alertas Recebidos
```
GET /alerts/received?page=1&limit=10

Response 200:
{
  "alerts": [
    {
      "id": 1,
      "vehiclePlate": "ABC-1234",
      "alertType": "Faróis Acesos",
      "message": "...",
      "senderName": "João Silva",
      "timestamp": "2024-10-15T14:30:00Z",
      "status": "read"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

#### Obter Histórico de Alertas Enviados
```
GET /alerts/sent?page=1&limit=10

Response 200:
{
  "alerts": [
    {
      "id": 1,
      "vehiclePlate": "ABC-1234",
      "alertType": "Faróis Acesos",
      "message": "...",
      "timestamp": "2024-10-15T14:30:00Z",
      "status": "delivered",
      "recipients": 2
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### Créditos

#### Obter Saldo de Créditos
```
GET /credits/balance

Response 200:
{
  "userId": 1,
  "balance": 15,
  "lastUpdated": "2024-10-15T14:30:00Z"
}
```

#### Comprar Créditos (PayPal)
```
POST /payments/create-payment
Content-Type: application/json

{
  "packageId": "large",
  "credits": 50,
  "amount": 39.90,
  "returnUrl": "https://comunicar.hidalgo.digital/buy-credits?success=true",
  "cancelUrl": "https://comunicar.hidalgo.digital/buy-credits?cancelled=true"
}

Response 201:
{
  "paymentId": "PAY-123456",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=EC-123456",
  "status": "created"
}
```

#### Executar Pagamento (PayPal Callback)
```
POST /payments/execute-payment
Content-Type: application/json

{
  "paymentId": "PAY-123456",
  "payerId": "PAYER-123"
}

Response 200:
{
  "success": true,
  "transactionId": "TXN-123456",
  "credits": 50,
  "newBalance": 65,
  "message": "Pagamento processado com sucesso"
}
```

#### Obter Histórico de Transações
```
GET /credits/transactions?page=1&limit=10

Response 200:
{
  "transactions": [
    {
      "id": 1,
      "type": "purchase",
      "description": "Compra de 50 créditos",
      "amount": 39.90,
      "credits": 50,
      "balance": 65,
      "timestamp": "2024-10-15T14:30:00Z",
      "status": "completed",
      "paymentMethod": "PayPal"
    },
    {
      "id": 2,
      "type": "usage",
      "description": "Alerta personalizado - Placa ABC-1234",
      "amount": 0,
      "credits": -1,
      "balance": 64,
      "timestamp": "2024-10-15T13:15:00Z",
      "status": "completed"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

### Notificações

#### Obter Preferências de Notificação
```
GET /notifications/preferences

Response 200:
{
  "userId": 1,
  "emailAlerts": true,
  "emailFrequency": "instant",
  "whatsappAlerts": false,
  "whatsappConnected": false,
  "pushAlerts": true,
  "pushSound": true,
  "pushBuzzer": true,
  "quietHours": false,
  "quietStart": "22:00",
  "quietEnd": "08:00"
}
```

#### Atualizar Preferências de Notificação
```
PUT /notifications/preferences
Content-Type: application/json

{
  "emailAlerts": true,
  "emailFrequency": "hourly",
  "whatsappAlerts": true,
  "pushAlerts": true,
  "pushSound": true,
  "pushBuzzer": true,
  "quietHours": true,
  "quietStart": "22:00",
  "quietEnd": "08:00"
}

Response 200:
{
  "success": true,
  "message": "Preferências atualizadas com sucesso"
}
```

#### Registrar Token de Push
```
POST /notifications/register-push-token
Content-Type: application/json

{
  "token": "firebase_token_123456",
  "platform": "web"
}

Response 201:
{
  "success": true,
  "message": "Token registrado com sucesso"
}
```

#### Conectar WhatsApp
```
POST /notifications/connect-whatsapp

Response 200:
{
  "qrCode": "data:image/png;base64,...",
  "message": "Escaneie o QR code com seu WhatsApp"
}
```

#### Desconectar WhatsApp
```
POST /notifications/disconnect-whatsapp

Response 200:
{
  "success": true,
  "message": "WhatsApp desconectado"
}
```

---

### Autenticação

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@example.com",
    "cnpj": "12.345.678/0001-90"
  }
}
```

#### Cadastro
```
POST /auth/signup
Content-Type: application/json

{
  "name": "João Silva",
  "email": "usuario@example.com",
  "phone": "(11) 99999-9999",
  "cnpj": "12.345.678/0001-90",
  "password": "senha123"
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@example.com",
    "cnpj": "12.345.678/0001-90"
  }
}
```

#### Logout
```
POST /auth/logout

Response 200:
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Placa de veículo inválida"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Token inválido ou expirado"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Veículo não encontrado"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Você excedeu o limite de 10 requisições em 3600 segundos.",
  "retryAfter": 1800
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Erro ao processar sua requisição"
}
```

---

## Rate Limiting

- **Alertas:** 10 por hora por usuário
- **Login:** 5 tentativas por 15 minutos
- **API Pública:** 100 requisições por 15 minutos
- **Pagamentos:** 5 tentativas por hora

Headers de Rate Limit:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 2024-10-15T15:30:00Z
```

---

## Webhooks

### PayPal Webhook
```
POST /webhooks/paypal

{
  "event_type": "CHECKOUT.ORDER.COMPLETED",
  "resource": {
    "id": "ORDER-123456",
    "status": "COMPLETED",
    "payer": {
      "email_address": "usuario@example.com"
    },
    "purchase_units": [
      {
        "amount": {
          "value": "39.90",
          "currency_code": "BRL"
        }
      }
    ]
  }
}
```

---

## Exemplos de Uso

### JavaScript/TypeScript
```typescript
// Enviar alerta fixo
const response = await fetch('https://comunicar.hidalgo.digital/api/v1/alerts/send-fixed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    vehiclePlate: 'ABC-1234',
    alertTypeId: 1
  })
});

const data = await response.json();
console.log(data);
```

### cURL
```bash
curl -X POST https://comunicar.hidalgo.digital/api/v1/alerts/send-fixed \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vehiclePlate": "ABC-1234",
    "alertTypeId": 1
  }'
```

---

## Changelog

### v1.0.0 (2024-10-15)
- ✅ Endpoints de veículos
- ✅ Endpoints de alertas
- ✅ Endpoints de créditos
- ✅ Endpoints de notificações
- ✅ Integração PayPal
- ✅ Integração Firebase
- ✅ Rate limiting
- ✅ Autenticação JWT
