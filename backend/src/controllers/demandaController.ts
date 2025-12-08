import { Request, Response } from 'express';
import { demandaService } from '../services/demandaService.js';
import {
  CreateDemandaDTO,
  UpdateDemandaDTO,
  DemandaFiltros,
  TipoDemanda,
  PrioridadeDemanda,
  StatusDemanda,
} from '../types/demanda.js';

export class DemandaController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateDemandaDTO;

      if (!data.titulo) {
        res.status(400).json({
          success: false,
          error: 'Título da demanda é obrigatório',
        });
        return;
      }

      // Usar o usuário logado como solicitante se não fornecido
      if (!data.solicitante_id && req.usuario) {
        data.solicitante_id = req.usuario.userId;
      }

      if (!data.solicitante_id) {
        res.status(400).json({
          success: false,
          error: 'Solicitante é obrigatório',
        });
        return;
      }

      // Validar tipo
      if (data.tipo && !Object.values(TipoDemanda).includes(data.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoDemanda).join(', ')}`,
        });
        return;
      }

      // Validar prioridade
      if (data.prioridade && !Object.values(PrioridadeDemanda).includes(data.prioridade)) {
        res.status(400).json({
          success: false,
          error: `Prioridade inválida. Use: ${Object.values(PrioridadeDemanda).join(', ')}`,
        });
        return;
      }

      // Validar status
      if (data.status && !Object.values(StatusDemanda).includes(data.status)) {
        res.status(400).json({
          success: false,
          error: `Status inválido. Use: ${Object.values(StatusDemanda).join(', ')}`,
        });
        return;
      }

      const demanda = await demandaService.criar(data);

      res.status(201).json({
        success: true,
        data: demanda,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar demanda';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { status, prioridade, responsavel_id, projeto_id, tipo } = req.query;

      const filtros: DemandaFiltros = {};

      if (status && Object.values(StatusDemanda).includes(status as StatusDemanda)) {
        filtros.status = status as StatusDemanda;
      }

      if (prioridade && Object.values(PrioridadeDemanda).includes(prioridade as PrioridadeDemanda)) {
        filtros.prioridade = prioridade as PrioridadeDemanda;
      }

      if (responsavel_id && typeof responsavel_id === 'string') {
        filtros.responsavel_id = responsavel_id;
      }

      if (projeto_id && typeof projeto_id === 'string') {
        filtros.projeto_id = projeto_id;
      }

      if (tipo && Object.values(TipoDemanda).includes(tipo as TipoDemanda)) {
        filtros.tipo = tipo as TipoDemanda;
      }

      const demandas = await demandaService.listar(filtros);

      res.json({
        success: true,
        data: demandas,
        total: demandas.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar demandas';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const demanda = await demandaService.buscarPorId(id);

      if (!demanda) {
        res.status(404).json({
          success: false,
          error: 'Demanda não encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: demanda,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar demanda';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateDemandaDTO;

      // Validar tipo se fornecido
      if (data.tipo && !Object.values(TipoDemanda).includes(data.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoDemanda).join(', ')}`,
        });
        return;
      }

      // Validar prioridade se fornecida
      if (data.prioridade && !Object.values(PrioridadeDemanda).includes(data.prioridade)) {
        res.status(400).json({
          success: false,
          error: `Prioridade inválida. Use: ${Object.values(PrioridadeDemanda).join(', ')}`,
        });
        return;
      }

      // Validar status se fornecido
      if (data.status && !Object.values(StatusDemanda).includes(data.status)) {
        res.status(400).json({
          success: false,
          error: `Status inválido. Use: ${Object.values(StatusDemanda).join(', ')}`,
        });
        return;
      }

      const demanda = await demandaService.atualizar(id, data);

      if (!demanda) {
        res.status(404).json({
          success: false,
          error: 'Demanda não encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: demanda,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar demanda';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizarStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status é obrigatório',
        });
        return;
      }

      if (!Object.values(StatusDemanda).includes(status)) {
        res.status(400).json({
          success: false,
          error: `Status inválido. Use: ${Object.values(StatusDemanda).join(', ')}`,
        });
        return;
      }

      const demanda = await demandaService.atualizarStatus(id, status);

      if (!demanda) {
        res.status(404).json({
          success: false,
          error: 'Demanda não encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: demanda,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluir(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const demanda = await demandaService.buscarPorId(id);

      if (!demanda) {
        res.status(404).json({
          success: false,
          error: 'Demanda não encontrada',
        });
        return;
      }

      await demandaService.excluir(id);

      res.json({
        success: true,
        message: 'Demanda excluída com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir demanda';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}

export const demandaController = new DemandaController();
