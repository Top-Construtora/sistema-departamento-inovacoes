import { Router } from 'express';
import { chamadoController } from '../controllers/chamadoController.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de chamados requerem autenticação
// Mas tanto internos quanto externos podem acessar (com permissões diferentes)
router.use(autenticar);

// CRUD de chamados
router.post('/', chamadoController.criar.bind(chamadoController));
router.get('/', chamadoController.listar.bind(chamadoController));
router.get('/:id', chamadoController.buscarPorId.bind(chamadoController));
router.put('/:id', chamadoController.atualizar.bind(chamadoController));

// Atualização de status
router.patch('/:id/status', chamadoController.atualizarStatus.bind(chamadoController));

// Comentários
router.post('/:id/comentarios', chamadoController.adicionarComentario.bind(chamadoController));

// Avaliação
router.post('/:id/avaliacao', chamadoController.avaliar.bind(chamadoController));

export { router as chamadoRoutes };
