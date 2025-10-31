# comunyCAR - Sistema Completo de Alertas para Veículos

**comunyCAR** é um sistema inovador que permite que pedestres enviem alertas para proprietários de veículos através da placa, informando sobre problemas como faróis acesos, pneus furados, portas abertas, entre outros.

## 🎯 Visão Geral

O sistema é composto por três camadas principais:

1. **Backend (Node.js + tRPC)** - API REST com autenticação, gestão de alertas, créditos e notificações
2. **Frontend Web (Angular)** - Dashboard completo para gerenciamento de veículos e alertas
3. **Apps Móveis (Flutter)** - Aplicativos Android e iOS com notificações push

---

## 📁 Estrutura do Projeto

```
comunyCAR/
├── backend/                    # Backend Node.js + Express + tRPC
│   ├── drizzle/               # Schema do banco de dados
│   ├── server/                # Código do servidor
│   │   ├── routers/           # Routers tRPC (vehicles, alerts, credits, notifications)
│   │   ├── services/          # Serviços (email, whatsapp, push)
│   │   ├── db.ts              # Helpers de banco de dados
│   │   └── routers.ts         # Router principal
│   ├── client/                # Frontend React (pode ser substituído por Angular)
│   └── package.json           # Dependências Node.js
│
├── frontend-angular/          # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Componentes (Dashboard, SendAlert, Vehicles, Credits, Notifications)
│   │   │   ├── services/      # Serviços (API, Auth, Notification)
│   │   │   ├── guards/        # Guards de autenticação
│   │   │   ├── app.ts         # Componente raiz
│   │   │   └── app.routes.ts  # Rotas da aplicação
│   │   └── styles.scss        # Estilos globais
│   └── package.json           # Dependências Angular
│
├── mobile-flutter/            # Apps móveis Flutter
│   ├── lib/
│   │   ├── main.dart          # Ponto de entrada
│   │   ├── screens/           # Telas da aplicação
│   │   ├── services/          # Serviços (API, Firebase)
│   │   └── models/            # Modelos de dados
│   └── pubspec.yaml           # Dependências Flutter
│
└── README.md                  # Este arquivo
```

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Angular CLI
- Flutter SDK (para apps móveis)
- MySQL 8.0+

### Backend Setup

```bash
cd backend
npm install
# ou
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar migrações do banco de dados
pnpm db:push

# Iniciar o servidor
pnpm dev
```

**Servidor rodará em:** `http://localhost:3000`

### Frontend Angular Setup

```bash
cd frontend-angular
npm install

# Iniciar servidor de desenvolvimento
ng serve

# Build para produção
ng build --prod
```

**Aplicação rodará em:** `http://localhost:4200`

### Mobile Flutter Setup

```bash
cd mobile-flutter
flutter pub get

# Executar em dispositivo/emulador
flutter run

# Build APK (Android)
flutter build apk

# Build IPA (iOS)
flutter build ios
```

---

## 🔑 Funcionalidades Principais

### 1. Autenticação e Usuários
- Cadastro com validação de email
- Validação de CNPJ
- Login com OAuth (Manus)
- Recuperação de senha
- Perfil de usuário

### 2. Gestão de Veículos
- Cadastro de veículos (placa, marca, modelo, cor)
- Vinculação de usuários secundários
- Listagem de veículos do usuário
- Gestão de permissões (Owner vs Secundário)

### 3. Sistema de Alertas
**Alertas Fixos (Gratuitos):**
1. Faróis acesos
2. Pneu furado/baixo
3. Porta aberta
4. Vazamento de fluido
5. Alarme disparado
6. Obstrução de via
7. Outro problema

**Alertas Personalizados (Requerem Créditos):**
- Mensagens customizadas até 500 caracteres
- Custo: 1 crédito por alerta

### 4. Sistema de Créditos
- Compra de créditos via Stripe/PayPal
- Pacotes predefinidos (10, 25, 50, 100 créditos)
- Histórico de transações
- Dedução automática ao enviar alertas personalizados

### 5. Notificações Multi-canal
- **Email:** Confirmação, alertas, recuperação de senha
- **WhatsApp:** Integração com whatsapp-web.js (QR code)
- **Push:** Firebase Cloud Messaging com som de buzina customizado

### 6. Preferências de Notificação
- Ativar/desativar cada canal
- Configuração de WhatsApp
- Registro de tokens de push
- Histórico de alertas recebidos

---

## 🗄️ Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `vehicles` | Veículos cadastrados |
| `vehicle_users` | Vinculação usuário-veículo |
| `fixed_alerts` | Alertas fixos predefinidos |
| `alerts` | Alertas enviados |
| `credits` | Saldo de créditos |
| `credit_transactions` | Histórico de compras |
| `notification_preferences` | Preferências de notificação |
| `push_tokens` | Tokens de push |
| `whatsapp_configs` | Configuração WhatsApp |
| `email_queue` | Fila de emails |
| `whatsapp_queue` | Fila de mensagens WhatsApp |
| `audit_logs` | Logs de auditoria |

---

