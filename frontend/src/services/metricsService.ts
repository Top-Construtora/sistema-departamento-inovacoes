import { api } from './api';
import {
  ResumoGeral,
  ChamadosPorSetor,
  ProjetosPorStatus,
  ProjetosPorTipo,
  TempoMedioResolucao,
  DemandasPorResponsavel,
  DemandasPorPrioridade,
  DemandasPorStatus,
  ChamadosPorCategoria,
  ChamadosPorStatus,
  EvolucaoMensal,
  TopProjetos,
  ApiResponse,
} from '../types';

export const metricsService = {
  async getResumoGeral(): Promise<ResumoGeral> {
    const response = await api.get<ApiResponse<ResumoGeral>>('/metrics/resumo-geral');
    return response.data.data!;
  },

  async getChamadosPorSetor(): Promise<ChamadosPorSetor[]> {
    const response = await api.get<ApiResponse<ChamadosPorSetor[]>>('/metrics/chamados-por-setor');
    return response.data.data || [];
  },

  async getProjetosPorStatus(): Promise<ProjetosPorStatus[]> {
    const response = await api.get<ApiResponse<ProjetosPorStatus[]>>('/metrics/projetos-por-status');
    return response.data.data || [];
  },

  async getProjetosPorTipo(): Promise<ProjetosPorTipo[]> {
    const response = await api.get<ApiResponse<ProjetosPorTipo[]>>('/metrics/projetos-por-tipo');
    return response.data.data || [];
  },

  async getTempoMedioResolucao(meses: number = 6): Promise<TempoMedioResolucao[]> {
    const response = await api.get<ApiResponse<TempoMedioResolucao[]>>(
      `/metrics/tempo-medio-resolucao-chamados?meses=${meses}`
    );
    return response.data.data || [];
  },

  async getDemandasPorResponsavel(): Promise<DemandasPorResponsavel[]> {
    const response = await api.get<ApiResponse<DemandasPorResponsavel[]>>('/metrics/demandas-por-responsavel');
    return response.data.data || [];
  },

  async getDemandasPorPrioridade(): Promise<DemandasPorPrioridade[]> {
    const response = await api.get<ApiResponse<DemandasPorPrioridade[]>>('/metrics/demandas-por-prioridade');
    return response.data.data || [];
  },

  async getDemandasPorStatus(): Promise<DemandasPorStatus[]> {
    const response = await api.get<ApiResponse<DemandasPorStatus[]>>('/metrics/demandas-por-status');
    return response.data.data || [];
  },

  async getChamadosPorCategoria(): Promise<ChamadosPorCategoria[]> {
    const response = await api.get<ApiResponse<ChamadosPorCategoria[]>>('/metrics/chamados-por-categoria');
    return response.data.data || [];
  },

  async getChamadosPorStatus(): Promise<ChamadosPorStatus[]> {
    const response = await api.get<ApiResponse<ChamadosPorStatus[]>>('/metrics/chamados-por-status');
    return response.data.data || [];
  },

  async getEvolucaoMensal(meses: number = 6): Promise<EvolucaoMensal[]> {
    const response = await api.get<ApiResponse<EvolucaoMensal[]>>(`/metrics/evolucao-mensal?meses=${meses}`);
    return response.data.data || [];
  },

  async getTopProjetos(limit: number = 5): Promise<TopProjetos[]> {
    const response = await api.get<ApiResponse<TopProjetos[]>>(`/metrics/top-projetos?limit=${limit}`);
    return response.data.data || [];
  },
};
