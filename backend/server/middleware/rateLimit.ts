/**
 * Rate Limiting Middleware
 * Previne abuso de API limitando requisições por usuário/IP
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Configuração de rate limiting
 */
export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições por janela
  keyGenerator?: (req: Request) => string; // Função para gerar chave (padrão: IP do usuário)
  skipSuccessfulRequests?: boolean; // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean; // Pular requisições falhadas
}

/**
 * Criar middleware de rate limiting
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Inicializar ou resetar se passou a janela
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Incrementar contador
    store[key].count++;

    // Adicionar headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    // Verificar se excedeu limite
    if (store[key].count > maxRequests) {
      const resetTime = store[key].resetTime;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Você excedeu o limite de ${maxRequests} requisições em ${windowMs / 1000} segundos.`,
        retryAfter,
      });
    }

    // Interceptar response para pular requisições bem/mal-sucedidas
    const originalSend = res.send;
    res.send = function (data: any) {
      const statusCode = res.statusCode;

      if (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) {
        store[key].count--;
      }

      if (skipFailedRequests && statusCode >= 400) {
        store[key].count--;
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Rate limiter específico para alertas
 * Limite: 10 alertas por hora por usuário
 */
export const alertRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 10,
  keyGenerator: (req: Request) => {
    // Usar user ID se disponível, senão usar IP
    return (req as any).user?.id?.toString() || req.ip || 'unknown';
  },
});

/**
 * Rate limiter para login
 * Limite: 5 tentativas por 15 minutos
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,
  keyGenerator: (req: Request) => {
    // Usar email ou IP
    return (req.body?.email || req.ip || 'unknown').toLowerCase();
  },
});

/**
 * Rate limiter para API pública
 * Limite: 100 requisições por 15 minutos
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100,
});

/**
 * Rate limiter para pagamentos
 * Limite: 5 tentativas por hora
 */
export const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 5,
  keyGenerator: (req: Request) => {
    return (req as any).user?.id?.toString() || req.ip || 'unknown';
  },
});

/**
 * Limpar store de rate limiting periodicamente
 * Remove entradas expiradas a cada 10 minutos
 */
export function startRateLimitCleanup(intervalMs: number = 10 * 60 * 1000) {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Rate Limit] Limpeza: ${cleaned} entradas removidas`);
    }
  }, intervalMs);
}
