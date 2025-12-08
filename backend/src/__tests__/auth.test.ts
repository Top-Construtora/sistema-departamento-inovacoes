import request from 'supertest';
import { app } from '../app.js';

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('deve retornar erro 400 quando email nao e fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ senha: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email e senha');
    });

    it('deve retornar erro 400 quando senha nao e fornecida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'teste@teste.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email e senha');
    });

    it('deve retornar erro 401 com credenciais invalidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'usuario-inexistente@teste.com',
          senha: 'senha-errada',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/registro', () => {
    it('deve retornar erro 400 quando campos obrigatorios nao sao fornecidos', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send({ nome: 'Teste' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 400 quando senha tem menos de 6 caracteres', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send({
          nome: 'Teste',
          email: 'teste@teste.com',
          senha: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('6 caracteres');
    });

    it('deve retornar erro 400 quando perfil e invalido', async () => {
      const response = await request(app)
        .post('/api/auth/registro')
        .send({
          nome: 'Teste',
          email: 'teste@teste.com',
          senha: '123456',
          perfil: 'INVALIDO',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Perfil inv');
    });
  });

  describe('GET /api/auth/me', () => {
    it('deve retornar erro 401 sem token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 401 com token invalido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
