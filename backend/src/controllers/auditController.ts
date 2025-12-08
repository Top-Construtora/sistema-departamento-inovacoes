import { Request, Response } from 'express';
import { auditService } from '../services/auditService.js';
import { AuditLogFiltros, AcaoAuditoria, TipoRecurso } from '../types/audit.js';

export class AuditController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id, acao, recurso_tipo, recurso_id, data_inicio, data_fim, limite } = req.query;

      const filtros: AuditLogFiltros = {};

      if (usuario_id && typeof usuario_id === 'string') {
        filtros.usuario_id = usuario_id;
      }

      if (acao && Object.values(AcaoAuditoria).includes(acao as AcaoAuditoria)) {
        filtros.acao = acao as AcaoAuditoria;
      }

      if (recurso_tipo && Object.values(TipoRecurso).includes(recurso_tipo as TipoRecurso)) {
        filtros.recurso_tipo = recurso_tipo as TipoRecurso;
      }

      if (recurso_id && typeof recurso_id === 'string') {
        filtros.recurso_id = recurso_id;
      }

      if (data_inicio && typeof data_inicio === 'string') {
        filtros.data_inicio = data_inicio;
      }

      if (data_fim && typeof data_fim === 'string') {
        filtros.data_fim = data_fim;
      }

      const limiteNumero = limite ? parseInt(limite as string) : 100;

      const logs = await auditService.listar(filtros, limiteNumero);

      res.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar logs de auditoria';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async listarAcoes(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: Object.values(AcaoAuditoria),
    });
  }

  async listarRecursos(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: Object.values(TipoRecurso),
    });
  }
}

export const auditController = new AuditController();
