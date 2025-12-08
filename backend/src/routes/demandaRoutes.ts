import { Router } from 'express';
import { demandaController } from '../controllers/demandaController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de demandas requerem autenticação e são apenas para internos
router.use(autenticar);
router.use(apenasInternos);

router.post('/', demandaController.criar);
router.get('/', demandaController.listar);
router.get('/:id', demandaController.buscarPorId);
router.put('/:id', demandaController.atualizar);
router.patch('/:id/status', demandaController.atualizarStatus);
router.delete('/:id', demandaController.excluir);

export { router as demandaRoutes };
