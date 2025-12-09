import { Request, Response } from 'express';
import { uploadService } from '../services/uploadService.js';

export const uploadController = {
  async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado',
        });
      }

      const { buffer, originalname, mimetype } = req.file;

      // Valida o tipo de arquivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de arquivo não permitido. Use PNG, JPG, SVG ou WebP.',
        });
      }

      // Valida o tamanho (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
        });
      }

      const url = await uploadService.uploadFile(buffer, originalname, mimetype, 'logos');

      return res.status(200).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload',
      });
    }
  },

  async uploadTemplate(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado',
        });
      }

      const { buffer, originalname, mimetype } = req.file;

      // Valida o tamanho (max 10MB para templates)
      const maxSize = 10 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo: 10MB.',
        });
      }

      const url = await uploadService.uploadFile(buffer, originalname, mimetype, 'templates');

      return res.status(200).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload',
      });
    }
  },

  async deleteFile(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL do arquivo não informada',
        });
      }

      await uploadService.deleteFile(url);

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao excluir arquivo',
      });
    }
  },
};
