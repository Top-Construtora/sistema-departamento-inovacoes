import { api } from './api';
import { ApiResponse } from '../types';

export enum CategoriaPortfolio {
  AUTOMACAO = 'AUTOMACAO',
  SISTEMA_INTERNO = 'SISTEMA_INTERNO',
  APLICATIVO = 'APLICATIVO',
  INFRA = 'INFRA',
  PESQUISA = 'PESQUISA',
  INTEGRACAO = 'INTEGRACAO',
  DASHBOARD = 'DASHBOARD',
  OUTRO = 'OUTRO',
}

export interface KPIImpacto {
  nome: string;
  valor: number;
  unidade: string;
  descricao?: string;
}

export interface PortfolioProjeto {
  id: string;
  nome: string;
  descricao_resumida?: string | null;
  problema?: string | null;
  solucao?: string | null;
  tecnologias: string[];
  setores_beneficiados: string[];
  data_conclusao?: string | null;
  impacto_qualitativo?: string | null;
  impacto_quantitativo: KPIImpacto[];
  horas_economizadas?: number | null;
  impacto_financeiro_estimado?: number | null;
  categoria: CategoriaPortfolio;
  projeto_origem_id?: string | null;
  criado_por_id: string;
  data_criacao: string;
  data_atualizacao: string;
  publicado: boolean;
  ativo: boolean;
}

export interface CreatePortfolioDTO {
  nome: string;
  descricao_resumida?: string;
  problema?: string;
  solucao?: string;
  tecnologias?: string[];
  setores_beneficiados?: string[];
  data_conclusao?: string;
  impacto_qualitativo?: string;
  impacto_quantitativo?: KPIImpacto[];
  horas_economizadas?: number;
  impacto_financeiro_estimado?: number;
  categoria?: CategoriaPortfolio;
  projeto_origem_id?: string;
  publicado?: boolean;
}

export const portfolioService = {
  async listar(): Promise<PortfolioProjeto[]> {
    const response = await api.get<ApiResponse<PortfolioProjeto[]>>('/portfolio');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  async buscarPorId(id: string): Promise<PortfolioProjeto | null> {
    const response = await api.get<ApiResponse<PortfolioProjeto>>(`/portfolio/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  },

  async criar(data: CreatePortfolioDTO): Promise<PortfolioProjeto> {
    const response = await api.post<ApiResponse<PortfolioProjeto>>('/portfolio', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar item do portfólio');
  },

  async atualizar(id: string, data: Partial<CreatePortfolioDTO>): Promise<PortfolioProjeto> {
    const response = await api.put<ApiResponse<PortfolioProjeto>>(`/portfolio/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar item do portfólio');
  },

  async excluir(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/portfolio/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir item do portfólio');
    }
  },
};
