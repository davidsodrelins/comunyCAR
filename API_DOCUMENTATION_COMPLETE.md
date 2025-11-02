# comunyCAR API - Documentação Completa e Detalhada

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
4. [Modelos de Dados](#modelos-de-dados)
5. [Códigos de Erro](#códigos-de-erro)
6. [Rate Limiting](#rate-limiting)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [WebSocket](#websocket)
9. [Webhooks](#webhooks)
10. [FAQ](#faq)

---

## Visão Geral

**comunyCAR** é uma plataforma completa de alertas de veículos em tempo real que permite que usuários enviem notificações para proprietários de veículos através da placa.

### Informações Gerais

- **Base URL:** `https://comunicar.hidalgo.digital/api/v1`
- **Versão:** 1.0.0
- **Autenticação:** JWT Bearer Token
- **Formato de Resposta:** JSON
- **Charset:** UTF-8
- **Timeout:** 30 segundos

### Características Principais

✅ Autenticação com Email e CNPJ  
✅ Gestão de Veículos (Owner e Usuários Secundários)  
✅ Sistema de Alertas Fixos (Gratuitos) e Personalizados (Pagos)  
✅ Notificações Multi-canal (Email, WhatsApp, Push)  
✅ Sistema de Créditos e Pagamentos (PayPal)  
✅ Mensagens com Sistema de Reações  
✅ WebSocket para Comunicação em Tempo Real  
✅ Painel Administrativo Completo  
✅ Rate Limiting e Segurança  

---

## Autenticação

### Tipos de Autenticação Suportados

1. **JWT Bearer Token** (Recomendado)
   - Token com validade de 24 horas
   - Renovável via endpoint `/auth/refresh`

2. **Cookie de Sessão**
   - Alternativa para aplicações web
   - Gerenciado automaticamente

### Headers Obrigatórios

```bash
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
```

### Fluxo de Autenticação

```
1. Usuário faz login com email e senha
2. Sistema retorna JWT token
3. Usuário inclui token em todas as requisições
4. Token expira após 24 horas
5. Usuário pode renovar token sem fazer login novamente
```

### Obter Token (Login)

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "sua_senha_segura"
}

# Resposta 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "name": "João Silva",
    "phone": "(11) 98765-4321",
    "cnpj": "12.345.678/0001-90",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Renovar Token

```bash
POST /auth/refresh
Authorization: Bearer <seu_token_jwt>

# Resposta 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

### Logout

```bash
POST /auth/logout
Authorization: Bearer <seu_token_jwt>

# Resposta 200 OK
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## Endpoints

### 1. Autenticação

#### Registrar Novo Usuário

```http
POST /auth/register
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha_segura_123",
  "name": "João Silva",
  "phone": "(11) 98765-4321",
  "cnpj": "12.345.678/0001-90"
}

# Resposta 201 Created
{
  "success": true,
  "message": "Usuário registrado com sucesso. Verifique seu email.",
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "name": "João Silva",
    "phone": "(11) 98765-4321",
    "cnpj": "12.345.678/0001-90",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validações:**
- Email deve ser válido e único
- Senha mínimo 8 caracteres
- CNPJ deve ser válido (algoritmo de verificação)
- Telefone deve estar no formato (XX) XXXXX-XXXX
- Nome deve ter no mínimo 3 caracteres

---

#### Verificar Email

```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "abc123def456..."
}

# Resposta 200 OK
{
  "success": true,
  "message": "Email verificado com sucesso",
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "emailVerified": true
  }
}
```

**Notas:**
- Token enviado por email (válido por 24 horas)
- Usuário pode fazer login antes de verificar email
- Algumas funcionalidades podem estar restritas sem verificação

---

#### Reenviar Email de Verificação

```http
POST /auth/resend-verification-email
Content-Type: application/json

{
  "email": "joao@example.com"
}

# Resposta 200 OK
{
  "success": true,
  "message": "Email de verificação reenviado"
}
```

---

#### Solicitar Recuperação de Senha

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "joao@example.com"
}

# Resposta 200 OK
{
  "success": true,
  "message": "Email de recuperação enviado"
}
```

**Notas:**
- Email com link de reset enviado
- Link válido por 1 hora
- Usuário deve clicar no link e resetar a senha

---

#### Resetar Senha

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456...",
  "newPassword": "nova_senha_123"
}

# Resposta 200 OK
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

### 2. Usuários

#### Obter Perfil do Usuário

```http
GET /users/me
Authorization: Bearer <token>

# Resposta 200 OK
{
  "success": true,
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "name": "João Silva",
    "phone": "(11) 98765-4321",
    "cnpj": "12.345.678/0001-90",
    "role": "user",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Atualizar Perfil

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João Silva Santos",
  "phone": "(11) 99876-5432",
  "cnpj": "12.345.678/0001-91"
}

# Resposta 200 OK
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "name": "João Silva Santos",
    "phone": "(11) 99876-5432",
    "cnpj": "12.345.678/0001-91",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

#### Alterar Senha

```http
POST /users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha_123"
}

