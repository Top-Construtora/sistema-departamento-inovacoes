import { supabase } from '../config/database.js';
import {
  Projeto,
  ProjetoComRelacoes,
  CreateProjetoDTO,
  UpdateProjetoDTO,
  ProjetoFiltros,
} from '../types/projeto.js';

export class ProjetoService {
  async criar(data: CreateProjetoDTO): Promise<ProjetoComRelacoes> {
    const { equipe_ids, ...projetoData } = data;

    // Criar o projeto
    const { data: projeto, error } = await supabase
      .from('projetos')
      .insert({
        nome: projetoData.nome,
        descricao: projetoData.descricao || null,
        objetivo: projetoData.objetivo || null,
        tipo: projetoData.tipo || 'OUTRO',
        status: projetoData.status || 'IDEIA',
        lider_id: projetoData.lider_id,
        data_inicio: projetoData.data_inicio || null,
        data_fim_prevista: projetoData.data_fim_prevista || null,
        risco: projetoData.risco || null,
        tags: projetoData.tags || [],
        links_externos: projetoData.links_externos || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar projeto: ${error.message}`);
    }

    // Adicionar equipe se fornecida
    if (equipe_ids && equipe_ids.length > 0) {
      await this.atualizarEquipe(projeto.id, equipe_ids);
    }

    return this.buscarPorId(projeto.id) as Promise<ProjetoComRelacoes>;
  }

  async listar(filtros?: ProjetoFiltros): Promise<ProjetoComRelacoes[]> {
    let query = supabase
      .from('projetos')
      .select(`
        *,
        lider:usuarios!projetos_lider_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', filtros?.ativo ?? true)
      .order('data_criacao', { ascending: false });

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.lider_id) {
      query = query.eq('lider_id', filtros.lider_id);
    }

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros?.tag) {
      query = query.contains('tags', [filtros.tag]);
    }

    const { data: projetos, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar projetos: ${error.message}`);
    }

    // Buscar equipe de cada projeto
    const projetosComEquipe = await Promise.all(
      (projetos || []).map(async (projeto) => {
        const equipe = await this.buscarEquipe(projeto.id);
        return { ...projeto, equipe };
      })
    );

    return projetosComEquipe as ProjetoComRelacoes[];
  }

  async buscarPorId(id: string): Promise<ProjetoComRelacoes | null> {
    const { data: projeto, error } = await supabase
      .from('projetos')
      .select(`
        *,
        lider:usuarios!projetos_lider_id_fkey(id, nome, email, perfil)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error || !projeto) {
      return null;
    }

    const equipe = await this.buscarEquipe(id);

    return { ...projeto, equipe } as ProjetoComRelacoes;
  }

  async atualizar(id: string, data: UpdateProjetoDTO): Promise<ProjetoComRelacoes | null> {
    const { equipe_ids, ...projetoData } = data;

    // Verificar se projeto existe
    const projetoExistente = await this.buscarPorId(id);
    if (!projetoExistente) {
      return null;
    }

    // Atualizar dados do projeto
    const updateData: Record<string, unknown> = {};

    if (projetoData.nome !== undefined) updateData.nome = projetoData.nome;
    if (projetoData.descricao !== undefined) updateData.descricao = projetoData.descricao;
    if (projetoData.objetivo !== undefined) updateData.objetivo = projetoData.objetivo;
    if (projetoData.tipo !== undefined) updateData.tipo = projetoData.tipo;
    if (projetoData.status !== undefined) updateData.status = projetoData.status;
    if (projetoData.lider_id !== undefined) updateData.lider_id = projetoData.lider_id;
    if (projetoData.data_inicio !== undefined) updateData.data_inicio = projetoData.data_inicio;
    if (projetoData.data_fim_prevista !== undefined) updateData.data_fim_prevista = projetoData.data_fim_prevista;
    if (projetoData.risco !== undefined) updateData.risco = projetoData.risco;
    if (projetoData.tags !== undefined) updateData.tags = projetoData.tags;
    if (projetoData.links_externos !== undefined) updateData.links_externos = projetoData.links_externos;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('projetos')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar projeto: ${error.message}`);
      }
    }

    // Atualizar equipe se fornecida
    if (equipe_ids !== undefined) {
      await this.atualizarEquipe(id, equipe_ids);
    }

    return this.buscarPorId(id);
  }

  async excluir(id: string): Promise<boolean> {
    // Soft delete
    const { error } = await supabase
      .from('projetos')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir projeto: ${error.message}`);
    }

    return true;
  }

  private async buscarEquipe(projetoId: string) {
    const { data: equipe, error } = await supabase
      .from('projeto_equipe')
      .select(`
        usuario:usuarios(id, nome, email, perfil)
      `)
      .eq('projeto_id', projetoId);

    if (error) {
      return [];
    }

    return (equipe || []).map((e) => e.usuario);
  }

  private async atualizarEquipe(projetoId: string, usuarioIds: string[]): Promise<void> {
    // Remover equipe atual
    await supabase
      .from('projeto_equipe')
      .delete()
      .eq('projeto_id', projetoId);

    // Adicionar novos membros
    if (usuarioIds.length > 0) {
      const membros = usuarioIds.map((usuarioId) => ({
        projeto_id: projetoId,
        usuario_id: usuarioId,
      }));

      const { error } = await supabase
        .from('projeto_equipe')
        .insert(membros);

      if (error) {
        throw new Error(`Erro ao atualizar equipe: ${error.message}`);
      }
    }
  }
}

export const projetoService = new ProjetoService();
