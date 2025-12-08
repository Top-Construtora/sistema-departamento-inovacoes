import { Request, Response, NextFunction } from 'express';

interface RequestLogData {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  userId?: string;
  statusCode: number;
  duration: number;
  timestamp: string;
}

// Cores para o console (opcional)
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function getStatusColor(status: number): string {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  return colors.green;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Captura quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const logData: RequestLogData = {
      method: req.method,
      url: req.originalUrl,
      ip,
      userAgent,
      userId: req.usuario?.userId,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    };

    // Log formatado
    const statusColor = getStatusColor(res.statusCode);
    const methodPadded = req.method.padEnd(7);

    console.log(
      `${colors.dim}[${logData.timestamp}]${colors.reset} ` +
      `${statusColor}${methodPadded}${colors.reset} ` +
      `${req.originalUrl} ` +
      `${statusColor}${res.statusCode}${colors.reset} ` +
      `${colors.dim}${formatDuration(duration)}${colors.reset}` +
      (logData.userId ? ` ${colors.dim}user:${logData.userId.slice(0, 8)}${colors.reset}` : '')
    );

    // Log de requests lentas (>1s)
    if (duration > 1000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.originalUrl} took ${formatDuration(duration)}`);
    }
  });

  next();
}

// Middleware simplificado para producao
export function requestLoggerSimple(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}