# Resposta 200 OK
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

### 3. Veículos

#### Criar Novo Veículo

```http
POST /vehicles/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "plate": "ABC-1234",
  "brand": "Toyota",
  "model": "Corolla",
  "color": "Branco",
  "year": 2022
}

# Resposta 201 Created
{
  "success": true,
  "message": "Veículo cadastrado com sucesso",
  "vehicle": {
    "id": 1,
    "plate": "ABC-1234",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Branco",
    "year": 2022,
    "ownerId": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validações:**
- Placa deve estar no formato brasileiro (ABC-1234 ou ABC1D23)
- Placa deve ser única no sistema
- Ano deve ser válido (1900-2099)
- Marca e modelo são obrigatórios

---

#### Listar Veículos do Usuário

```http
GET /vehicles/list
Authorization: Bearer <token>

# Resposta 200 OK
{
  "success": true,
  "vehicles": [
    {
      "id": 1,
      "plate": "ABC-1234",
      "brand": "Toyota",
      "model": "Corolla",
      "color": "Branco",
      "year": 2022,
      "ownerId": 1,
      "owner": {
        "id": 1,
        "name": "João Silva",
        "email": "joao@example.com"
      },
      "secondaryUsers": [
        {
          "id": 2,
          "name": "Maria Silva",
          "email": "maria@example.com",
          "role": "secondary",
          "addedAt": "2024-01-14T15:20:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Buscar Veículo por Placa

```http
GET /vehicles/by-plate?plate=ABC-1234
Authorization: Bearer <token>

# Resposta 200 OK
{
  "success": true,
  "vehicle": {
    "id": 1,
    "plate": "ABC-1234",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Branco",
    "year": 2022,
    "ownerId": 1,
    "owner": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "(11) 98765-4321"
    },
    "secondaryUsers": [
      {
        "id": 2,
        "name": "Maria Silva",
        "email": "maria@example.com"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Adicionar Usuário Secundário

```http
POST /vehicles/add-secondary-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": 1,
  "userEmail": "maria@example.com"
}

# Resposta 200 OK
{
  "success": true,
  "message": "Usuário adicionado ao veículo com sucesso",
  "secondaryUser": {
    "id": 2,
    "name": "Maria Silva",
    "email": "maria@example.com",
    "role": "secondary",
    "addedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Notas:**
- Email deve ser de um usuário registrado
- Usuário será notificado por email
- Usuário pode recusar o convite

---

#### Remover Usuário Secundário

```http
DELETE /vehicles/remove-secondary-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": 1,
  "userId": 2
}

# Resposta 200 OK
{
  "success": true,
  "message": "Usuário removido do veículo com sucesso"
}
```

---

### 4. Alertas

#### Obter Tipos de Alertas Fixos

```http
GET /alerts/fixed-types
Authorization: Bearer <token>

# Resposta 200 OK
{
  "success": true,
  "alertTypes": [
    {
      "id": 1,
      "title": "Faróis Acesos",
      "message": "O farol do seu veículo de placa {plate} está aceso. Por favor, verifique."
    },
    {
      "id": 2,
      "title": "Pneu Furado/Baixo",
      "message": "Um dos pneus do seu veículo de placa {plate} parece estar furado ou muito baixo."
    },
    {
      "id": 3,
      "title": "Porta Aberta",
      "message": "A porta (ou porta-malas) do seu veículo de placa {plate} está aberta."
    },
    {
      "id": 4,
      "title": "Vazamento de Fluido",
      "message": "Há um vazamento de fluido (óleo, água, etc.) sob o seu veículo de placa {plate}."
    },
    {
      "id": 5,
      "title": "Alarme Disparado",
      "message": "O alarme do seu veículo de placa {plate} está disparado."
    },
    {
      "id": 6,
      "title": "Obstrução de Via",
      "message": "Seu veículo de placa {plate} está obstruindo uma garagem/passagem."
    },
    {
      "id": 7,
      "title": "Outro Problema",
      "message": "Há um problema com seu veículo de placa {plate}. Sugiro verificar."
    }
  ]
}
```

---

#### Enviar Alerta Fixo

```http
POST /alerts/send-fixed
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehiclePlate": "ABC-1234",
  "alertTypeId": 1
}

# Resposta 200 OK
{
  "success": true,
  "message": "Alerta enviado com sucesso",
  "alert": {
    "id": 1,
    "vehicleId": 1,
    "vehiclePlate": "ABC-1234",
    "senderId": 2,
    "senderName": "Maria Silva",
    "type": "fixed",
    "alertTypeId": 1,
    "message": "O farol do seu veículo de placa ABC-1234 está aceso. Por favor, verifique.",
    "status": "sent",
    "recipients": 2,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Características:**
- Alerta fixo é GRATUITO
- Enviado para owner e usuários secundários
- Notificação por Email, WhatsApp e Push
- Rate limit: 10 alertas por hora

---

#### Enviar Alerta Personalizado

```http
POST /alerts/send-custom
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehiclePlate": "ABC-1234",
  "message": "Seu veículo está com a luz de freio acesa"
}

# Resposta 200 OK
{
  "success": true,
  "message": "Alerta enviado com sucesso",
  "creditsDeducted": 5,
  "alert": {
    "id": 2,
    "vehicleId": 1,
    "vehiclePlate": "ABC-1234",
    "senderId": 2,
    "senderName": "Maria Silva",
    "type": "custom",
    "message": "Seu veículo está com a luz de freio acesa",
    "status": "sent",
    "recipients": 2,
    "createdAt": "2024-01-15T10:31:00Z"
  }
}
```

**Características:**
- Alerta personalizado CUSTA 5 créditos
- Usuário deve ter créditos suficientes
- Enviado para owner e usuários secundários
- Rate limit: 5 alertas por hora

---

#### Obter Histórico de Alertas Recebidos

```http
GET /alerts/received?limit=20&offset=0
Authorization: Bearer <token>

# Resposta 200 OK
{
  "success": true,
  "total": 45,
  "limit": 20,
  "offset": 0,
  "alerts": [
    {
      "id": 1,
      "vehicleId": 1,
      "vehiclePlate": "ABC-1234",
      "senderId": 2,
      "senderName": "Maria Silva",
      "type": "fixed",
      "message": "O farol do seu veículo de placa ABC-1234 está aceso",
      "status": "read",
      "readAt": "2024-01-15T10:35:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Obter Histórico de Alertas Enviados

```http
GET /alerts/sent?limit=20&offset=0
Authorization: Bearer <token>

# Resposta 200 OK
{
  "success": true,
  "total": 12,
  "limit": 20,
  "offset": 0,
  "alerts": [
    {
      "id": 1,
      "vehicleId": 1,
      "vehiclePlate": "ABC-1234",
      "senderId": 1,
      "type": "fixed",
      "message": "O farol do seu veículo de placa ABC-1234 está aceso",
      "status": "delivered",
      "recipients": [
        {
          "userId": 2,
          "userName": "João Silva",
          "status": "delivered",
          "deliveredAt": "2024-01-15T10:30:30Z"
        },
        {
          "userId": 3,
          "userName": "Maria Silva",
          "status": "read",
          "readAt": "2024-01-15T10:35:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 5. Mensagens

#### Obter Mensagens Recebidas

```http
GET /messages/received?limit=20&offset=0
Authorization: Bearer <token>

# Resposta 200 OK
{
  "success": true,
  "total": 30,
  "messages": [
    {
      "id": 1,
      "senderId": 2,
      "senderName": "Maria Silva",
      "vehicleId": 1,
      "vehiclePlate": "ABC-1234",
      "message": "Seu farol está aceso",
      "type": "fixed",
      "isRead": true,
      "readAt": "2024-01-15T10:35:00Z",
      "reactions": {
        "👍": [
          {
            "userId": 3,
            "userName": "João Silva",
            "createdAt": "2024-01-15T10:36:00Z"
          }
        ],
        "❤️": [
          {
            "userId": 4,\n            "userName": "Pedro Santos",\n            "createdAt": "2024-01-15T10:37:00Z"\n          }\n        ]\n      },\n      "createdAt": "2024-01-15T10:30:00Z"\n    }\n  ]\n}\n```\n\n---\n\n#### Obter Mensagens Enviadas\n\n```http\nGET /messages/sent?limit=20&offset=0\nAuthorization: Bearer <token>\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"total\": 15,\n  \"messages\": [\n    {\n      \"id\": 1,\n      \"senderId\": 1,\n      \"vehicleId\": 1,\n      \"vehiclePlate\": \"ABC-1234\",\n      \"message\": \"Seu farol está aceso\",\n      \"type\": \"fixed\",\n      \"recipients\": [\n        {\n          \"userId\": 2,\n          \"userName\": \"João Silva\",\n          \"isRead\": true,\n          \"readAt\": \"2024-01-15T10:35:00Z\",\n          \"reactions\": [\"👍\"]\n        }\n      ],\n      \"createdAt\": \"2024-01-15T10:30:00Z\"\n    }\n  ]\n}\n```\n\n---\n\n#### Adicionar Reação em Mensagem\n\n```http\nPOST /messages/add-reaction\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{\n  \"messageId\": 1,\n  \"reaction\": \"👍\"\n}\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"message\": \"Reação adicionada com sucesso\",\n  \"reaction\": {\n    \"id\": 1,\n    \"messageId\": 1,\n    \"userId\": 2,\n    \"reaction\": \"👍\",\n    \"createdAt\": \"2024-01-15T10:36:00Z\"\n  }\n}\n```\n\n**Reações Disponíveis:**\n- 👍 Visto\n- ❤️ Obrigado\n- ⚠️ Urgente\n- ✅ Resolvido\n- 🚗 Veículo\n- ⏰ Depois\n\n---\n\n### 6. Créditos\n\n#### Obter Saldo de Créditos\n\n```http\nGET /credits/balance\nAuthorization: Bearer <token>\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"balance\": 150.50,\n  \"currency\": \"BRL\",\n  \"lastUpdated\": \"2024-01-15T10:30:00Z\"\n}\n```\n\n---\n\n#### Obter Histórico de Transações\n\n```http\nGET /credits/transactions?limit=20&offset=0\nAuthorization: Bearer <token>\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"total\": 45,\n  \"transactions\": [\n    {\n      \"id\": 1,\n      \"userId\": 1,\n      \"type\": \"purchase\",\n      \"amount\": 99.99,\n      \"credits\": 100,\n      \"description\": \"Compra de 100 créditos\",\n      \"paymentMethod\": \"paypal\",\n      \"status\": \"completed\",\n      \"createdAt\": \"2024-01-15T10:30:00Z\"\n    },\n    {\n      \"id\": 2,\n      \"userId\": 1,\n      \"type\": \"usage\",\n      \"amount\": 0,\n      \"credits\": -5,\n      \"description\": \"Alerta personalizado para ABC-1234\",\n      \"status\": \"completed\",\n      \"createdAt\": \"2024-01-15T10:31:00Z\"\n    }\n  ]\n}\n```\n\n---\n\n### 7. Notificações\n\n#### Obter Preferências de Notificação\n\n```http\nGET /notifications/preferences\nAuthorization: Bearer <token>\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"preferences\": {\n    \"emailEnabled\": true,\n    \"whatsappEnabled\": true,\n    \"pushEnabled\": true,\n    \"quietHoursStart\": \"22:00\",\n    \"quietHoursEnd\": \"08:00\",\n    \"soundEnabled\": true\n  }\n}\n```\n\n---\n\n#### Atualizar Preferências de Notificação\n\n```http\nPUT /notifications/preferences\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{\n  \"emailEnabled\": true,\n  \"whatsappEnabled\": false,\n  \"pushEnabled\": true,\n  \"quietHoursStart\": \"22:00\",\n  \"quietHoursEnd\": \"08:00\",\n  \"soundEnabled\": true\n}\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"message\": \"Preferências atualizadas com sucesso\"\n}\n```\n\n---\n\n#### Registrar Token de Push\n\n```http\nPOST /notifications/register-push-token\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{\n  \"token\": \"exponent_push_token[...\",\n  \"platform\": \"ios\"\n}\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"message\": \"Token registrado com sucesso\"\n}\n```\n\n---\n\n### 8. Pagamentos (PayPal)\n\n#### Criar Pagamento\n\n```http\nPOST /payments/create\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{\n  \"amount\": 99.99,\n  \"credits\": 100,\n  \"returnUrl\": \"https://comunicar.hidalgo.digital/success\",\n  \"cancelUrl\": \"https://comunicar.hidalgo.digital/cancel\"\n}\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"paymentId\": \"PAY-123456789\",\n  \"approvalUrl\": \"https://www.paypal.com/checkoutnow?token=...\"\n}\n```\n\n---\n\n#### Executar Pagamento\n\n```http\nPOST /payments/execute\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{\n  \"paymentId\": \"PAY-123456789\",\n  \"payerId\": \"PAYER-123456\"\n}\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"message\": \"Pagamento processado com sucesso\",\n  \"transaction\": {\n    \"id\": 1,\n    \"paymentId\": \"PAY-123456789\",\n    \"amount\": 99.99,\n    \"credits\": 100,\n    \"status\": \"completed\",\n    \"createdAt\": \"2024-01-15T10:30:00Z\"\n  }\n}\n```\n\n---\n\n### 9. WhatsApp Admin\n\n#### Inicializar Sessão WhatsApp\n\n```http\nPOST /whatsapp/initialize\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{}\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"message\": \"Sessão iniciada. Escaneie o QR code.\",\n  \"qrCode\": \"data:image/png;base64,...\",\n  \"sessionId\": \"session-123\"\n}\n```\n\n---\n\n#### Obter Status da Sessão WhatsApp\n\n```http\nGET /whatsapp/status\nAuthorization: Bearer <token>\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"status\": \"connected\",\n  \"phoneNumber\": \"+5511987654321\",\n  \"lastConnected\": \"2024-01-15T10:30:00Z\"\n}\n```\n\n---\n\n#### Desconectar WhatsApp\n\n```http\nPOST /whatsapp/disconnect\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{}\n\n# Resposta 200 OK\n{\n  \"success\": true,\n  \"message\": \"Desconectado com sucesso\"\n}\n```\n\n---\n\n## Modelos de Dados\n\n### User\n\n```json\n{\n  \"id\": 1,\n  \"email\": \"joao@example.com\",\n  \"name\": \"João Silva\",\n  \"phone\": \"(11) 98765-4321\",\n  \"cnpj\": \"12.345.678/0001-90\",\n  \"role\": \"user\",\n  \"emailVerified\": true,\n  \"createdAt\": \"2024-01-15T10:30:00Z\",\n  \"updatedAt\": \"2024-01-15T10:30:00Z\"\n}\n```\n\n### Vehicle\n\n```json\n{\n  \"id\": 1,\n  \"plate\": \"ABC-1234\",\n  \"brand\": \"Toyota\",\n  \"model\": \"Corolla\",\n  \"color\": \"Branco\",\n  \"year\": 2022,\n  \"ownerId\": 1,\n  \"createdAt\": \"2024-01-15T10:30:00Z\"\n}\n```\n\n### Alert\n\n```json\n{\n  \"id\": 1,\n  \"vehicleId\": 1,\n  \"senderId\": 2,\n  \"type\": \"fixed\",\n  \"alertTypeId\": 1,\n  \"message\": \"O farol do seu veículo de placa ABC-1234 está aceso\",\n  \"status\": \"delivered\",\n  \"createdAt\": \"2024-01-15T10:30:00Z\"\n}\n```\n\n---\n\n## Códigos de Erro\n\n| Código HTTP | Código de Erro | Mensagem | Solução |\n| :--- | :--- | :--- | :--- |\n| 400 | INVALID_REQUEST | Requisição inválida | Verifique os parâmetros |\n| 400 | INVALID_EMAIL | Email inválido | Use um email válido |\n| 400 | INVALID_CNPJ | CNPJ inválido | Use um CNPJ válido |\n| 400 | INVALID_PLATE | Placa inválida | Use formato ABC-1234 |\n| 400 | INSUFFICIENT_CREDITS | Créditos insuficientes | Compre mais créditos |\n| 401 | UNAUTHORIZED | Token inválido | Faça login novamente |\n| 403 | FORBIDDEN | Acesso negado | Sem permissão |\n| 404 | NOT_FOUND | Recurso não encontrado | Verifique o ID |\n| 409 | CONFLICT | Email já registrado | Use outro email |\n| 429 | RATE_LIMITED | Muitas requisições | Aguarde antes de tentar |\n| 500 | INTERNAL_ERROR | Erro interno | Tente novamente |\n\n---\n\n## Rate Limiting\n\n| Endpoint | Limite | Janela |\n| :--- | :--- | :--- |\n| POST /auth/login | 5 tentativas | 15 minutos |\n| POST /auth/register | 3 registros | 1 hora |\n| POST /alerts/send-fixed | 10 alertas | 1 hora |\n| POST /alerts/send-custom | 5 alertas | 1 hora |\n| GET /messages/received | 100 requisições | 1 minuto |\n| POST /payments/create | 10 pagamentos | 1 hora |\n\n---\n\n## Exemplos de Uso\n\n### JavaScript\n\n```javascript\nconst token = 'seu_token_jwt';\n\n// Enviar alerta fixo\nconst response = await fetch('https://comunicar.hidalgo.digital/api/v1/alerts/send-fixed', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'Authorization': `Bearer ${token}`\n  },\n  body: JSON.stringify({\n    vehiclePlate: 'ABC-1234',\n    alertTypeId: 1\n  })\n});\n\nconst data = await response.json();\nconsole.log(data);\n```\n\n### Python\n\n```python\nimport requests\n\ntoken = 'seu_token_jwt'\nheaders = {'Authorization': f'Bearer {token}'}\n\n# Enviar alerta fixo\nresponse = requests.post(\n    'https://comunicar.hidalgo.digital/api/v1/alerts/send-fixed',\n    json={\n        'vehiclePlate': 'ABC-1234',\n        'alertTypeId': 1\n    },\n    headers=headers\n)\n\nprint(response.json())\n```\n\n### cURL\n\n```bash\ncurl -X POST https://comunicar.hidalgo.digital/api/v1/alerts/send-fixed \\\n  -H \"Authorization: Bearer seu_token_jwt\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"vehiclePlate\": \"ABC-1234\",\n    \"alertTypeId\": 1\n  }'\n```\n\n---\n\n## WebSocket\n\n### Conectar ao WebSocket\n\n```javascript\nconst socket = io('https://comunicar.hidalgo.digital', {\n  auth: {\n    token: 'seu_token_jwt'\n  }\n});\n\n// Eventos\nsocket.on('connected', (data) => console.log('Conectado'));\nsocket.on('new-message', (data) => console.log('Nova mensagem:', data));\nsocket.on('message-reaction', (data) => console.log('Reação:', data));\nsocket.on('alert-sent', (data) => console.log('Alerta enviado:', data));\n```\n\n---\n\n## Webhooks\n\n### Configurar Webhook\n\n```http\nPOST /webhooks/configure\nAuthorization: Bearer <token>\nContent-Type: application/json\n\n{\n  \"url\": \"https://seu-servidor.com/webhook\",\n  \"events\": [\"alert.sent\", \"message.received\", \"payment.completed\"]\n}\n```\n\n---\n\n## FAQ\n\n**P: Como faço login?**\nR: Use o endpoint POST /auth/login com email e senha.\n\n**P: Qual é o custo de um alerta personalizado?**\nR: 5 créditos por alerta personalizado.\n\n**P: Posso enviar alertas para múltiplos veículos?**\nR: Sim, você precisa enviar um alerta para cada placa.\n\n**P: Quanto tempo leva para receber um alerta?**\nR: Menos de 1 segundo em média.\n\n---\n\n**Última atualização:** 15 de Janeiro de 2024\n**Versão da API:** 1.0.0\n
