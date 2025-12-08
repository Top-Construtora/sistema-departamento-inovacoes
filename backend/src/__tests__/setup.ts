// Setup de testes
import dotenv from 'dotenv';

// Carrega variaveis de ambiente de teste
dotenv.config({ path: '.env.test' });

// Timeout padrao para testes
jest.setTimeout(30000);

// Limpa mocks apos cada teste
afterEach(() => {
  jest.clearAllMocks();
});
