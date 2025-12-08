import { Router } from 'express';
import { metricsController } from '../controllers/metricsController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de métricas requerem autenticação e são apenas para usuários internos
router.use(autenticar, apenasInternos);

// Resumo geral (KPIs principais)
router.get('/resumo-geral', metricsController.getResumoGeral);

// Chamados
router.get('/chamados-por-setor', metricsController.getChamadosPorSetor);
router.get('/chamados-por-categoria', metricsController.getChamadosPorCategoria);
router.get('/chamados-por-status', metricsController.getChamadosPorStatus);
router.get('/tempo-medio-resolucao-chamados', metricsController.getTempoMedioResolucao);

// Projetos
router.get('/projetos-por-status', metricsController.getProjetosPorStatus);
router.get('/projetos-por-tipo', metricsController.getProjetosPorTipo);
router.get('/top-projetos', metricsController.getTopProjetos);

// Demandas
router.get('/demandas-por-responsavel', metricsController.getDemandasPorResponsavel);
router.get('/demandas-por-prioridade', metricsController.getDemandasPorPrioridade);

// Evolução temporal
router.get('/evolucao-mensal', metricsController.getEvolucaoMensal);

export { router as metricsRoutes };
