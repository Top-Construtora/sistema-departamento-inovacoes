import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', authController.registrar);
router.post('/login', authController.login);
router.get('/me', autenticar, authController.me);
router.post('/definir-senha', autenticar, authController.definirNovaSenha);

export { router as authRoutes };
