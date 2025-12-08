import { Request, Response, NextFunction } from 'express';

// Classe de erro customizada
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erros comuns pre-definidos
export class BadRequestError extends AppError {
  constructor(message: string = 'Requisicao invalida') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Nao autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso nao encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados') {
    super(message, 409, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string>[];

  constructor(message: string = 'Erro de validacao', errors: Record<string, string>[] = []) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

// Interface padronizada de resposta de erro
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    errors?: Record<string, string>[];
    stack?: string;
  };
}

// Middleware de tratamento de erros
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log do erro
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    // Erro operacional conhecido
    console.error(`[ERROR] ${err.statusCode} - ${err.code}: ${err.message}`);

    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
      },
    };

    // Adicionar detalhes de validacao se houver
    if (err instanceof ValidationError && err.errors.length > 0) {
      response.error.errors = err.errors;
    }

    // Adicionar stack trace em desenvolvimento
    if (!isProduction) {
      response.error.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Erro desconhecido/inesperado
  console.error('[FATAL ERROR]', err);

  const response: ErrorResponse = {
    success: false,
    error: {
      message: isProduction ? 'Erro interno do servidor' : err.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  };

  if (!isProduction) {
    response.error.stack = err.stack;
  }

  res.status(500).json(response);
}

// Middleware para capturar erros async
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
