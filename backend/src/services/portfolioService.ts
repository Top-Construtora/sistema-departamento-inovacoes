import { supabase } from '../config/database.js';
import {
  PortfolioProjeto,
  PortfolioProjetoComRelacoes,
  PortfolioVersao,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  CreateVersaoDTO,
  PortfolioFiltros,
  MembroEquipePortfolio,
} from '../types/portfolio.js';

export class PortfolioService {
  async criar(data: CreatePortfolioDTO, criadoPorId: string): Promise<PortfolioProjetoComRelacoes> {
    const { equipe, ...portfolioData } = data;

    // Criar o projeto do portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolio_projetos')
      .insert({
        nome: portfolioData.nome,
        descricao_resumida: portfolioData.descricao_resumida || null,
        problema: portfolioData.problema || null,
        solucao: portfolioData.solucao || null,
        tecnologias: portfolioData.tecnologias || [],
        setores_beneficiados: portfolioData.setores_beneficiados || [],
        data_conclusao: portfolioData.data_conclusao || null,
        impacto_qualitativo: portfolioData.impacto_qualitativo || null,
        impacto_quantitativo: portfolioData.impacto_quantitativo || [],
        horas_economizadas: portfolioData.horas_economizadas || null,
        impacto_financeiro_estimado: portfolioData.impacto_financeiro_estimado || null,
        categoria: portfolioData.categoria || 'OUTRO',
        projeto_origem_id: portfolioData.projeto_origem_id || null,
        publicado: portfolioData.publicado ?? false,
        criado_por_id: criadoPorId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar projeto no portfolio: ${error.message}`);
    }

    // Adicionar equipe se fornecida
    if (equipe && equipe.length > 0) {
      await this.atualizarEquipe(portfolio.id, equipe);
    }

    return this.buscarPorId(portfolio.id) as Promise<PortfolioProjetoComRelacoes>;
  }

  async listar(filtros?: PortfolioFiltros): Promise<PortfolioProjetoComRelacoes[]> {
    let query = supabase
      .from('portfolio_projetos')
      .select(`
        *,
        criado_por:usuarios!portfolio_projetos_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', filtros?.ativo ?? true)
      .order('data_conclusao', { ascending: false, nullsFirst: false });

    if (filtros?.categoria) {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros?.publicado !== undefined) {
      query = query.eq('publicado', filtros.publicado);
    }

    if (filtros?.tecnologia) {
      query = query.contains('tecnologias', [filtros.tecnologia]);
    }

    if (filtros?.setor) {
      query = query.contains('setores_beneficiados', [filtros.setor]);
    }

    const { data: portfolios, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar portfolio: ${error.message}`);
    }

    // Buscar equipe e imagens de cada projeto
    const portfoliosCompletos = await Promise.all(
      (portfolios || []).map(async (portfolio) => {
        const equipe = await this.buscarEquipe(portfolio.id);
        const imagens = await this.buscarImagens(portfolio.id);
        return { ...portfolio, equipe, imagens };
      })
    );

    return portfoliosCompletos as PortfolioProjetoComRelacoes[];
  }

  async buscarPorId(id: string): Promise<PortfolioProjetoComRelacoes | null> {
    const { data: portfolio, error } = await supabase
      .from('portfolio_projetos')
      .select(`
        *,
        criado_por:usuarios!portfolio_projetos_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error || !portfolio) {
      return null;
    }

    const equipe = await this.buscarEquipe(id);
    const imagens = await this.buscarImagens(id);
    const versoes = await this.buscarVersoes(id);

    return { ...portfolio, equipe, imagens, versoes } as PortfolioProjetoComRelacoes;
  }

  async atualizar(id: string, data: UpdatePortfolioDTO): Promise<PortfolioProjetoComRelacoes | null> {
    const { equipe, ...portfolioData } = data;

    // Verificar se existe
    const existente = await this.buscarPorId(id);
    if (!existente) {
      return null;
    }

    // Montar objeto de atualizacao
    const updateData: Record<string, unknown> = {};

    if (portfolioData.nome !== undefined) updateData.nome = portfolioData.nome;
    if (portfolioData.descricao_resumida !== undefined) updateData.descricao_resumida = portfolioData.descricao_resumida;
    if (portfolioData.problema !== undefined) updateData.problema = portfolioData.problema;
    if (portfolioData.solucao !== undefined) updateData.solucao = portfolioData.solucao;
    if (portfolioData.tecnologias !== undefined) updateData.tecnologias = portfolioData.tecnologias;
    if (portfolioData.setores_beneficiados !== undefined) updateData.setores_beneficiados = portfolioData.setores_beneficiados;
    if (portfolioData.data_conclusao !== undefined) updateData.data_conclusao = portfolioData.data_conclusao;
    if (portfolioData.impacto_qualitativo !== undefined) updateData.impacto_qualitativo = portfolioData.impacto_qualitativo;
    if (portfolioData.impacto_quantitativo !== undefined) updateData.impacto_quantitativo = portfolioData.impacto_quantitativo;
    if (portfolioData.horas_economizadas !== undefined) updateData.horas_economizadas = portfolioData.horas_economizadas;
    if (portfolioData.impacto_financeiro_estimado !== undefined) updateData.impacto_financeiro_estimado = portfolioData.impacto_financeiro_estimado;
    if (portfolioData.categoria !== undefined) updateData.categoria = portfolioData.categoria;
    if (portfolioData.projeto_origem_id !== undefined) updateData.projeto_origem_id = portfolioData.projeto_origem_id;
    if (portfolioData.publicado !== undefined) updateData.publicado = portfolioData.publicado;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('portfolio_projetos')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar portfolio: ${error.message}`);
      }
    }

    // Atualizar equipe se fornecida
    if (equipe !== undefined) {
      await this.atualizarEquipe(id, equipe);
    }

    return this.buscarPorId(id);
  }

  async excluir(id: string): Promise<boolean> {
    // Soft delete
    const { error } = await supabase
      .from('portfolio_projetos')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir projeto do portfolio: ${error.message}`);
    }

    return true;
  }