## 🔐 Segurança

- Autenticação JWT com Manus OAuth
- Validação de entrada em todos os endpoints
- Rate limiting para prevenir spam
- Logs de auditoria completos
- Proteção contra CSRF
- Criptografia de senhas com bcryptjs

---

## 📱 APIs Principais

### Autenticação
- `POST /api/trpc/auth.login` - Login
- `POST /api/trpc/auth.logout` - Logout
- `GET /api/trpc/auth.me` - Obter usuário atual

### Veículos
- `POST /api/trpc/vehicles.create` - Criar veículo
- `GET /api/trpc/vehicles.list` - Listar veículos
- `GET /api/trpc/vehicles.getByPlate` - Buscar por placa
- `POST /api/trpc/vehicles.addSecondaryUser` - Adicionar usuário

### Alertas
- `GET /api/trpc/alerts.getFixedAlerts` - Listar alertas fixos
- `POST /api/trpc/alerts.sendFixed` - Enviar alerta fixo
- `POST /api/trpc/alerts.sendPersonalized` - Enviar alerta personalizado
- `GET /api/trpc/alerts.getReceived` - Alertas recebidos
- `GET /api/trpc/alerts.getSent` - Alertas enviados

### Créditos
- `GET /api/trpc/credits.getBalance` - Saldo de créditos
- `POST /api/trpc/credits.purchase` - Comprar créditos
- `GET /api/trpc/credits.getTransactions` - Histórico

### Notificações
- `GET /api/trpc/notifications.getPreferences` - Preferências
- `POST /api/trpc/notifications.updatePreferences` - Atualizar
- `POST /api/trpc/notifications.registerPushToken` - Registrar token
- `POST /api/trpc/notifications.connectWhatsapp` - Conectar WhatsApp
- `POST /api/trpc/notifications.disconnectWhatsapp` - Desconectar

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **tRPC** - RPC framework type-safe
- **Drizzle ORM** - ORM para MySQL
- **MySQL** - Banco de dados
- **Firebase Admin SDK** - Notificações push
- **whatsapp-web.js** - Integração WhatsApp
- **Nodemailer** - Envio de emails
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas

### Frontend Web
- **Angular 19** - Framework web
- **TypeScript** - Linguagem tipada
- **SCSS** - Pré-processador CSS
- **Axios** - Cliente HTTP
- **ngx-toastr** - Notificações toast
- **Angular Material** - Componentes UI

### Mobile
- **Flutter** - Framework multiplataforma
- **Dart** - Linguagem de programação
- **Firebase Cloud Messaging** - Notificações push
- **Dio** - Cliente HTTP
- **flutter_bloc** - Gerenciamento de estado
- **shared_preferences** - Armazenamento local

---

## 📊 Fluxo de Funcionamento

### Envio de Alerta Fixo
1. Usuário acessa o app/web
2. Clica em "Enviar Alerta"
3. Informa a placa do veículo
4. Seleciona o tipo de alerta fixo
5. Sistema envia alerta para todos os proprietários/usuários do veículo
6. Notificações são enviadas via Email, WhatsApp e Push

### Envio de Alerta Personalizado
1. Usuário seleciona "Alerta Personalizado"
2. Sistema verifica se tem créditos
3. Usuário digita mensagem customizada
4. Sistema deduz 1 crédito
5. Alerta é enviado para proprietários/usuários
6. Notificações multi-canal

### Recebimento de Notificação Push
1. Proprietário recebe notificação push
2. Som de buzina toca automaticamente
3. Notificação exibe tipo de alerta
4. Usuário pode clicar para ver detalhes
5. Histórico é salvo no app

---

## 🚀 Deploy

### Backend (Node.js)
```bash
# Build
npm run build

# Deploy em serviço como Heroku, Railway, Vercel
# Configurar variáveis de ambiente no servidor
# Executar migrações: pnpm db:push
```

### Frontend (Angular)
```bash
# Build
ng build --prod

# Deploy em Netlify, Vercel, GitHub Pages
# Arquivo de build: dist/comunycar-angular
```

### Mobile (Flutter)
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release

# Upload para Google Play e App Store
```

---

## 📝 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=mysql://user:password@localhost:3306/comunycar
JWT_SECRET=seu_jwt_secret_aqui
FIREBASE_PROJECT_ID=seu_firebase_project_id
FIREBASE_PRIVATE_KEY=sua_firebase_private_key
FIREBASE_CLIENT_EMAIL=seu_firebase_client_email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_gmail
STRIPE_SECRET_KEY=sua_stripe_secret_key
PAYPAL_CLIENT_ID=seu_paypal_client_id
PAYPAL_CLIENT_SECRET=seu_paypal_client_secret
```

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 👥 Autores

- **David Sodrelins** - Desenvolvedor Principal

---

## 📞 Suporte

Para suporte, abra uma issue no repositório GitHub ou entre em contato através do email.

---

## 🎉 Agradecimentos

Obrigado a todos que contribuíram para este projeto!

---

**Última atualização:** Outubro 2024
**Versão:** 1.0.0
