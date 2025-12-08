import { Request, Response } from 'express';
import { sistemaAcessoService } from '../services/sistemaAcessoService.js';
import { auditService } from '../services/auditService.js';
import {
  CreateSistemaAcessoDTO,
  UpdateSistemaAcessoDTO,
  CreateCredencialDTO,
  UpdateCredencialDTO,
  SistemaAcessoFiltros,
  TipoSistemaAcesso,
  AmbienteCredencial,
} from '../types/sistemaAcesso.js';
import { AcaoAuditoria, TipoRecurso } from '../types/audit.js';

export class SistemaAcessoController {
  // Sistemas
  async criarSistema(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateSistemaAcessoDTO;
      const usuarioId = req.usuario!.userId;

      if (!data.nome) {
        res.status(400).json({
          success: false,
          error: 'Nome do sistema é obrigatório',
        });
        return;
      }

      if (data.tipo && !Object.values(TipoSistemaAcesso).includes(data.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoSistemaAcesso).join(', ')}`,
        });
        return;
      }

      const sistema = await sistemaAcessoService.criarSistema(data, usuarioId);

      res.status(201).json({
        success: true,
        data: sistema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar sistema';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listarSistemas(req: Request, res: Response): Promise<void> {
    try {
      const { tipo, responsavel_id } = req.query;

      const filtros: SistemaAcessoFiltros = {};

      if (tipo && Object.values(TipoSistemaAcesso).includes(tipo as TipoSistemaAcesso)) {
        filtros.tipo = tipo as TipoSistemaAcesso;
      }

      if (responsavel_id && typeof responsavel_id === 'string') {
        filtros.responsavel_id = responsavel_id;
      }

      const sistemas = await sistemaAcessoService.listarSistemas(filtros);

      res.json({
        success: true,
        data: sistemas,
        total: sistemas.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar sistemas';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarSistemaPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const sistema = await sistemaAcessoService.buscarSistemaPorId(id);

      if (!sistema) {
        res.status(404).json({
          success: false,
          error: 'Sistema não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: sistema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar sistema';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizarSistema(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateSistemaAcessoDTO;

      if (data.tipo && !Object.values(TipoSistemaAcesso).includes(data.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoSistemaAcesso).join(', ')}`,
        });
        return;
      }

      const sistema = await sistemaAcessoService.atualizarSistema(id, data);

      if (!sistema) {
        res.status(404).json({
          success: false,
          error: 'Sistema não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: sistema,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar sistema';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluirSistema(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const sistema = await sistemaAcessoService.buscarSistemaPorId(id);

      if (!sistema) {
        res.status(404).json({
          success: false,
          error: 'Sistema não encontrado',
        });
        return;
      }

      await sistemaAcessoService.excluirSistema(id);

      res.json({
        success: true,
        message: 'Sistema excluído com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir sistema';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // Credenciais
  async criarCredencial(req: Request, res: Response): Promise<void> {
    try {
      const { id: sistemaId } = req.params;
      const data = req.body as CreateCredencialDTO;
      const usuarioId = req.usuario!.userId;

      if (!data.login) {
        res.status(400).json({
          success: false,
          error: 'Login é obrigatório',
        });
        return;
      }

      if (!data.senha) {
        res.status(400).json({
          success: false,
          error: 'Senha é obrigatória',
        });
        return;
      }

      if (data.ambiente && !Object.values(AmbienteCredencial).includes(data.ambiente)) {
        res.status(400).json({
          success: false,
          error: `Ambiente inválido. Use: ${Object.values(AmbienteCredencial).join(', ')}`,
        });
        return;
      }

      const credencial = await sistemaAcessoService.criarCredencial(sistemaId, data, usuarioId);

      // Buscar nome do sistema para o log
      const sistema = await sistemaAcessoService.buscarSistemaPorId(sistemaId);
      const ip = req.ip || (req.headers['x-forwarded-for'] as string);

      // Log de auditoria para criacao de credencial
      await auditService.logCredencialCriada(
        usuarioId,
        credencial.id,
        sistemaId,
        sistema?.nome || 'Sistema desconhecido',
        ip
      );

      res.status(201).json({
        success: true,
        data: credencial,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar credencial';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listarCredenciais(req: Request, res: Response): Promise<void> {
    try {
      const { id: sistemaId } = req.params;

      const sistema = await sistemaAcessoService.buscarSistemaPorId(sistemaId);

      if (!sistema) {
        res.status(404).json({
          success: false,
          error: 'Sistema não encontrado',
        });
        return;
      }

      const credenciais = await sistemaAcessoService.listarCredenciais(sistemaId);

      res.json({
        success: true,
        data: credenciais,
        total: credenciais.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar credenciais';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async revelarSenha(req: Request, res: Response): Promise<void> {
    try {
      const { credencialId } = req.params;
      const usuarioId = req.usuario!.userId;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;

      const senha = await sistemaAcessoService.revelarSenha(credencialId, usuarioId, ipAddress);

      res.json({
        success: true,
        data: { senha },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao revelar senha';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizarCredencial(req: Request, res: Response): Promise<void> {
    try {
      const { credencialId } = req.params;
      const data = req.body as UpdateCredencialDTO;
      const usuarioId = req.usuario!.userId;

      if (data.ambiente && !Object.values(AmbienteCredencial).includes(data.ambiente)) {
        res.status(400).json({
          success: false,
          error: `Ambiente inválido. Use: ${Object.values(AmbienteCredencial).join(', ')}`,
        });
        return;
      }

      const credencial = await sistemaAcessoService.atualizarCredencial(credencialId, data, usuarioId);

      if (!credencial) {
        res.status(404).json({
          success: false,
          error: 'Credencial não encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: credencial,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar credencial';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluirCredencial(req: Request, res: Response): Promise<void> {
    try {
      const { credencialId } = req.params;
      const usuarioId = req.usuario!.userId;

      const credencial = await sistemaAcessoService.buscarCredencialPorId(credencialId);

      if (!credencial) {
        res.status(404).json({
          success: false,
          error: 'Credencial não encontrada',
        });
        return;
      }

      await sistemaAcessoService.excluirCredencial(credencialId, usuarioId);

      // Log de auditoria para exclusao de credencial
      const ip = req.ip || (req.headers['x-forwarded-for'] as string);
      await auditService.logCredencialExcluida(usuarioId, credencialId, ip);

      res.json({
        success: true,
        message: 'Credencial excluída com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir credencial';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async listarLogsCredencial(req: Request, res: Response): Promise<void> {
    try {
      const { credencialId } = req.params;

      const logs = await sistemaAcessoService.listarLogsCredencial(credencialId);

      res.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar logs';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}

export const sistemaAcessoController = new SistemaAcessoController();
