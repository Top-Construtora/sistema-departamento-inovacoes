import { Router } from 'express';
import { healthRoutes } from './healthRoutes.js';
import { authRoutes } from './authRoutes.js';
import { usuarioRoutes } from './usuarioRoutes.js';
import { projetoRoutes } from './projetoRoutes.js';
import { demandaRoutes } from './demandaRoutes.js';
import { chamadoRoutes } from './chamadoRoutes.js';
import { portfolioRoutes } from './portfolioRoutes.js';
import { sistemaAcessoRoutes } from './sistemaAcessoRoutes.js';
import { identidadeVisualRoutes } from './identidadeVisualRoutes.js';
import { metricsRoutes } from './metricsRoutes.js';
import { auditRoutes } from './auditRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/projetos', projetoRoutes);
router.use('/demandas', demandaRoutes);
router.use('/chamados', chamadoRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/sistemas-acesso', sistemaAcessoRoutes);
router.use('/identidade-visual', identidadeVisualRoutes);
router.use('/metrics', metricsRoutes);
router.use('/audit', auditRoutes);

export { router };
