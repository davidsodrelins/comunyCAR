import * as admin from 'firebase-admin';
import { getDb } from '../db';
import { firebaseConfigs, pushNotifications } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Serviço Firebase para notificações push
 */
export class FirebaseService {
  private static instance: FirebaseService;
  private app: admin.app.App | null = null;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Inicializar Firebase
   */
  async initializeFirebase(): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const config = await db.select().from(firebaseConfigs).where(eq(firebaseConfigs.isActive, true)).limit(1);

    if (!config.length) {
      console.warn('[Firebase] No active configuration found');
      return;
    }

    const cfg = config[0];

    try {
      const serviceAccount = {
        type: 'service_account',
        project_id: cfg.projectId,
        private_key_id: '',
        private_key: cfg.privateKey.replace(/\\n/g, '\n'),
        client_email: cfg.clientEmail,
        client_id: cfg.clientId,
        auth_uri: cfg.authUri || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: cfg.tokenUri || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: cfg.authProviderX509CertUrl || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: cfg.clientX509CertUrl || '',
      };

      if (admin.apps.length === 0) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as any),
        });
      } else {
        this.app = admin.app();
      }

      console.log('[Firebase] Initialized successfully');
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação push
   */
  async sendPushNotification(
    userId: number,
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    alertId?: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    if (!this.app) {
      await this.initializeFirebase();
    }

    if (!this.app) {
      return {
        success: false,
        error: 'Firebase not initialized',
      };
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          sound: 'buzina', // Som de buzina customizado
          priority: 'high',
        },
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'buzina',
            channelId: 'alerts',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'buzina',
              'mutable-content': 1,
            },
          },
        },
        webpush: {
          notification: {
            title,
            body,
            tag: 'comunycar-alert',
            badge: '/badge.png',
          },
        },
        token,
      };

      const messageId = await admin.messaging().send(message as any);

      // Registrar notificação no banco
      await db.insert(pushNotifications).values({
        userId,
        alertId: alertId || null,
        title,
        body,
        data: JSON.stringify(data || {}),
        status: 'sent',
        firebaseMessageId: messageId,
        sentAt: new Date(),
      });

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      console.error('[Firebase] Error sending notification:', error);

      // Registrar falha no banco
      await db.insert(pushNotifications).values({
        userId,
        alertId: alertId || null,
        title,
        body,
        data: JSON.stringify(data || {}),
        status: 'failed',
        failureReason: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enviar notificação para múltiplos tokens
   */
  async sendMulticastNotification(
    userId: number,
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
    alertId?: number
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!tokens.length) {
      return { successCount: 0, failureCount: 0 };
    }

    let successCount = 0;
    let failureCount = 0;

    for (const token of tokens) {
      const result = await this.sendPushNotification(userId, token, title, body, data, alertId);
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    return { successCount, failureCount };
  }

  /**
   * Obter configuração ativa do Firebase
   */
  async getActiveConfig(): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const config = await db.select().from(firebaseConfigs).where(eq(firebaseConfigs.isActive, true)).limit(1);

    return config.length > 0 ? config[0] : null;
  }

  /**
   * Salvar ou atualizar configuração do Firebase
   */
  async saveConfig(
    projectId: string,
    privateKey: string,
    clientEmail: string,
    clientId: string,
    authUri?: string,
    tokenUri?: string,
    authProviderX509CertUrl?: string,
    clientX509CertUrl?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const existingConfig = await db.select().from(firebaseConfigs).limit(1);

    if (existingConfig.length > 0) {
      await db
        .update(firebaseConfigs)
        .set({
          projectId,
          privateKey,
          clientEmail,
          clientId,
          authUri,
          tokenUri,
          authProviderX509CertUrl,
          clientX509CertUrl,
        })
        .where(eq(firebaseConfigs.id, existingConfig[0].id));
    } else {
      await db.insert(firebaseConfigs).values({
        projectId,
        privateKey,
        clientEmail,
        clientId,
        authUri,
        tokenUri,
        authProviderX509CertUrl,
        clientX509CertUrl,
      });
    }

    // Reinicializar Firebase
    this.app = null;
    await this.initializeFirebase();
  }
}

export const firebaseService = FirebaseService.getInstance();
