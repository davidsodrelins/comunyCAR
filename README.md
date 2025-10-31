# comunyCAR - Sistema de Alertas de Veículos

Um sistema inovador que permite que usuários enviem alertas anônimos para proprietários de veículos através da placa do carro. Perfeito para avisar sobre problemas como faróis acesos, pneus furados, portas abertas e muito mais.

## 🎯 Funcionalidades Principais

### Para Pedestres (Remetentes)
- Enviar alertas fixos (7 tipos predefinidos) para qualquer placa
- Enviar alertas personalizados (requer créditos)
- Sistema de créditos para mensagens personalizadas
- Histórico de alertas enviados

### Para Proprietários de Veículos
- Cadastrar veículos com placa, marca, modelo e cor
- Adicionar usuários secundários (cônjuge, filhos, etc.)
- Receber alertas por Email, WhatsApp e Push Notifications
- Preferências de notificação customizáveis
- Histórico de alertas recebidos

### Notificações Multi-Canal
- **Email**: Templates HTML com informações do alerta
- **WhatsApp**: Mensagens formatadas via whatsapp-web.js
- **Push Notifications**: Firebase Cloud Messaging com som de buzina customizado

## 🏗️ Arquitetura

### Backend (Node.js + Express + tRPC)
- API REST com tRPC para type-safe procedures
- Banco de dados MySQL com Drizzle ORM
- Autenticação via Manus OAuth
- Sistema de alertas fixos e personalizados
- Gestão de créditos e transações
- Serviços de notificação (Email, WhatsApp, Push)
- Logs de auditoria completos

### Frontend (React + TypeScript + Tailwind CSS)
- Dashboard responsivo
- Gestão de veículos
- Envio de alertas
- Gestão de créditos
- Preferências de notificação

### Mobile (Flutter)
- Aplicativo Android e iOS
- Integração com Firebase Cloud Messaging
- Som de buzina customizado para alertas
- Mesmas funcionalidades do web

## 📋 Requisitos

- Node.js 18+
- MySQL 8.0+
- pnpm (gerenciador de pacotes)
- Flutter SDK (para desenvolvimento mobile)

## 🚀 Instalação e Setup

### 1. Clonar o repositório
```bash
git clone https://github.com/davidsodrelins/comunyCAR.git
cd comunyCAR
```

### 2. Instalar dependências
```bash
pnpm install
```

### 3. Configurar banco de dados MySQL
```bash
# Configurar DATABASE_URL com suas credenciais MySQL
# DATABASE_URL="mysql://usuario:senha@localhost:3306/comunycar"
```

### 4. Executar migrações
```bash
pnpm db:push
```

### 5. Iniciar o servidor de desenvolvimento
```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
comunyCAR/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # React Contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários e configurações
│   └── public/            # Arquivos estáticos
├── server/                # Backend Node.js
│   ├── routers/           # tRPC routers
│   ├── services/          # Serviços (Email, WhatsApp, Push)
│   ├── db.ts              # Helpers de banco de dados
│   └── _core/             # Configurações core
├── drizzle/               # Schema e migrações do banco de dados
├── shared/                # Código compartilhado
└── package.json           # Dependências do projeto
```

## 🗄️ Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `vehicles` - Veículos cadastrados
- `vehicle_users` - Vinculação usuário-veículo
- `alerts` - Alertas enviados
- `fixed_alerts` - Alertas fixos predefinidos
- `credits` - Saldo de créditos
- `credit_transactions` - Histórico de transações
- `notification_preferences` - Preferências de notificação
- `push_tokens` - Tokens para Firebase Cloud Messaging
- `whatsapp_configs` - Configuração WhatsApp
- `email_queue` - Fila de emails
- `whatsapp_queue` - Fila de mensagens WhatsApp
- `audit_logs` - Logs de auditoria

## 🔐 Segurança

- Autenticação via OAuth (Manus)
- Validação de placas
- Rate limiting para evitar spam
- Logs de auditoria completos
- Proteção contra envio de alertas para placas inexistentes

## 📱 Alertas Fixos Disponíveis

1. **Faróis Acesos** - O farol do veículo está aceso
2. **Pneu Furado/Baixo** - Um dos pneus está furado ou muito baixo
3. **Porta Aberta** - Porta ou porta-malas está aberta
4. **Vazamento de Fluido** - Há vazamento de óleo, água, etc.
5. **Alarme Disparado** - O alarme do veículo está disparado
6. **Obstrução de Via** - Veículo está obstruindo garagem/passagem
7. **Outro Problema** - Problema genérico com o veículo

## 💳 Sistema de Créditos

- Alertas fixos são **gratuitos**
- Alertas personalizados custam **1 crédito** cada
- Créditos podem ser comprados via Stripe ou PayPal
- Histórico completo de transações

## 🔔 Notificações

### Email
- Templates HTML customizados
- Confirmação de email
- Recuperação de senha
- Alertas de veículos

### WhatsApp
- Integração com whatsapp-web.js
- Conexão via QR code
- Mensagens formatadas
- Fila de mensagens

### Push Notifications
- Firebase Cloud Messaging
- Som de buzina customizado
- Suporte para Android, iOS e Web
- Notificações em tempo real

## 📚 Documentação da API

A API está disponível em `/api/trpc` e usa tRPC para type-safe procedures.

### Routers Disponíveis

#### Veículos
- `vehicles.create` - Cadastrar novo veículo
- `vehicles.list` - Listar veículos do usuário
- `vehicles.getByPlate` - Buscar veículo por placa
- `vehicles.addSecondaryUser` - Adicionar usuário secundário
- `vehicles.getUsers` - Listar usuários de um veículo

#### Alertas
- `alerts.getFixedAlerts` - Listar alertas fixos
- `alerts.sendFixed` - Enviar alerta fixo
- `alerts.sendPersonalized` - Enviar alerta personalizado
- `alerts.getReceived` - Listar alertas recebidos
- `alerts.getSent` - Listar alertas enviados

#### Créditos
- `credits.getBalance` - Obter saldo de créditos
- `credits.purchase` - Comprar créditos
- `credits.getTransactions` - Listar transações

#### Notificações
- `notifications.getPreferences` - Obter preferências
- `notifications.updatePreferences` - Atualizar preferências
- `notifications.registerPushToken` - Registrar token de push
- `notifications.getPushTokens` - Listar tokens de push
- `notifications.connectWhatsapp` - Conectar WhatsApp
- `notifications.disconnectWhatsapp` - Desconectar WhatsApp
- `notifications.getWhatsappStatus` - Obter status WhatsApp

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autor

Desenvolvido por **Manus AI**

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**comunyCAR** - Conectando pedestres com proprietários de veículos para uma rua mais segura! 🚗💬
