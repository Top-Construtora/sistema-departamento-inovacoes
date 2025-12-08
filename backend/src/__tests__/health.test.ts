import request from 'supertest';
import { app } from '../app.js';

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('deve retornar status 200 e ok', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
