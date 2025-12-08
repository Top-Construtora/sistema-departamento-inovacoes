import { Router } from 'express';
import { sistemaAcessoController } from '../controllers/sistemaAcessoController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas requerem autenticacao e perfil interno
router.use(autenticar);
router.use(apenasInternos);

// Sistemas de acesso
router.post('/', sistemaAcessoController.criarSistema);
router.get('/', sistemaAcessoController.listarSistemas);
router.get('/:id', sistemaAcessoController.buscarSistemaPorId);
router.put('/:id', sistemaAcessoController.atualizarSistema);
router.delete('/:id', sistemaAcessoController.excluirSistema);

// Credenciais
router.post('/:id/credenciais', sistemaAcessoController.criarCredencial);
router.get('/:id/credenciais', sistemaAcessoController.listarCredenciais);

// Operacoes em credenciais especificas
router.get('/credenciais/:credencialId/senha', sistemaAcessoController.revelarSenha);
router.put('/credenciais/:credencialId', sistemaAcessoController.atualizarCredencial);
router.delete('/credenciais/:credencialId', sistemaAcessoController.excluirCredencial);
router.get('/credenciais/:credencialId/logs', sistemaAcessoController.listarLogsCredencial);

export { router as sistemaAcessoRoutes };
