import { Client } from "whatsapp-web.js";
import qrcode from "qrcode";
import * as db from "../db";

// Import dinâmico de LocalAuth
let LocalAuth: any;
try {
  const waModule = require("whatsapp-web.js");
  LocalAuth = waModule.LocalAuth;
} catch (error) {
  console.warn("[WhatsApp] LocalAuth não disponível, usando fallback");
}

/**
 * Serviço de WhatsApp para envio de notificações
 * Usa whatsapp-web.js para conectar e enviar mensagens
 */
class WhatsappService {
  private clients: Map<number, Client> = new Map(); // configId -> Client

  /**
   * Conectar WhatsApp e gerar QR code
   */
  async connect(configId: number, userId: number): Promise<string> {
    try {
      // Verificar se já existe cliente conectado
      if (this.clients.has(configId)) {
        const client = this.clients.get(configId)!;
        if (client.info) {
          console.log(`[WhatsApp] Cliente já conectado: ${configId}`);
          return "already_connected";
        }
      }

      // Criar novo cliente
      const authStrategy = LocalAuth ? new LocalAuth({ clientId: `comunycar-${configId}` }) : undefined;
      const client = new Client({
        authStrategy,
      });

      // Listener para QR code
      client.on("qr", async (qr: string) => {
        try {
          const qrCodeImage = await qrcode.toDataURL(qr);
          console.log(`[WhatsApp] QR Code gerado para config ${configId}`);

          // Atualizar QR code no banco de dados
          await db.updateWhatsappConfig(configId, {
            status: "connecting",
            qrCode: qrCodeImage,
          });
        } catch (error) {
          console.error("[WhatsApp] Erro ao gerar QR code:", error);
        }
      });

      // Listener para conexão bem-sucedida
      client.on("ready", async () => {
        console.log(`[WhatsApp] Cliente conectado: ${configId}`);
        await db.updateWhatsappConfig(configId, {
          status: "connected",
          lastConnectedAt: new Date(),
        });
      });

      // Listener para desconexão
      client.on("disconnected", async () => {
        console.log(`[WhatsApp] Cliente desconectado: ${configId}`);
        await db.updateWhatsappConfig(configId, { status: "disconnected" });
        this.clients.delete(configId);
      });

      // Listener para erro de autenticação
      client.on("auth_failure", async () => {
        console.error(`[WhatsApp] Falha na autenticação: ${configId}`);
        await db.updateWhatsappConfig(configId, { status: "error" });
        this.clients.delete(configId);
      });

      // Armazenar cliente
      this.clients.set(configId, client);

      // Inicializar cliente
      await client.initialize();

      return "connecting";
    } catch (error) {
      console.error("[WhatsApp] Erro ao conectar:", error);
      await db.updateWhatsappConfig(configId, { status: "error" });
      return "error";
    }
  }

  /**
   * Desconectar WhatsApp
   */
  async disconnect(configId: number): Promise<void> {
    try {
      const client = this.clients.get(configId);
      if (client) {
        await client.destroy();
        this.clients.delete(configId);
        console.log(`[WhatsApp] Cliente desconectado: ${configId}`);
      }
      await db.updateWhatsappConfig(configId, { status: "disconnected" });
    } catch (error) {
      console.error("[WhatsApp] Erro ao desconectar:", error);
    }
  }

  /**
   * Enviar mensagem WhatsApp
   */
  async sendMessage(configId: number, phoneNumber: string, message: string): Promise<boolean> {
    try {
      const client = this.clients.get(configId);
      if (!client || !client.info) {
        console.warn(`[WhatsApp] Cliente não conectado: ${configId}`);
        return false;
      }

      // Formatar número de telefone (adicionar código do país se necessário)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Enviar mensagem
      const chatId = `${formattedPhone}@c.us`;
      await client.sendMessage(chatId, message);

      console.log(`[WhatsApp] Mensagem enviada para ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error("[WhatsApp] Erro ao enviar mensagem:", error);
      return false;
    }
  }

  /**
   * Enviar alerta de veículo via WhatsApp
   */
  async sendAlertNotification(
    configId: number,
    phoneNumber: string,
    plate: string,
    alertTitle: string,
    alertMessage: string
  ): Promise<boolean> {
    try {
      const message = `🚗 *ALERTA DE VEÍCULO*\n\n*Placa:* ${plate}\n*Tipo:* ${alertTitle}\n*Mensagem:* ${alertMessage}\n\nPor favor, verifique seu veículo o mais breve possível.`;

      return await this.sendMessage(configId, phoneNumber, message);
    } catch (error) {
      console.error("[WhatsApp] Erro ao enviar alerta:", error);
      return false;
    }
  }

  /**
   * Processar fila de mensagens WhatsApp pendentes
   */
  async processPendingMessages(): Promise<void> {
    try {
      const pendingMessages = await db.getPendingWhatsappMessages(10);

      for (const msg of pendingMessages) {
        try {
          // TODO: Encontrar configuração WhatsApp apropriada
          // Por enquanto, pular
          console.log(`[WhatsApp] Processando mensagem ${msg.id}`);
        } catch (error) {
          console.error(`[WhatsApp] Erro ao processar mensagem ${msg.id}:`, error);
        }
      }
    } catch (error) {
      console.error("[WhatsApp] Erro ao processar fila:", error);
    }
  }

  /**
   * Formatar número de telefone para WhatsApp
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remover caracteres especiais
    let formatted = phoneNumber.replace(/\D/g, "");

    // Se não começar com código do país, adicionar 55 (Brasil)
    if (!formatted.startsWith("55")) {
      formatted = "55" + formatted;
    }

    return formatted;
  }

  /**
   * Obter status de conexão
   */
  getStatus(configId: number): string {
    const client = this.clients.get(configId);
    if (!client) return "disconnected";
    if (!client.info) return "connecting";
    return "connected";
  }
}

export const whatsappService = new WhatsappService();
