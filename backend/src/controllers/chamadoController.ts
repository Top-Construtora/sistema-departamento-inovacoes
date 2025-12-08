import { Request, Response } from 'express';
import { chamadoService } from '../services/chamadoService.js';
import { usuarioService } from '../services/usuarioService.js';
import { auditService } from '../services/auditService.js';
import {
  CreateChamadoDTO,
  UpdateChamadoDTO,
  ChamadoFiltros,
  CategoriaChamado,
  StatusChamado,
  CreateComentarioDTO,
  AvaliacaoDTO,
  PrioridadeDemanda,
} from '../types/chamado.js';
import { PerfilUsuario } from '../types/usuario.js';
import { AcaoAuditoria, TipoRecurso } from '../types/audit.js';

export class ChamadoController {
  private isInterno(perfil: PerfilUsuario): boolean {
    return perfil === PerfilUsuario.LIDER || perfil === PerfilUsuario.ANALISTA;
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateChamadoDTO;

      if (!data.titulo || !data.descricao) {
        res.status(400).json({
          success: false,
          error: 'Título e descrição são obrigatórios',
        });
        return;
      }

      if (data.categoria && !Object.values(CategoriaChamado).includes(data.categoria)) {
        res.status(400).json({
          success: false,
          error: `Categoria inválida. Use: ${Object.values(CategoriaChamado).join(', ')}`,
        });
        return;
      }

      // Buscar dados do usuário para pegar o setor
      const usuario = await usuarioService.buscarPorId(req.usuario!.userId);
      const setor = usuario?.setor || undefined;

      const chamado = await chamadoService.criar(data, req.usuario!.userId, setor);

      // Log de auditoria para criacao de chamado
      const ip = req.ip || (req.headers['x-forwarded-for'] as string);
      await auditService.logGenerico(
        req.usuario!.userId,
        AcaoAuditoria.CHAMADO_CRIAR,
        TipoRecurso.CHAMADO,
        chamado.id,
        chamado.titulo,
        { categoria: chamado.categoria, prioridade: chamado.prioridade },
        ip
      );

      res.status(201).json({
        success: true,
        data: chamado,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar chamado';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { status, categoria, prioridade, responsavel_id } = req.query;
      const usuario = req.usuario!;
      const isInterno = this.isInterno(usuario.perfil);

      const filtros: ChamadoFiltros = {};

      if (status && Object.values(StatusChamado).includes(status as StatusChamado)) {
        filtros.status = status as StatusChamado;
      }

      if (categoria && Object.values(CategoriaChamado).includes(categoria as CategoriaChamado)) {
        filtros.categoria = categoria as CategoriaChamado;
      }

      if (prioridade && Object.values(PrioridadeDemanda).includes(prioridade as PrioridadeDemanda)) {
        filtros.prioridade = prioridade as PrioridadeDemanda;
      }

      if (responsavel_id && typeof responsavel_id === 'string' && isInterno) {
        filtros.responsavel_id = responsavel_id;
      }

      // Externos só veem seus próprios chamados
      const chamados = await chamadoService.listar(
        filtros,
        usuario.userId,
        !isInterno
      );

      res.json({
        success: true,
        data: chamados,
        total: chamados.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar chamados';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.usuario!;
      const isInterno = this.isInterno(usuario.perfil);

      const chamado = await chamadoService.buscarPorId(id, true);

      if (!chamado) {
        res.status(404).json({
          success: false,
          error: 'Chamado não encontrado',
        });
        return;
      }

      // Verificar permissão: externos só veem seus próprios chamados
      if (!isInterno && chamado.solicitante_id !== usuario.userId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
        });
        return;
      }

      // Se for externo, filtrar comentários internos
      if (!isInterno && chamado.comentarios) {
        chamado.comentarios = chamado.comentarios.filter((c) => !c.interno);
      }

      res.json({
        success: true,
        data: chamado,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar chamado';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateChamadoDTO;
      const usuario = req.usuario!;
      const isInterno = this.isInterno(usuario.perfil);

      // Apenas internos podem atualizar chamados
      if (!isInterno) {
        res.status(403).json({
          success: false,
          error: 'Apenas usuários internos podem atualizar chamados',
        });
        return;
      }

      if (data.categoria && !Object.values(CategoriaChamado).includes(data.categoria)) {
        res.status(400).json({
          success: false,
          error: `Categoria inválida. Use: ${Object.values(CategoriaChamado).join(', ')}`,
        });
        return;
      }

      if (data.prioridade && !Object.values(PrioridadeDemanda).includes(data.prioridade)) {
        res.status(400).json({
          success: false,
          error: `Prioridade inválida. Use: ${Object.values(PrioridadeDemanda).join(', ')}`,
        });
        return;
      }

      const chamado = await chamadoService.atualizar(id, data);

      if (!chamado) {
        res.status(404).json({
          success: false,
          error: 'Chamado não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: chamado,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar chamado';
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
      const usuario = req.usuario!;
      const isInterno = this.isInterno(usuario.perfil);
      const ip = req.ip || (req.headers['x-forwarded-for'] as string);

      // Apenas internos podem alterar status (exceto cancelar que o solicitante pode fazer)
      const chamadoAtual = await chamadoService.buscarPorId(id, false);

      if (!chamadoAtual) {
        res.status(404).json({
          success: false,
          error: 'Chamado não encontrado',
        });
        return;
      }

      // Externos só podem cancelar seus próprios chamados
      if (!isInterno) {
        if (chamadoAtual.solicitante_id !== usuario.userId) {
          res.status(403).json({
            success: false,
            error: 'Acesso negado',
          });
          return;
        }

        if (status !== StatusChamado.CANCELADO) {
          res.status(403).json({
            success: false,
            error: 'Você só pode cancelar seu próprio chamado',
          });
          return;
        }
      }

      if (!status || !Object.values(StatusChamado).includes(status)) {
        res.status(400).json({
          success: false,
          error: `Status inválido. Use: ${Object.values(StatusChamado).join(', ')}`,
        });
        return;
      }

      const statusAnterior = chamadoAtual.status;
      const chamado = await chamadoService.atualizarStatus(id, status);

      // Log de auditoria para mudanca de status
      await auditService.logChamadoStatusAlterado(
        usuario.userId,
        id,
        statusAnterior,
        status,
        ip
      );

      res.json({
        success: true,
        data: chamado,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async adicionarComentario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as CreateComentarioDTO;
      const usuario = req.usuario!;
      const isInterno = this.isInterno(usuario.perfil);

      if (!data.mensagem) {
        res.status(400).json({
          success: false,
          error: 'Mensagem é obrigatória',
        });
        return;
      }

      // Verificar se chamado existe
      const chamado = await chamadoService.buscarPorId(id, false);

      if (!chamado) {
        res.status(404).json({
          success: false,
          error: 'Chamado não encontrado',
        });
        return;
      }

      // Externos só podem comentar em seus próprios chamados
      if (!isInterno && chamado.solicitante_id !== usuario.userId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
        });
        return;
      }

      // Externos não podem criar comentários internos
      const interno = isInterno ? (data.interno || false) : false;

      const comentario = await chamadoService.adicionarComentario(
        id,
        usuario.userId,
        { mensagem: data.mensagem, interno }
      );

      res.status(201).json({
        success: true,
        data: comentario,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar comentário';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async avaliar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as AvaliacaoDTO;
      const usuario = req.usuario!;

      // Verificar se chamado existe e pertence ao usuário
      const chamado = await chamadoService.buscarPorId(id, false);

      if (!chamado) {
        res.status(404).json({
          success: false,
          error: 'Chamado não encontrado',
        });
        return;
      }

      // Apenas o solicitante pode avaliar
      if (chamado.solicitante_id !== usuario.userId) {
        res.status(403).json({
          success: false,
          error: 'Apenas o solicitante pode avaliar o chamado',
        });
        return;
      }

      if (!data.nota || data.nota < 1 || data.nota > 5) {
        res.status(400).json({
          success: false,
          error: 'Nota deve ser entre 1 e 5',
        });
        return;
      }

      const chamadoAvaliado = await chamadoService.avaliar(id, data);

      res.json({
        success: true,
        data: chamadoAvaliado,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao avaliar chamado';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
}

export const chamadoController = new ChamadoController();
