import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { autenticar, apenasLider } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(autenticar);

// Listar usuários - apenas internos podem ver todos
router.get('/', usuarioController.listar);

// Buscar usuário por ID
router.get('/:id', usuarioController.buscarPorId);

// Atualizar usuário - apenas líderes podem atualizar perfis
router.put('/:id', apenasLider, usuarioController.atualizar);

// Alterar status (ativar/desativar) - apenas líderes
router.patch('/:id/status', apenasLider, usuarioController.alterarStatus);

// Resetar senha - apenas líderes
router.patch('/:id/resetar-senha', apenasLider, usuarioController.resetarSenha);

export { router as usuarioRoutes };
