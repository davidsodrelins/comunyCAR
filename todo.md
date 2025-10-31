# comunyCAR - Project TODO

## Backend (Node.js + Express + tRPC)

### Authentication & Users
- [x] Modelo de dados para usuários (nome, email, telefone, CNPJ, senha hash)
- [x] Validação de email com verificação por link
- [ ] Validação de CNPJ (integração com API externa ou validação local)
- [x] Sistema de autenticação JWT (via Manus OAuth)
- [x] Endpoints de cadastro, login, logout (via Manus OAuth)
- [x] Recuperação de senha (token-based)
- [ ] Perfil de usuário (editar dados pessoais)

### Veículos & Proprietários
- [x] Modelo de dados para veículos (placa, marca, modelo, cor)
- [x] Modelo de dados para vinculação usuário-veículo (Owner, Secundário)
- [x] Endpoints para cadastrar veículo
- [ ] Endpoints para adicionar usuários secundários a um veículo
- [x] Endpoints para listar veículos do usuário
- [ ] Endpoints para remover usuários de um veículo

### Alertas Fixos
- [x] Modelo de dados para alertas fixos (7 tipos predefinidos)
- [x] Endpoints para listar alertas fixos disponíveis
- [x] Modelo de dados para alertas enviados (remetente, veículo, tipo, timestamp)
- [x] Endpoints para enviar alerta fixo (validar placa, criar registro)

### Alertas Personalizados & Créditos
- [x] Modelo de dados para créditos do usuário
- [x] Modelo de dados para transações (compra, envio)
- [ ] Endpoints para comprar créditos (integração com gateway de pagamento)
- [x] Endpoints para enviar alerta personalizado (validar créditos, deduzir saldo)
- [ ] Endpoints para listar histórico de transações

### Notificações - Email
- [x] Configuração de SMTP (usar whatsapp.js lib para WhatsApp)
- [x] Serviço de envio de emails (alertas, confirmação de email, recuperação de senha)
- [x] Templates de email (alerta fixo, alerta personalizado, confirmação)
- [x] Fila de emails (para garantir entrega)

### Notificações - WhatsApp (whatsapp-web.js)
- [x] Integração com whatsapp-web.js
- [x] Modelo de dados para configuração WhatsApp (número, status, QR code)
- [x] Endpoints para conectar WhatsApp (gerar QR code)
- [x] Endpoints para desconectar WhatsApp
- [x] Serviço de envio de mensagens WhatsApp
- [x] Fila de mensagens WhatsApp

### Notificações - Push (Firebase Cloud Messaging)
- [x] Integração com Firebase Cloud Messaging (FCM)
- [x] Modelo de dados para tokens de push (user_id, device_token, platform)
- [x] Endpoints para registrar token de push
- [ ] Endpoints para remover token de push
- [x] Serviço de envio de notificações push
- [x] Payload de push com som de buzina (custom sound)

### Preferências de Notificação
- [x] Modelo de dados para preferências (email_enabled, whatsapp_enabled, push_enabled)
- [x] Endpoints para atualizar preferências de notificação

### Segurança & Validação
- [ ] Rate limiting para envio de alertas (evitar spam)
- [ ] Validação de placa (formato brasileiro)
- [x] Proteção contra envio de alertas para placas inexistentes
- [x] Logs de auditoria (quem enviou alerta, quando, para qual placa)

## Frontend Web (Angular)

### Autenticação
- [ ] Página de login
- [ ] Página de cadastro (nome, email, telefone, CNPJ, senha)
- [ ] Validação de email (link de confirmação)
- [ ] Página de recuperação de senha
- [ ] Proteção de rotas (apenas usuários autenticados)

### Dashboard
- [ ] Dashboard principal (resumo de veículos, alertas recentes)
- [ ] Barra de navegação (menu lateral ou top nav)
- [ ] Perfil de usuário (editar dados)

### Gestão de Veículos
- [ ] Página para cadastrar novo veículo (placa, marca, modelo, cor)
- [ ] Página para listar veículos do usuário
- [ ] Página para gerenciar usuários secundários de um veículo
- [ ] Formulário para adicionar usuário secundário (email/telefone)
- [ ] Opção para remover usuário secundário

### Envio de Alertas
- [ ] Página para enviar alerta fixo (buscar placa, selecionar tipo de alerta)
- [ ] Página para enviar alerta personalizado (validar créditos, escrever mensagem)
- [ ] Confirmação antes de enviar alerta
- [ ] Feedback visual após envio (sucesso/erro)

