import { Router } from 'express';
import { auditController } from '../controllers/auditController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// Apenas lideres podem ver logs de auditoria
router.use(autenticar, apenasInternos);

// Listar logs de auditoria
router.get('/', (req, res) => auditController.listar(req, res));

// Listar tipos de acoes disponiveis
router.get('/acoes', (req, res) => auditController.listarAcoes(req, res));

// Listar tipos de recursos disponiveis
router.get('/recursos', (req, res) => auditController.listarRecursos(req, res));

export { router as auditRoutes };
