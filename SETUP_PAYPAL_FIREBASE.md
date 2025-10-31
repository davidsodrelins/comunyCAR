# Setup PayPal e Firebase - comunyCAR

Guia completo para configurar PayPal e Firebase no sistema comunyCAR.

---

## 📋 Índice

1. [Setup PayPal](#setup-paypal)
2. [Setup Firebase](#setup-firebase)
3. [Configuração no Banco de Dados](#configuração-no-banco-de-dados)
4. [Testes](#testes)
5. [Webhooks](#webhooks)

---

## Setup PayPal

### 1. Criar Conta PayPal Developer

1. Acesse [PayPal Developer](https://developer.paypal.com/)
2. Faça login ou crie uma conta
3. Vá para **Dashboard** → **Apps & Credentials**
4. Selecione **Sandbox** (para testes) ou **Live** (produção)

### 2. Obter Credenciais

1. Na seção **REST API signature**, clique em **Show**
2. Copie os valores:
   - **Client ID** (exemplo: `AZDxjhQy5...`)
   - **Secret** (exemplo: `EBWKjX21...`)

### 3. Configurar no Banco de Dados

Execute a query SQL abaixo para inserir as credenciais:

```sql
INSERT INTO paypal_configs (client_id, client_secret, mode, email, is_active, createdAt, updatedAt)
VALUES (
  'SEU_CLIENT_ID_AQUI',
  'SEU_CLIENT_SECRET_AQUI',
  'sandbox',
  'davidsodre_ba@hotmail.com',
  true,
  NOW(),
  NOW()
);
```

**Substitua:**
- `SEU_CLIENT_ID_AQUI` - Seu Client ID do PayPal
- `SEU_CLIENT_SECRET_AQUI` - Seu Secret do PayPal
- `sandbox` - Use `sandbox` para testes, `production` para produção

### 4. Configurar Webhook (Opcional)

1. No Dashboard PayPal, vá para **Webhooks**
2. Clique em **Create Webhook**
3. Configure a URL: `https://seu-dominio.com/api/webhooks/paypal`
4. Selecione os eventos:
   - `CHECKOUT.ORDER.APPROVED`
   - `CHECKOUT.ORDER.COMPLETED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`

5. Copie o **Webhook ID** e salve no banco:

```sql
UPDATE paypal_configs 
SET webhook_id = 'SEU_WEBHOOK_ID_AQUI' 
WHERE id = 1;
```

---

## Setup Firebase

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **Create Project**
3. Preencha o nome do projeto (ex: `comunycar`)
4. Selecione a região (ex: `South America - São Paulo`)
5. Clique em **Create Project**

### 2. Ativar Cloud Messaging

1. No Firebase Console, vá para **Cloud Messaging**
2. Clique em **Enable**
3. Copie o **Server API Key** (será usado no backend)

### 3. Gerar Chave de Serviço

1. Vá para **Project Settings** (ícone de engrenagem)
2. Clique na aba **Service Accounts**
3. Clique em **Generate New Private Key**
4. Um arquivo JSON será baixado (ex: `comunycar-firebase-adminsdk.json`)

### 4. Copiar Dados do JSON

Abra o arquivo JSON baixado e copie os seguintes campos:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "sua-chave-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com",
  "client_id": "seu-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/certificates/..."
}
```

### 5. Configurar no Banco de Dados

Execute a query SQL abaixo:

```sql
INSERT INTO firebase_configs (
  project_id,
  private_key,
  client_email,
  client_id,
  auth_uri,
  token_uri,
  auth_provider_x509_cert_url,
  client_x509_cert_url,
  is_active,
  createdAt,
  updatedAt
) VALUES (
  'seu-projeto-id',
  '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
  'firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com',
  'seu-client-id',
  'https://accounts.google.com/o/oauth2/auth',
  'https://oauth2.googleapis.com/token',
  'https://www.googleapis.com/oauth2/v1/certs',
  'https://www.googleapis.com/certificates/...',
  true,
  NOW(),
  NOW()
);
```

---

## Configuração no Banco de Dados

### Via API tRPC (Recomendado)

1. **Fazer login como admin**

2. **Configurar PayPal:**
```javascript
// No console do navegador ou via API
await trpc.payments.savePayPalConfig.mutate({
  clientId: 'SEU_CLIENT_ID',
  clientSecret: 'SEU_CLIENT_SECRET',
  mode: 'sandbox', // ou 'production'
  email: 'davidsodre_ba@hotmail.com',
  webhookId: 'SEU_WEBHOOK_ID' // opcional
});
```

3. **Configurar Firebase:**
```javascript
await trpc.payments.saveFirebaseConfig.mutate({
  projectId: 'seu-projeto-id',
  privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
  clientEmail: 'firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com',
  clientId: 'seu-client-id',
  authUri: 'https://accounts.google.com/o/oauth2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
  authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
  clientX509CertUrl: 'https://www.googleapis.com/certificates/...'
});
```

### Via SQL Direto

Ver seções acima para inserir dados diretamente no banco.

---

## Testes

### Testar Conexão PayPal

```javascript
const result = await trpc.payments.testPayPalConnection.mutate();
console.log(result);
// Resposta esperada: { success: true, message: "Conexão com PayPal estabelecida (Modo: sandbox)" }
```

### Testar Conexão Firebase

```javascript
const result = await trpc.payments.testFirebaseConnection.mutate();
console.log(result);
// Resposta esperada: { success: true, message: "Conexão com Firebase estabelecida com sucesso" }
```

### Testar Pagamento PayPal

1. **Criar pagamento:**
```javascript
const payment = await trpc.payments.createPayment.mutate({
  creditsAmount: 10,
  amount: 29.90,
  returnUrl: 'https://seu-dominio.com/payment-success',
  cancelUrl: 'https://seu-dominio.com/payment-cancel'
});

console.log(payment.approvalUrl); // Redirecionar usuário para esta URL
```

2. **Após aprovação no PayPal, executar pagamento:**
```javascript
const result = await trpc.payments.executePayment.mutate({
  paymentId: 'PAYMENT_ID_DO_PAYPAL',
  payerId: 'PAYER_ID_RETORNADO_PELO_PAYPAL',
  creditsAmount: 10
});

console.log(result);
// Resposta esperada: { success: true, transactionId: "...", message: "Pagamento realizado com sucesso!" }
```

### Testar Notificação Push Firebase

1. **Registrar token de push:**
```javascript
await trpc.notifications.registerPushToken.mutate({
  token: 'FIREBASE_DEVICE_TOKEN',
  platform: 'android' // ou 'ios', 'web'
});
```

2. **Enviar notificação (via backend):**
```javascript
// No backend, após enviar um alerta:
const result = await firebaseService.sendPushNotification(
  userId,
  deviceToken,
  'Alerta de Veículo',
  'Seu veículo tem os faróis acesos',
  { alertId: '123', vehiclePlate: 'ABC-1234' },
  alertId
);

console.log(result);
// Resposta esperada: { success: true, messageId: "..." }
```

---

## Webhooks

### PayPal Webhook

**Endpoint:** `POST /api/webhooks/paypal`

**Eventos suportados:**
- `CHECKOUT.ORDER.APPROVED` - Pagamento aprovado
- `CHECKOUT.ORDER.COMPLETED` - Pagamento completado
- `PAYMENT.CAPTURE.COMPLETED` - Captura de pagamento completada
- `PAYMENT.CAPTURE.DENIED` - Captura de pagamento negada

**Exemplo de payload:**
```json
{
  "id": "WH-2JW66...",
  "event_type": "CHECKOUT.ORDER.COMPLETED",
  "resource": {
    "id": "7L...",
    "status": "COMPLETED",
    "payer": {
      "email_address": "usuario@example.com"
    }
  }
}
```

**Configuração:**
1. No PayPal Developer Dashboard, vá para **Webhooks**
2. Crie um webhook com a URL: `https://seu-dominio.com/api/webhooks/paypal`
3. Selecione os eventos acima
4. Copie o **Webhook ID** e salve no banco de dados

---

## Variáveis de Ambiente (Opcional)

Se preferir usar variáveis de ambiente em vez do banco de dados:

```bash
# .env
PAYPAL_CLIENT_ID=seu_client_id
PAYPAL_CLIENT_SECRET=seu_client_secret
PAYPAL_MODE=sandbox
PAYPAL_EMAIL=davidsodre_ba@hotmail.com

FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_PRIVATE_KEY=sua_chave_privada
FIREBASE_CLIENT_EMAIL=seu_email_firebase
FIREBASE_CLIENT_ID=seu_client_id_firebase

# Webhook
PAYPAL_WEBHOOK_VERIFY=false # true para verificar assinatura em produção
```

---

## Troubleshooting

### PayPal

**Erro: "Invalid Client ID"**
- Verifique se o Client ID está correto
- Certifique-se de que está usando a chave correta (Sandbox vs Production)

**Erro: "Webhook not received"**
- Verifique se a URL do webhook está acessível publicamente
- Confirme se o Webhook ID está salvo no banco

### Firebase

**Erro: "Invalid service account"**
- Verifique se a chave privada está completa (incluindo BEGIN/END)
- Certifique-se de que as quebras de linha estão preservadas (`\n`)

**Erro: "Permission denied"**
- Verifique se o projeto Firebase tem Cloud Messaging habilitado
- Confirme se a conta de serviço tem as permissões corretas

---

## Próximos Passos

1. ✅ Configurar PayPal
2. ✅ Configurar Firebase
3. ✅ Testar conexões
4. ✅ Integrar com Angular (ver seção abaixo)
5. ✅ Deploy em produção

---

## Integração com Angular

Ver arquivo `ANGULAR_PAYMENT_INTEGRATION.md` para exemplos de componentes e serviços.

---

**Última atualização:** Outubro 2024
**Versão:** 1.0.0
