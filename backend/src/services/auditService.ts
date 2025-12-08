import { supabase } from '../config/database.js';
import {
  AuditLog,
  CreateAuditLogDTO,
  AuditLogFiltros,
  AcaoAuditoria,
  TipoRecurso,
} from '../types/audit.js';

class AuditService {
  async registrar(data: CreateAuditLogDTO): Promise<AuditLog | null> {
    try {
      const { data: log, error } = await supabase
        .from('audit_logs')
        .insert({
          usuario_id: data.usuario_id || null,
          usuario_email: data.usuario_email,
          acao: data.acao,
          recurso_tipo: data.recurso_tipo,
          recurso_id: data.recurso_id || null,
          recurso_nome: data.recurso_nome || null,
          detalhes: data.detalhes || null,
          ip_address: data.ip_address || null,
          user_agent: data.user_agent || null,
        })
        .select()
        .single();

      if (error) {
        console.error('[AUDIT] Erro ao registrar log:', error.message);
        return null;
      }

      return log as AuditLog;
    } catch (error) {
      console.error('[AUDIT] Erro ao registrar log:', error);
      return null;
    }
  }

  async listar(filtros: AuditLogFiltros = {}, limite: number = 100): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('data_hora', { ascending: false })
      .limit(limite);

    if (filtros.usuario_id) {
      query = query.eq('usuario_id', filtros.usuario_id);
    }

    if (filtros.acao) {
      query = query.eq('acao', filtros.acao);
    }

    if (filtros.recurso_tipo) {
      query = query.eq('recurso_tipo', filtros.recurso_tipo);
    }

    if (filtros.recurso_id) {
      query = query.eq('recurso_id', filtros.recurso_id);
    }

    if (filtros.data_inicio) {
      query = query.gte('data_hora', filtros.data_inicio);
    }

    if (filtros.data_fim) {
      query = query.lte('data_hora', filtros.data_fim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AUDIT] Erro ao listar logs:', error.message);
      return [];
    }

    return (data || []) as AuditLog[];
  }

  // Helper methods para facilitar o registro de logs comuns
  async logLogin(
    usuarioId: string,
    usuarioEmail: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.registrar({
      usuario_id: usuarioId,
      usuario_email: usuarioEmail,
      acao: AcaoAuditoria.LOGIN,
      recurso_tipo: TipoRecurso.USUARIO,
      recurso_id: usuarioId,
      ip_address: ip,
      user_agent: userAgent,
    });
  }

  async logLoginFalhou(
    email: string,
    motivo: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.registrar({
      usuario_email: email,
      acao: AcaoAuditoria.LOGIN_FALHOU,
      recurso_tipo: TipoRecurso.USUARIO,
      detalhes: { motivo },
      ip_address: ip,
      user_agent: userAgent,
    });
  }

  async logChamadoStatusAlterado(
    usuarioId: string,
    chamadoId: string,
    statusAnterior: string,
    statusNovo: string,
    ip?: string
  ): Promise<void> {
    await this.registrar({
      usuario_id: usuarioId,
      acao: AcaoAuditoria.CHAMADO_STATUS_ALTERAR,
      recurso_tipo: TipoRecurso.CHAMADO,
      recurso_id: chamadoId,
      detalhes: { status_anterior: statusAnterior, status_novo: statusNovo },
      ip_address: ip,
    });
  }

  async logCredencialVisualizada(
    usuarioId: string,
    credencialId: string,
    sistemaId: string,
    sistemaNome: string,
    ip?: string
  ): Promise<void> {
    await this.registrar({
      usuario_id: usuarioId,
      acao: AcaoAuditoria.CREDENCIAL_VISUALIZAR_SENHA,
      recurso_tipo: TipoRecurso.CREDENCIAL,
      recurso_id: credencialId,
      recurso_nome: sistemaNome,
      detalhes: { sistema_id: sistemaId },
      ip_address: ip,
    });
  }

  async logCredencialCriada(
    usuarioId: string,
    credencialId: string,
    sistemaId: string,
    sistemaNome: string,
    ip?: string
  ): Promise<void> {
    await this.registrar({
      usuario_id: usuarioId,
      acao: AcaoAuditoria.CREDENCIAL_CRIAR,
      recurso_tipo: TipoRecurso.CREDENCIAL,
      recurso_id: credencialId,
      recurso_nome: sistemaNome,
      detalhes: { sistema_id: sistemaId },
      ip_address: ip,
    });
  }

  async logCredencialExcluida(
    usuarioId: string,
    credencialId: string,
    ip?: string
  ): Promise<void> {
    await this.registrar({
      usuario_id: usuarioId,
      acao: AcaoAuditoria.CREDENCIAL_EXCLUIR,
      recurso_tipo: TipoRecurso.CREDENCIAL,
      recurso_id: credencialId,
      ip_address: ip,
    });
  }

  async logGenerico(
    usuarioId: string,
    acao: AcaoAuditoria,
    recursoTipo: TipoRecurso,
    recursoId?: string,
    recursoNome?: string,
    detalhes?: Record<string, unknown>,
    ip?: string
  ): Promise<void> {
    await this.registrar({
      usuario_id: usuarioId,
      acao,
      recurso_tipo: recursoTipo,
      recurso_id: recursoId,
      recurso_nome: recursoNome,
      detalhes,
      ip_address: ip,
    });
  }
}

export const auditService = new AuditService();
