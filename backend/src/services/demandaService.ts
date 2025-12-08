import { supabase } from '../config/database.js';
import {
  Demanda,
  DemandaComRelacoes,
  CreateDemandaDTO,
  UpdateDemandaDTO,
  DemandaFiltros,
  StatusDemanda,
} from '../types/demanda.js';

export class DemandaService {
  async criar(data: CreateDemandaDTO): Promise<DemandaComRelacoes> {
    const { data: demanda, error } = await supabase
      .from('demandas')
      .insert({
        titulo: data.titulo,
        descricao: data.descricao || null,
        tipo: data.tipo || 'OUTRO',
        prioridade: data.prioridade || 'MEDIA',
        status: data.status || 'A_FAZER',
        projeto_id: data.projeto_id || null,
        responsavel_id: data.responsavel_id || null,
        solicitante_id: data.solicitante_id,
        prazo: data.prazo || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar demanda: ${error.message}`);
    }

    return this.buscarPorId(demanda.id) as Promise<DemandaComRelacoes>;
  }

  async listar(filtros?: DemandaFiltros): Promise<DemandaComRelacoes[]> {
    let query = supabase
      .from('demandas')
      .select(`
        *,
        projeto:projetos(id, nome),
        responsavel:usuarios!demandas_responsavel_id_fkey(id, nome, email, perfil),
        solicitante:usuarios!demandas_solicitante_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', filtros?.ativo ?? true)
      .order('data_criacao', { ascending: false });

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.prioridade) {
      query = query.eq('prioridade', filtros.prioridade);
    }

    if (filtros?.responsavel_id) {
      query = query.eq('responsavel_id', filtros.responsavel_id);
    }

    if (filtros?.solicitante_id) {
      query = query.eq('solicitante_id', filtros.solicitante_id);
    }

    if (filtros?.projeto_id) {
      query = query.eq('projeto_id', filtros.projeto_id);
    }

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    const { data: demandas, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar demandas: ${error.message}`);
    }

    return (demandas || []) as DemandaComRelacoes[];
  }

  async buscarPorId(id: string): Promise<DemandaComRelacoes | null> {
    const { data: demanda, error } = await supabase
      .from('demandas')
      .select(`
        *,
        projeto:projetos(id, nome),
        responsavel:usuarios!demandas_responsavel_id_fkey(id, nome, email, perfil),
        solicitante:usuarios!demandas_solicitante_id_fkey(id, nome, email, perfil)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error || !demanda) {
      return null;
    }

    return demanda as DemandaComRelacoes;
  }

  async atualizar(id: string, data: UpdateDemandaDTO): Promise<DemandaComRelacoes | null> {
    const demandaExistente = await this.buscarPorId(id);
    if (!demandaExistente) {
      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.prioridade !== undefined) updateData.prioridade = data.prioridade;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.projeto_id !== undefined) updateData.projeto_id = data.projeto_id;
    if (data.responsavel_id !== undefined) updateData.responsavel_id = data.responsavel_id;
    if (data.prazo !== undefined) updateData.prazo = data.prazo;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('demandas')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar demanda: ${error.message}`);
      }
    }

    return this.buscarPorId(id);
  }

  async atualizarStatus(id: string, status: StatusDemanda): Promise<DemandaComRelacoes | null> {
    const demandaExistente = await this.buscarPorId(id);
    if (!demandaExistente) {
      return null;
    }

    const { error } = await supabase
      .from('demandas')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }

    return this.buscarPorId(id);
  }

  async excluir(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('demandas')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir demanda: ${error.message}`);
    }

    return true;
  }
}

export const demandaService = new DemandaService();