  // Versoes
  async criarVersao(portfolioId: string, data: CreateVersaoDTO, criadoPorId: string): Promise<PortfolioVersao> {
    // Verificar se portfolio existe
    const portfolio = await this.buscarPorId(portfolioId);
    if (!portfolio) {
      throw new Error('Projeto do portfolio nao encontrado');
    }

    const { data: versao, error } = await supabase
      .from('portfolio_versoes')
      .insert({
        portfolio_projeto_id: portfolioId,
        numero_versao: data.numero_versao,
        descricao: data.descricao || null,
        alteracoes: data.alteracoes || null,
        criado_por_id: criadoPorId,
      })
      .select(`
        *,
        criado_por:usuarios!portfolio_versoes_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar versao: ${error.message}`);
    }

    return versao as PortfolioVersao;
  }

  async listarVersoes(portfolioId: string): Promise<PortfolioVersao[]> {
    const { data: versoes, error } = await supabase
      .from('portfolio_versoes')
      .select(`
        *,
        criado_por:usuarios!portfolio_versoes_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('portfolio_projeto_id', portfolioId)
      .order('data', { ascending: false });

    if (error) {
      throw new Error(`Erro ao listar versoes: ${error.message}`);
    }

    return (versoes || []) as PortfolioVersao[];
  }

  // Metodos privados auxiliares
  private async buscarEquipe(portfolioId: string): Promise<MembroEquipePortfolio[]> {
    const { data: equipe, error } = await supabase
      .from('portfolio_equipe')
      .select(`
        usuario_id,
        funcao,
        usuario:usuarios(id, nome, email, perfil)
      `)
      .eq('portfolio_projeto_id', portfolioId);

    if (error) {
      return [];
    }

    return (equipe || []).map((e) => ({
      usuario_id: e.usuario_id,
      funcao: e.funcao,
      // Supabase retorna como array em alguns casos, pegar primeiro elemento
      usuario: Array.isArray(e.usuario) ? e.usuario[0] : e.usuario,
    })) as MembroEquipePortfolio[];
  }

  private async atualizarEquipe(
    portfolioId: string,
    membros: { usuario_id: string; funcao?: string }[]
  ): Promise<void> {
    // Remover equipe atual
    await supabase
      .from('portfolio_equipe')
      .delete()
      .eq('portfolio_projeto_id', portfolioId);

    // Adicionar novos membros
    if (membros.length > 0) {
      const membrosData = membros.map((m) => ({
        portfolio_projeto_id: portfolioId,
        usuario_id: m.usuario_id,
        funcao: m.funcao || null,
      }));

      const { error } = await supabase
        .from('portfolio_equipe')
        .insert(membrosData);

      if (error) {
        throw new Error(`Erro ao atualizar equipe: ${error.message}`);
      }
    }
  }

  private async buscarImagens(portfolioId: string) {
    const { data: imagens, error } = await supabase
      .from('portfolio_imagens')
      .select('*')
      .eq('portfolio_projeto_id', portfolioId)
      .order('ordem', { ascending: true });

    if (error) {
      return [];
    }

    return imagens || [];
  }

  private async buscarVersoes(portfolioId: string): Promise<PortfolioVersao[]> {
    const { data: versoes, error } = await supabase
      .from('portfolio_versoes')
      .select(`
        *,
        criado_por:usuarios!portfolio_versoes_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('portfolio_projeto_id', portfolioId)
      .order('data', { ascending: false });

    if (error) {
      return [];
    }

    return (versoes || []) as PortfolioVersao[];
  }
}

export const portfolioService = new PortfolioService();
