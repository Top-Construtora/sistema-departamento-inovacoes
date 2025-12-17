import { Request, Response } from 'express';
import { notaService } from '../services/notaService.js';
import { CreateNotaDTO, UpdateNotaDTO } from '../types/nota.js';

export class NotaController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { offset, limit } = req.query;

      const offsetNum = parseInt(offset as string) || 0;
      const limitNum = parseInt(limit as string) || 100;

      const notas = await notaService.listar(offsetNum, limitNum);

      res.json({
        success: true,
        data: notas,
        total: notas.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar notas';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateNotaDTO;

      if (!data.conteudo || data.conteudo.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Conteudo da nota e obrigatorio',
        });
        return;
      }

      const nota = await notaService.criar(data, req.usuario!.userId);

      res.status(201).json({
        success: true,
        data: nota,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar nota';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateNotaDTO;

      if (!data.conteudo || data.conteudo.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Conteudo da nota e obrigatorio',
        });
        return;
      }

      const nota = await notaService.atualizar(id, data, req.usuario!.userId);

      if (!nota) {
        res.status(404).json({
          success: false,
          error: 'Nota nao encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: nota,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar nota';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluir(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const sucesso = await notaService.excluir(id, req.usuario!.userId);

      if (!sucesso) {
        res.status(404).json({
          success: false,
          error: 'Nota nao encontrada',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Nota excluida com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir nota';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async uploadAnexo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.body.url || !req.body.nome || !req.body.tipo || !req.body.tamanho) {
        res.status(400).json({
          success: false,
          error: 'Dados do arquivo sao obrigatorios',
        });
        return;
      }

      const anexo = await notaService.adicionarAnexo(id, {
        nome: req.body.nome,
        tipo: req.body.tipo,
        tamanho: parseInt(req.body.tamanho),
        url: req.body.url,
      });

      res.status(201).json({
        success: true,
        data: anexo,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer upload';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
}

export const notaController = new NotaController();
