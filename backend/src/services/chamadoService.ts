import { supabase } from '../config/database.js';
import {
  Chamado,
  ChamadoComRelacoes,
  ChamadoComentario,
  CreateChamadoDTO,
  UpdateChamadoDTO,
  ChamadoFiltros,
  StatusChamado,
  CreateComentarioDTO,
  AvaliacaoDTO,
} from '../types/chamado.js';

export class ChamadoService {
  async criar(data: CreateChamadoDTO, solicitanteId: string, setor?: string): Promise<ChamadoComRelacoes> {
    const { data: chamado, error } = await supabase
      .from('chamados')
      .insert({
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria || 'OUTROS',
        prioridade: data.prioridade || 'MEDIA',
        solicitante_id: solicitanteId,
        setor_solicitante: data.setor_solicitante || setor || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar chamado: ${error.message}`);
    }

    return this.buscarPorId(chamado.id) as Promise<ChamadoComRelacoes>;
  }

  async listar(filtros?: ChamadoFiltros, usuarioId?: string, apenasPropriosChamados?: boolean): Promise<ChamadoComRelacoes[]> {
    let query = supabase
      .from('chamados')
      .select(`
        *,
        solicitante:usuarios!chamados_solicitante_id_fkey(id, nome, email, perfil, setor),
        responsavel:usuarios!chamados_responsavel_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', filtros?.ativo ?? true)
      .order('data_abertura', { ascending: false });

    // Se for usuário externo, mostrar apenas seus próprios chamados
    if (apenasPropriosChamados && usuarioId) {
      query = query.eq('solicitante_id', usuarioId);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.categoria) {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros?.prioridade) {
      query = query.eq('prioridade', filtros.prioridade);
    }

    if (filtros?.solicitante_id) {
      query = query.eq('solicitante_id', filtros.solicitante_id);
    }

    if (filtros?.responsavel_id) {
      query = query.eq('responsavel_id', filtros.responsavel_id);
    }

    const { data: chamados, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar chamados: ${error.message}`);
    }

    return (chamados || []) as ChamadoComRelacoes[];
  }

  async buscarPorId(id: string, incluirComentarios = true): Promise<ChamadoComRelacoes | null> {
    const { data: chamado, error } = await supabase
      .from('chamados')
      .select(`
        *,
        solicitante:usuarios!chamados_solicitante_id_fkey(id, nome, email, perfil, setor),
        responsavel:usuarios!chamados_responsavel_id_fkey(id, nome, email, perfil)
      `)
      .eq('id', id)
      .single();

    if (error || !chamado) {
      return null;
    }

    let comentarios: ChamadoComentario[] = [];

    if (incluirComentarios) {
      const { data: comentariosData } = await supabase
        .from('chamado_comentarios')
        .select(`
          *,
          autor:usuarios(id, nome, email, perfil)
        `)
        .eq('chamado_id', id)
        .order('data', { ascending: true });

      comentarios = (comentariosData || []) as ChamadoComentario[];
    }

    return { ...chamado, comentarios } as ChamadoComRelacoes;
  }

  async buscarPorProtocolo(protocolo: string): Promise<ChamadoComRelacoes | null> {
    const { data: chamado, error } = await supabase
      .from('chamados')
      .select(`
        *,
        solicitante:usuarios!chamados_solicitante_id_fkey(id, nome, email, perfil, setor),
        responsavel:usuarios!chamados_responsavel_id_fkey(id, nome, email, perfil)
      `)
      .eq('numero_protocolo', protocolo)
      .single();

    if (error || !chamado) {
      return null;
    }

    return chamado as ChamadoComRelacoes;
  }

  async atualizar(id: string, data: UpdateChamadoDTO): Promise<ChamadoComRelacoes | null> {
    const chamadoExistente = await this.buscarPorId(id, false);
    if (!chamadoExistente) {
      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.prioridade !== undefined) updateData.prioridade = data.prioridade;
    if (data.responsavel_id !== undefined) updateData.responsavel_id = data.responsavel_id;
    if (data.setor_solicitante !== undefined) updateData.setor_solicitante = data.setor_solicitante;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('chamados')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar chamado: ${error.message}`);
      }
    }

    return this.buscarPorId(id);
  }

  async atualizarStatus(id: string, status: StatusChamado): Promise<ChamadoComRelacoes | null> {
    const chamadoExistente = await this.buscarPorId(id, false);
    if (!chamadoExistente) {
      return null;
    }

    const updateData: Record<string, unknown> = { status };

    // Se status for CONCLUIDO ou CANCELADO, definir data_fechamento
    if (status === StatusChamado.CONCLUIDO || status === StatusChamado.CANCELADO) {
      updateData.data_fechamento = new Date().toISOString();
    }

    // Se reabrir, limpar data_fechamento
    if (status === StatusChamado.REABERTO) {
      updateData.data_fechamento = null;
    }

    const { error } = await supabase
      .from('chamados')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }

    return this.buscarPorId(id);
  }

  async adicionarComentario(chamadoId: string, autorId: string, data: CreateComentarioDTO): Promise<ChamadoComentario> {
    const { data: comentario, error } = await supabase
      .from('chamado_comentarios')
      .insert({
        chamado_id: chamadoId,
        autor_id: autorId,
        mensagem: data.mensagem,
        interno: data.interno || false,
      })
      .select(`
        *,
        autor:usuarios(id, nome, email, perfil)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar comentário: ${error.message}`);
    }

    return comentario as ChamadoComentario;
  }

  async listarComentarios(chamadoId: string, incluirInternos = true): Promise<ChamadoComentario[]> {
    let query = supabase
      .from('chamado_comentarios')
      .select(`
        *,
        autor:usuarios(id, nome, email, perfil)
      `)
      .eq('chamado_id', chamadoId)
      .order('data', { ascending: true });

    // Se não incluir internos, filtrar apenas comentários públicos
    if (!incluirInternos) {
      query = query.eq('interno', false);
    }

    const { data: comentarios, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar comentários: ${error.message}`);
    }

    return (comentarios || []) as ChamadoComentario[];
  }

  async avaliar(id: string, avaliacao: AvaliacaoDTO): Promise<ChamadoComRelacoes | null> {
    const chamadoExistente = await this.buscarPorId(id, false);
    if (!chamadoExistente) {
      return null;
    }

    // Só permite avaliação se o chamado estiver concluído
    if (chamadoExistente.status !== StatusChamado.CONCLUIDO) {
      throw new Error('Apenas chamados concluídos podem ser avaliados');
    }

    const { error } = await supabase
      .from('chamados')
      .update({
        avaliacao_nota: avaliacao.nota,
        avaliacao_comentario: avaliacao.comentario || null,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao avaliar chamado: ${error.message}`);
    }

    return this.buscarPorId(id);
  }

  async verificarProprietario(chamadoId: string, usuarioId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('chamados')
      .select('solicitante_id')
      .eq('id', chamadoId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.solicitante_id === usuarioId;
  }
}

export const chamadoService = new ChamadoService();
