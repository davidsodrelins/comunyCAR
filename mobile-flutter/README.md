# Flutter Mobile App - comunyCAR

Aplicativo móvel para Android e iOS do sistema comunyCAR.

## Setup

```bash
cd mobile-flutter
flutter pub get
flutter run
```

## Funcionalidades

- Envio de alertas para veículos
- Recebimento de notificações push com som de buzina
- Gestão de créditos
- Preferências de notificação
- Integração com Firebase Cloud Messaging

## Estrutura

- `lib/main.dart` - Ponto de entrada da aplicação
- `lib/screens/` - Telas da aplicação
- `lib/services/` - Serviços (API, autenticação, notificações)
- `lib/models/` - Modelos de dados
- `lib/widgets/` - Widgets reutilizáveis

## Dependências

- flutter_bloc - Gerenciamento de estado
- dio - Cliente HTTP
- firebase_messaging - Notificações push
- shared_preferences - Armazenamento local

