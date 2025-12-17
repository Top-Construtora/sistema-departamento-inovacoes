import { Router } from 'express';
import { notaController } from '../controllers/notaController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de notas requerem autenticacao e usuarios internos
router.use(autenticar);
router.use(apenasInternos);

// Listar notas
router.get('/', notaController.listar.bind(notaController));

// Criar nota
router.post('/', notaController.criar.bind(notaController));

// Atualizar nota
router.put('/:id', notaController.atualizar.bind(notaController));

// Excluir nota
router.delete('/:id', notaController.excluir.bind(notaController));

// Upload de anexo
router.post('/:id/anexos', notaController.uploadAnexo.bind(notaController));

export { router as notaRoutes };
