import { Router } from 'express';
import { projetoController } from '../controllers/projetoController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de projetos requerem autenticação e são apenas para internos
router.use(autenticar);
router.use(apenasInternos);

router.post('/', projetoController.criar);
router.get('/', projetoController.listar);
router.get('/:id', projetoController.buscarPorId);
router.put('/:id', projetoController.atualizar);
router.delete('/:id', projetoController.excluir);

export { router as projetoRoutes };