### Gestão de Créditos
- [ ] Página para visualizar saldo de créditos
- [ ] Página para comprar créditos (integração com gateway de pagamento)
- [ ] Histórico de transações (compras, envios)

### Preferências de Notificação
- [ ] Página de configurações (habilitar/desabilitar email, WhatsApp, push)
- [ ] Página para conectar WhatsApp (exibir QR code)
- [ ] Página para gerenciar tokens de push (listar dispositivos)

### Histórico de Alertas
- [ ] Página para visualizar alertas recebidos (como proprietário)
- [ ] Página para visualizar alertas enviados (como remetente)
- [ ] Filtros por data, tipo de alerta, placa

## Apps Móveis (Flutter)

### Autenticação
- [ ] Tela de login
- [ ] Tela de cadastro (nome, email, telefone, CNPJ, senha)
- [ ] Validação de email (link de confirmação)
- [ ] Tela de recuperação de senha
- [ ] Proteção de rotas (apenas usuários autenticados)

### Dashboard
- [ ] Tela inicial (resumo de veículos, alertas recentes)
- [ ] Menu de navegação (bottom nav ou drawer)
- [ ] Perfil de usuário (editar dados)

### Gestão de Veículos
- [ ] Tela para cadastrar novo veículo (placa, marca, modelo, cor)
- [ ] Tela para listar veículos do usuário
- [ ] Tela para gerenciar usuários secundários de um veículo
- [ ] Formulário para adicionar usuário secundário (email/telefone)
- [ ] Opção para remover usuário secundário

### Envio de Alertas
- [ ] Tela para enviar alerta fixo (buscar placa, selecionar tipo de alerta)
- [ ] Tela para enviar alerta personalizado (validar créditos, escrever mensagem)
- [ ] Confirmação antes de enviar alerta
- [ ] Feedback visual após envio (sucesso/erro)

### Gestão de Créditos
- [ ] Tela para visualizar saldo de créditos
- [ ] Tela para comprar créditos (integração com gateway de pagamento)
- [ ] Histórico de transações (compras, envios)

### Notificações Push
- [ ] Integração com Firebase Cloud Messaging (FCM)
- [ ] Registro de token de push ao abrir app
- [ ] Recebimento de notificações push
- [ ] Som de buzina ao receber alerta (custom sound)
- [ ] Tela para gerenciar preferências de notificação

### Histórico de Alertas
- [ ] Tela para visualizar alertas recebidos (como proprietário)
- [ ] Tela para visualizar alertas enviados (como remetente)
- [ ] Filtros por data, tipo de alerta, placa

## Testes & Documentação

### Testes Backend
- [ ] Testes unitários para validações (email, CNPJ, placa)
- [ ] Testes de integração para endpoints de autenticação
- [ ] Testes de integração para endpoints de alertas
- [ ] Testes de integração para endpoints de créditos

### Testes Frontend
- [ ] Testes de componentes (Angular)
- [ ] Testes de integração (Angular)
- [ ] Testes de componentes (Flutter)

### Documentação
- [ ] README.md com instruções de setup
- [ ] Documentação de API (Swagger/OpenAPI)
- [ ] Guia de deploy (backend, frontend web, apps móveis)
- [ ] Guia de contribuição
- [ ] userGuide.md (instruções para usuários finais)

## Infraestrutura & DevOps

### Backend
- [ ] Setup de banco de dados (MySQL/PostgreSQL)
- [ ] Variáveis de ambiente (.env)
- [ ] Docker (opcional)
- [ ] CI/CD (GitHub Actions)

### Frontend Web
- [ ] Build otimizado (production)
- [ ] Deploy (Vercel, Netlify, ou servidor próprio)

### Apps Móveis
- [ ] Build para Android (APK/AAB)
- [ ] Build para iOS (IPA)
- [ ] Deploy em app stores (Google Play, Apple App Store)

## Integrações Externas

### Pagamento
- [ ] Integração com Stripe ou PayPal (compra de créditos)

### Email
- [ ] Configuração de SMTP (SendGrid, AWS SES, ou similar)

### WhatsApp
- [ ] Integração com whatsapp-web.js

### Push Notifications
- [ ] Integração com Firebase Cloud Messaging (FCM)

### Validação de CNPJ
- [ ] Integração com API externa ou validação local

## Melhorias Futuras

- [ ] Sistema de avaliação/reputação de usuários
- [ ] Alertas automáticos (ex: veículo parado em zona de risco)
- [ ] Integração com câmeras de segurança
- [ ] Suporte a múltiplos idiomas
- [ ] Dark mode
- [ ] Análise de dados (relatórios de alertas por região)
