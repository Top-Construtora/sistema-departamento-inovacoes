import { api } from './api';
import { ApiResponse, Demanda, CreateDemandaDTO, UpdateDemandaDTO, StatusDemanda } from '../types';

export interface DemandaFiltros {
  status?: StatusDemanda;
  prioridade?: string;
  responsavel_id?: string;
  projeto_id?: string;
  tipo?: string;
}

export const demandaService = {
  async listar(filtros?: DemandaFiltros): Promise<Demanda[]> {
    const params = new URLSearchParams();
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.prioridade) params.append('prioridade', filtros.prioridade);
    if (filtros?.responsavel_id) params.append('responsavel_id', filtros.responsavel_id);
    if (filtros?.projeto_id) params.append('projeto_id', filtros.projeto_id);
    if (filtros?.tipo) params.append('tipo', filtros.tipo);

    const response = await api.get<ApiResponse<Demanda[]>>(`/demandas?${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao listar demandas');
  },

  async buscarPorId(id: string): Promise<Demanda> {
    const response = await api.get<ApiResponse<Demanda>>(`/demandas/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao buscar demanda');
  },

  async criar(data: CreateDemandaDTO): Promise<Demanda> {
    const response = await api.post<ApiResponse<Demanda>>('/demandas', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar demanda');
  },

  async atualizar(id: string, data: UpdateDemandaDTO): Promise<Demanda> {
    const response = await api.put<ApiResponse<Demanda>>(`/demandas/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar demanda');
  },

  async atualizarStatus(id: string, status: StatusDemanda): Promise<Demanda> {
    const response = await api.patch<ApiResponse<Demanda>>(`/demandas/${id}/status`, { status });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar status');
  },

  async excluir(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/demandas/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir demanda');
    }
  },
};
