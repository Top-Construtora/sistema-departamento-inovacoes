import { Router } from 'express';
import { portfolioController } from '../controllers/portfolioController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// GET publico para listar portfolio (pode ser acessado sem autenticacao para exibicao externa)
// Se quiser restringir, basta adicionar autenticar
router.get('/', portfolioController.listar);
router.get('/:id', portfolioController.buscarPorId);

// Rotas de escrita requerem autenticacao e perfil interno
router.post('/', autenticar, apenasInternos, portfolioController.criar);
router.put('/:id', autenticar, apenasInternos, portfolioController.atualizar);
router.delete('/:id', autenticar, apenasInternos, portfolioController.excluir);

// Versoes
router.get('/:id/versoes', portfolioController.listarVersoes);
router.post('/:id/versoes', autenticar, apenasInternos, portfolioController.criarVersao);

export { router as portfolioRoutes };
