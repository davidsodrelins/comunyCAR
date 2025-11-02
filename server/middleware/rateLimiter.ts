import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitOptions {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições por janela
  keyGenerator?: (req: Request) => string; // Função para gerar chave (padrão: IP)
  skipSuccessfulRequests?: boolean; // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean; // Pular requisições falhadas
}

class RateLimiter {
  private store: RateLimitStore = {};
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options,
    };

    // Limpar store a cada windowMs
    setInterval(() => {
      const now = Date.now();
      for (const key in this.store) {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      }
    }, this.options.windowMs);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key =
        this.options.keyGenerator?.(req) || req.ip || "unknown";
      const now = Date.now();

      // Inicializar ou atualizar o registro
      if (!this.store[key]) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.options.windowMs,
        };
        return next();
      }

      // Verificar se a janela expirou
      if (this.store[key].resetTime < now) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.options.windowMs,
        };
        return next();
      }

      // Incrementar contador
      this.store[key].count++;

      // Verificar limite
      if (this.store[key].count > this.options.maxRequests) {
        const resetTime = this.store[key].resetTime;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        res.set("Retry-After", retryAfter.toString());
        return res.status(429).json({
          error: "Muitas requisições. Tente novamente mais tarde.",
          retryAfter,
        });
      }

      next();
    };
  }
}

/**
 * Cria um rate limiter para login (máximo 5 tentativas a cada 15 minutos)
 */
export function createLoginRateLimiter() {
  return new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    keyGenerator: (req) => req.ip || "unknown",
  }).middleware();
}

/**
 * Cria um rate limiter para envio de alertas (máximo 10 alertas a cada 1 hora)
 */
export function createAlertRateLimiter() {
  return new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,
    keyGenerator: (req) => {
      // Usar user ID se autenticado, senão usar IP
      return (req as any).user?.id?.toString() || req.ip || "unknown";
    },
  }).middleware();
}

/**
 * Cria um rate limiter genérico para API
 */
export function createApiRateLimiter(
  windowMs: number = 60 * 1000, // 1 minuto
  maxRequests: number = 100
) {
  return new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => req.ip || "unknown",
  }).middleware();
}

export default RateLimiter;
