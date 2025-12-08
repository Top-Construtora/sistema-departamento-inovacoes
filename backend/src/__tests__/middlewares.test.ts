import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../middlewares/errorHandler.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('deve criar erro com valores padrao', () => {
      const error = new AppError('Erro teste');

      expect(error.message).toBe('Erro teste');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('deve criar erro com valores customizados', () => {
      const error = new AppError('Erro customizado', 418, 'TEAPOT', false);

      expect(error.message).toBe('Erro customizado');
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe('TEAPOT');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('BadRequestError', () => {
    it('deve criar erro 400', () => {
      const error = new BadRequestError('Dados invalidos');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Dados invalidos');
    });

    it('deve usar mensagem padrao', () => {
      const error = new BadRequestError();

      expect(error.message).toBe('Requisicao invalida');
    });
  });

  describe('UnauthorizedError', () => {
    it('deve criar erro 401', () => {
      const error = new UnauthorizedError('Token expirado');

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Token expirado');
    });
  });

  describe('ForbiddenError', () => {
    it('deve criar erro 403', () => {
      const error = new ForbiddenError('Sem permissao');

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Sem permissao');
    });
  });

  describe('NotFoundError', () => {
    it('deve criar erro 404', () => {
      const error = new NotFoundError('Usuario nao encontrado');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Usuario nao encontrado');
    });
  });

  describe('ValidationError', () => {
    it('deve criar erro 422 com lista de erros', () => {
      const errors = [
        { field: 'email', message: 'Email invalido' },
        { field: 'senha', message: 'Senha muito curta' },
      ];
      const error = new ValidationError('Erro de validacao', errors);

      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toHaveLength(2);
      expect(error.errors[0].field).toBe('email');
    });
  });
});
