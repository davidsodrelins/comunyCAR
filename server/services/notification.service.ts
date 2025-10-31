import * as db from "../db";
import { emailService } from "./email.service";
import { whatsappService } from "./whatsapp.service";
import { pushService } from "./push.service";

/**
 * Serviço de Notificações - Coordena Email, WhatsApp e Push
 */
class NotificationService {
  /**
   * Enviar alerta para proprietários e usuários secundários de um veículo
   */
  async sendAlertToVehicleUsers(
    vehicleId: number,
    plate: string,
    alertTitle: string,
    alertMessage: string
  ): Promise<void> {
    try {
      // Buscar usuários do veículo
      const vehicleUsers = await db.getVehicleUsers(vehicleId);

      for (const vu of vehicleUsers) {
        const userId = vu.user.id;
        const userName = vu.user.name || "Usuário";
        const userEmail = vu.user.email;
        const userPhone = vu.user.phone;

        // Buscar preferências de notificação
        let prefs = await db.getNotificationPreferences(userId);
        if (!prefs) {
          prefs = await db.initializeNotificationPreferences(userId);
        }

        // Enviar por Email
        if (prefs.emailEnabled && userEmail) {
          try {
            await emailService.sendAlertNotification(
              userEmail,
              userName,
              plate,
              alertTitle,
              alertMessage
            );
            console.log(`[Notification] Email enviado para ${userEmail}`);
          } catch (error) {
            console.error(`[Notification] Erro ao enviar email para ${userEmail}:`, error);
          }
        }

        // Enviar por WhatsApp
        if (prefs.whatsappEnabled && userPhone) {
          try {
            // TODO: Encontrar configuração WhatsApp do usuário
            // const config = await db.getWhatsappConfig(userId);
            // if (config && config.status === "connected") {
            //   await whatsappService.sendAlertNotification(
            //     config.id,
            //     userPhone,
            //     plate,
            //     alertTitle,
            //     alertMessage
            //   );
            //   console.log(`[Notification] WhatsApp enviado para ${userPhone}`);
            // }
          } catch (error) {
            console.error(`[Notification] Erro ao enviar WhatsApp para ${userPhone}:`, error);
          }
        }

        // Enviar por Push
        if (prefs.pushEnabled) {
          try {
            await pushService.sendAlertNotification(
              userId,
              plate,
              alertTitle,
              alertMessage
            );
            console.log(`[Notification] Push enviado para usuário ${userId}`);
          } catch (error) {
            console.error(`[Notification] Erro ao enviar push para usuário ${userId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("[Notification] Erro ao enviar alertas:", error);
    }
  }

  /**
   * Enviar email de confirmação
   */
  async sendEmailVerification(
    userId: number,
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    try {
      await emailService.sendEmailVerification(email, name, token);
      console.log(`[Notification] Email de confirmação enviado para ${email}`);
    } catch (error) {
      console.error(`[Notification] Erro ao enviar confirmação para ${email}:`, error);
    }
  }

  /**
   * Enviar email de recuperação de senha
   */
  async sendPasswordReset(
    userId: number,
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    try {
      await emailService.sendPasswordReset(email, name, token);
      console.log(`[Notification] Email de reset enviado para ${email}`);
    } catch (error) {
      console.error(`[Notification] Erro ao enviar reset para ${email}:`, error);
    }
  }

  /**
   * Processar filas de notificações pendentes
   */
  async processQueues(): Promise<void> {
    try {
      console.log("[Notification] Processando filas de notificações...");

      // Processar emails
      await emailService.processPendingEmails();

      // Processar WhatsApp
      await whatsappService.processPendingMessages();

      // TODO: Processar push notifications

      console.log("[Notification] Filas processadas");
    } catch (error) {
      console.error("[Notification] Erro ao processar filas:", error);
    }
  }
}

export const notificationService = new NotificationService();
