import admin from "firebase-admin";
import * as db from "../db";

/**
 * Serviço de Push Notifications usando Firebase Cloud Messaging
 */
class PushService {
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializar Firebase Admin
   */
  private initialize() {
    try {
      // TODO: Configurar Firebase Admin com credenciais
      // Por enquanto, apenas verificar se está disponível
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        // admin.initializeApp({
        //   credential: admin.credential.cert({
        //     projectId: process.env.FIREBASE_PROJECT_ID,
        //     privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        //     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        //   }),
        // });
        this.initialized = true;
        console.log("[Push] Firebase inicializado");
      } else {
        console.warn("[Push] Credenciais do Firebase não configuradas");
      }
    } catch (error) {
      console.error("[Push] Erro ao inicializar Firebase:", error);
    }
  }

  /**
   * Enviar notificação push para um usuário
   */
  async sendToUser(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.warn("[Push] Firebase não inicializado");
        return false;
      }

      // Buscar tokens de push do usuário
      const tokens = await db.getUserPushTokens(userId);
      if (tokens.length === 0) {
        console.warn(`[Push] Nenhum token encontrado para usuário ${userId}`);
        return false;
      }

      // Enviar para todos os tokens
      const results = await Promise.all(
        tokens.map(token => this.sendToToken(token.token, title, body, data))
      );

      return results.some(r => r);
    } catch (error) {
      console.error("[Push] Erro ao enviar notificação:", error);
      return false;
    }
  }

  /**
   * Enviar notificação push para um token específico
   */
  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.warn("[Push] Firebase não inicializado");
        return false;
      }

      // TODO: Implementar envio real via Firebase
      // Por enquanto, apenas logar
      console.log(`[Push] Enviando notificação para token ${token.substring(0, 20)}...`);
      console.log(`[Push] Título: ${title}, Body: ${body}`);

      // Payload com som de buzina
      const message = {
        notification: {
          title,
          body,
        },
        android: {
          priority: "high",
          notification: {
            sound: "buzina", // Som customizado de buzina
            channelId: "alerts",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "buzina.wav", // Som customizado para iOS
              badge: 1,
              "mutable-content": true,
            },
          },
        },
        webpush: {
          notification: {
            icon: "/icon-192x192.png",
            badge: "/badge-72x72.png",
            tag: "alert",
            requireInteraction: true,
          },
        },
        data: data || {},
      };

      // Enviar via Firebase
      // const response = await admin.messaging().send(message as admin.messaging.Message);
      // console.log(`[Push] Notificação enviada: ${response}`);

      return true;
    } catch (error) {
      console.error("[Push] Erro ao enviar para token:", error);
      return false;
    }
  }

  /**
   * Enviar alerta de veículo via push
   */
  async sendAlertNotification(
    userId: number,
    plate: string,
    alertTitle: string,
    alertMessage: string
  ): Promise<boolean> {
    try {
      const title = `Alerta: ${alertTitle}`;
      const body = `Placa ${plate}: ${alertMessage}`;

      const data = {
        type: "alert",
        plate,
        alertTitle,
      };

      return await this.sendToUser(userId, title, body, data);
    } catch (error) {
      console.error("[Push] Erro ao enviar alerta:", error);
      return false;
    }
  }

  /**
   * Enviar notificação em massa para múltiplos usuários
   */
  async sendToMultipleUsers(
    userIds: number[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<number> {
    try {
      let successCount = 0;

      for (const userId of userIds) {
        const success = await this.sendToUser(userId, title, body, data);
        if (success) successCount++;
      }

      console.log(`[Push] Notificações enviadas: ${successCount}/${userIds.length}`);
      return successCount;
    } catch (error) {
      console.error("[Push] Erro ao enviar em massa:", error);
      return 0;
    }
  }
}

export const pushService = new PushService();
