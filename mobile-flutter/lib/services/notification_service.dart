import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:just_audio/just_audio.dart';
import 'dart:io' show Platform;

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  static final AudioPlayer _audioPlayer = AudioPlayer();

  static Future<void> initialize() async {
    // Solicitar permissão de notificação
    await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    // Inicializar notificações locais
    const AndroidInitializationSettings androidInitializationSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosInitializationSettings =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: androidInitializationSettings,
      iOS: iosInitializationSettings,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Criar canal de notificação para Android
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'comunycar_alerts',
      'comunyCAR Alerts',
      description: 'Notificações de alertas do comunyCAR',
      importance: Importance.high,
      enableVibration: true,
      playSound: true,
      sound: RawResourceAndroidNotificationSound('buzzer'),
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // Handlers para mensagens Firebase
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
  }

  /// Reproduzir som de buzina
  static Future<void> playBuzinerSound() async {
    try {
      await _audioPlayer.setAsset('assets/sounds/buzzer.mp3');
      await _audioPlayer.play();
    } catch (e) {
      print('Erro ao reproduzir som de buzina: $e');
    }
  }

  /// Reproduzir som de notificação
  static Future<void> playNotificationSound() async {
    try {
      await _audioPlayer.setAsset('assets/sounds/notification.mp3');
      await _audioPlayer.play();
    } catch (e) {
      print('Erro ao reproduzir som de notificação: $e');
    }
  }

  /// Obter token de push
  static Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }

  /// Handler para mensagens em foreground
  static void _handleForegroundMessage(RemoteMessage message) async {
    print('Mensagem em foreground: ${message.notification?.title}');

    // Reproduzir som de buzina
    await playBuzinerSound();

    // Mostrar notificação local
    const AndroidNotificationDetails androidNotificationDetails =
        AndroidNotificationDetails(
      'comunycar_alerts',
      'comunyCAR Alerts',
      channelDescription: 'Notificações de alertas do comunyCAR',
      importance: Importance.max,
      priority: Priority.high,
      sound: RawResourceAndroidNotificationSound('buzzer'),
      playSound: true,
      enableVibration: true,
      fullScreenIntent: true,
    );

    const DarwinNotificationDetails iosNotificationDetails =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      sound: 'buzzer.mp3',
    );

    const NotificationDetails notificationDetails = NotificationDetails(
      android: androidNotificationDetails,
      iOS: iosNotificationDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title ?? 'Alerta do comunyCAR',
      message.notification?.body ?? 'Você recebeu um novo alerta',
      notificationDetails,
      payload: message.data.toString(),
    );
  }

  /// Handler para mensagens abertas
  static void _handleMessageOpenedApp(RemoteMessage message) {
    print('Mensagem aberta: ${message.notification?.title}');
    // Navegar para a tela de detalhes do alerta
  }

  /// Handler para notificação tocada
  static void _onNotificationTapped(
    NotificationResponse notificationResponse,
  ) {
    print('Notificação tocada: ${notificationResponse.payload}');
  }

  /// Enviar notificação local de teste
  static Future<void> sendTestNotification() async {
    const AndroidNotificationDetails androidNotificationDetails =
        AndroidNotificationDetails(
      'comunycar_alerts',
      'comunyCAR Alerts',
      channelDescription: 'Notificações de alertas do comunyCAR',
      importance: Importance.max,
      priority: Priority.high,
      sound: RawResourceAndroidNotificationSound('buzzer'),
      playSound: true,
      enableVibration: true,
    );

    const NotificationDetails notificationDetails = NotificationDetails(
      android: androidNotificationDetails,
    );

    await _localNotifications.show(
      0,
      'Teste de Notificação',
      'Este é um teste de notificação com som de buzina',
      notificationDetails,
    );

    await playBuzinerSound();
  }
}
