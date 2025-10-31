import nodemailer from "nodemailer";
import * as db from "../db";

/**
 * Serviço de Email para envio de notificações
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // TODO: Configurar SMTP com variáveis de ambiente
    // Por enquanto, usar configuração de teste
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: parseInt(process.env.SMTP_PORT || "2525"),
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }

  /**
   * Enviar email de alerta fixo
   */
  async sendAlertNotification(
    recipientEmail: string,
    recipientName: string,
    plate: string,
    alertTitle: string,
    alertMessage: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn("[Email] Transporter não inicializado");
        return false;
      }

      const htmlContent = this.generateAlertTemplate(
        recipientName,
        plate,
        alertTitle,
        alertMessage
      );

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@comunycar.com",
        to: recipientEmail,
        subject: `Alerta: ${alertTitle} - Placa ${plate}`,
        html: htmlContent,
      });

      console.log(`[Email] Alerta enviado para ${recipientEmail}: ${info.messageId}`);

      // Registrar na fila como enviado
      await db.queueEmail({
        recipientEmail,
        subject: `Alerta: ${alertTitle} - Placa ${plate}`,
        htmlContent,
      });

      return true;
    } catch (error) {
      console.error("[Email] Erro ao enviar alerta:", error);
      return false;
    }
  }

  /**
   * Enviar email de confirmação de email
   */
  async sendEmailVerification(
    recipientEmail: string,
    recipientName: string,
    verificationToken: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn("[Email] Transporter não inicializado");
        return false;
      }

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const htmlContent = `
        <h2>Bem-vindo ao comunyCAR, ${recipientName}!</h2>
        <p>Para confirmar seu email, clique no link abaixo:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Confirmar Email
        </a>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p>${verificationUrl}</p>
        <p>Este link expira em 24 horas.</p>
      `;

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@comunycar.com",
        to: recipientEmail,
        subject: "Confirme seu email - comunyCAR",
        html: htmlContent,
      });

      console.log(`[Email] Confirmação enviada para ${recipientEmail}: ${info.messageId}`);

      return true;
    } catch (error) {
      console.error("[Email] Erro ao enviar confirmação:", error);
      return false;
    }
  }

  /**
   * Enviar email de recuperação de senha
   */
  async sendPasswordReset(
    recipientEmail: string,
    recipientName: string,
    resetToken: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn("[Email] Transporter não inicializado");
        return false;
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const htmlContent = `
        <h2>Recuperação de Senha - comunyCAR</h2>
        <p>Olá ${recipientName},</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Redefinir Senha
        </a>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p>${resetUrl}</p>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
      `;

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@comunycar.com",
        to: recipientEmail,
        subject: "Recupere sua senha - comunyCAR",
        html: htmlContent,
      });

      console.log(`[Email] Reset enviado para ${recipientEmail}: ${info.messageId}`);

      return true;
    } catch (error) {
      console.error("[Email] Erro ao enviar reset:", error);
      return false;
    }
  }

  /**
   * Processar fila de emails pendentes
   */
  async processPendingEmails(): Promise<void> {
    try {
      const pendingEmails = await db.getPendingEmails(10);

      for (const email of pendingEmails) {
        try {
          if (!this.transporter) {
            console.warn("[Email] Transporter não inicializado");
            continue;
          }

          const info = await this.transporter.sendMail({
            from: process.env.SMTP_FROM || "noreply@comunycar.com",
            to: email.recipientEmail,
            subject: email.subject,
            html: email.htmlContent,
          });

          console.log(`[Email] Email enviado: ${info.messageId}`);
          // TODO: Atualizar status na fila
        } catch (error) {
          console.error(`[Email] Erro ao enviar email ${email.id}:`, error);
          // TODO: Atualizar tentativas e registrar erro
        }
      }
    } catch (error) {
      console.error("[Email] Erro ao processar fila:", error);
    }
  }

  /**
   * Gerar template HTML para alerta
   */
  private generateAlertTemplate(
    recipientName: string,
    plate: string,
    alertTitle: string,
    alertMessage: string
  ): string {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 5px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; text-align: center; }
            .content { padding: 20px; }
            .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Alerta de Veículo - comunyCAR</h1>
            </div>
            <div class="content">
              <p>Olá ${recipientName},</p>
              <p>Recebemos um alerta sobre seu veículo:</p>
              <div class="alert-box">
                <h3>${alertTitle}</h3>
                <p><strong>Placa:</strong> ${plate}</p>
                <p><strong>Mensagem:</strong> ${alertMessage}</p>
              </div>
              <p>Por favor, verifique seu veículo o mais breve possível.</p>
              <p>Se você tiver dúvidas, entre em contato conosco.</p>
            </div>
            <div class="footer">
              <p>comunyCAR - Sistema de Alertas de Veículos</p>
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
