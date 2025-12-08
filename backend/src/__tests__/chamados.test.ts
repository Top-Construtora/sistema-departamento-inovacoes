import request from 'supertest';
import { app } from '../app.js';

describe('Chamados API', () => {
  describe('POST /api/chamados', () => {
    it('deve retornar erro 401 sem autenticacao', async () => {
      const response = await request(app)
        .post('/api/chamados')
        .send({
          titulo: 'Teste',
          descricao: 'Descricao do chamado',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 401 com token invalido', async () => {
      const response = await request(app)
        .post('/api/chamados')
        .set('Authorization', 'Bearer token-invalido')
        .send({
          titulo: 'Teste',
          descricao: 'Descricao do chamado',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/chamados', () => {
    it('deve retornar erro 401 sem autenticacao', async () => {
      const response = await request(app).get('/api/chamados');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/chamados/:id', () => {
    it('deve retornar erro 401 sem autenticacao', async () => {
      const response = await request(app).get('/api/chamados/123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/chamados/:id/status', () => {
    it('deve retornar erro 401 sem autenticacao', async () => {
      const response = await request(app)
        .patch('/api/chamados/123/status')
        .send({ status: 'EM_ATENDIMENTO' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
