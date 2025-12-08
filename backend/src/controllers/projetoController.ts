import { Request, Response } from 'express';
import { projetoService } from '../services/projetoService.js';
import {
  CreateProjetoDTO,
  UpdateProjetoDTO,
  ProjetoFiltros,
  TipoProjeto,
  StatusProjeto,
  NivelRisco,
} from '../types/projeto.js';

export class ProjetoController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateProjetoDTO;

      if (!data.nome) {
        res.status(400).json({
          success: false,
          error: 'Nome do projeto é obrigatório',
        });
        return;
      }

      if (!data.lider_id) {
        res.status(400).json({
          success: false,
          error: 'Líder do projeto é obrigatório',
        });
        return;
      }

      // Validar tipo
      if (data.tipo && !Object.values(TipoProjeto).includes(data.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoProjeto).join(', ')}`,
        });
        return;
      }

      // Validar status
      if (data.status && !Object.values(StatusProjeto).includes(data.status)) {
        res.status(400).json({
          success: false,
          error: `Status inválido. Use: ${Object.values(StatusProjeto).join(', ')}`,
        });
        return;
      }

      // Validar risco
      if (data.risco && !Object.values(NivelRisco).includes(data.risco)) {
        res.status(400).json({
          success: false,
          error: `Risco inválido. Use: ${Object.values(NivelRisco).join(', ')}`,
        });
        return;
      }

      const projeto = await projetoService.criar(data);

      res.status(201).json({
        success: true,
        data: projeto,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar projeto';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { status, lider_id, tipo, tag } = req.query;

      const filtros: ProjetoFiltros = {};

      if (status && Object.values(StatusProjeto).includes(status as StatusProjeto)) {
        filtros.status = status as StatusProjeto;
      }

      if (lider_id && typeof lider_id === 'string') {
        filtros.lider_id = lider_id;
      }

      if (tipo && Object.values(TipoProjeto).includes(tipo as TipoProjeto)) {
        filtros.tipo = tipo as TipoProjeto;
      }

      if (tag && typeof tag === 'string') {
        filtros.tag = tag;
      }

      const projetos = await projetoService.listar(filtros);

      res.json({
        success: true,
        data: projetos,
        total: projetos.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar projetos';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const projeto = await projetoService.buscarPorId(id);

      if (!projeto) {
        res.status(404).json({
          success: false,
          error: 'Projeto não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: projeto,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar projeto';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateProjetoDTO;

      // Validar tipo se fornecido
      if (data.tipo && !Object.values(TipoProjeto).includes(data.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoProjeto).join(', ')}`,
        });
        return;
      }

      // Validar status se fornecido
      if (data.status && !Object.values(StatusProjeto).includes(data.status)) {
        res.status(400).json({
          success: false,
          error: `Status inválido. Use: ${Object.values(StatusProjeto).join(', ')}`,
        });
        return;
      }

      // Validar risco se fornecido
      if (data.risco && !Object.values(NivelRisco).includes(data.risco)) {
        res.status(400).json({
          success: false,
          error: `Risco inválido. Use: ${Object.values(NivelRisco).join(', ')}`,
        });
        return;
      }

      const projeto = await projetoService.atualizar(id, data);

      if (!projeto) {
        res.status(404).json({
          success: false,
          error: 'Projeto não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: projeto,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar projeto';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluir(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const projeto = await projetoService.buscarPorId(id);

      if (!projeto) {
        res.status(404).json({
          success: false,
          error: 'Projeto não encontrado',
        });
        return;
      }

      await projetoService.excluir(id);

      res.json({
        success: true,
        message: 'Projeto excluído com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir projeto';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}

export const projetoController = new ProjetoController();
