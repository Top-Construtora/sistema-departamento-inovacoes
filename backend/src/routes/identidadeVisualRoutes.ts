import { Router } from 'express';
import { identidadeVisualController } from '../controllers/identidadeVisualController.js';
import { autenticar, apenasInternos } from '../middlewares/authMiddleware.js';

const router = Router();

// Rota publica para buscar tudo (pode ser usado em sites externos)
router.get('/', identidadeVisualController.buscarTudo);

// Rotas de leitura (publicas)
router.get('/config', identidadeVisualController.buscarIdentidade);
router.get('/logos', identidadeVisualController.listarLogos);
router.get('/cores', identidadeVisualController.listarCores);
router.get('/fontes', identidadeVisualController.listarFontes);
router.get('/templates', identidadeVisualController.listarTemplates);

// Registrar download (pode ser publico)
router.post('/templates/:id/download', identidadeVisualController.registrarDownload);

// Rotas de escrita (requerem autenticacao e perfil interno)
router.put('/config', autenticar, apenasInternos, identidadeVisualController.atualizarIdentidade);

// Logos
router.post('/logos', autenticar, apenasInternos, identidadeVisualController.criarLogo);
router.delete('/logos/:id', autenticar, apenasInternos, identidadeVisualController.excluirLogo);

// Cores
router.post('/cores', autenticar, apenasInternos, identidadeVisualController.criarCor);
router.put('/cores/:id', autenticar, apenasInternos, identidadeVisualController.atualizarCor);
router.delete('/cores/:id', autenticar, apenasInternos, identidadeVisualController.excluirCor);

// Fontes
router.post('/fontes', autenticar, apenasInternos, identidadeVisualController.criarFonte);
router.delete('/fontes/:id', autenticar, apenasInternos, identidadeVisualController.excluirFonte);

// Templates
router.post('/templates', autenticar, apenasInternos, identidadeVisualController.criarTemplate);
router.delete('/templates/:id', autenticar, apenasInternos, identidadeVisualController.excluirTemplate);

export { router as identidadeVisualRoutes };
