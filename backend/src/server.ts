import { app } from './app.js';
import { env } from './config/env.js';

async function bootstrap(): Promise<void> {
  app.listen(env.port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${env.port}`);
    console.log(`📍 Health check: http://localhost:${env.port}/api/health`);
  });
}

bootstrap();
