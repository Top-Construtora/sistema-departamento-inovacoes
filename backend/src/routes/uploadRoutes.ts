import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/uploadController.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

// Configuracao do multer para upload em memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Rotas protegidas
router.use(autenticar);

// Upload de logo
router.post('/logo', upload.single('file'), uploadController.uploadLogo);

// Upload de template
router.post('/template', upload.single('file'), uploadController.uploadTemplate);

// Excluir arquivo
router.delete('/', uploadController.deleteFile);

export { router as uploadRoutes };
