import { api } from './api';
import {
  ApiResponse,
  Chamado,
  ChamadoComentario,
  CreateChamadoDTO,
  StatusChamado,
  CategoriaChamado,
  PrioridadeDemanda,
  AvaliacaoDTO,
} from '../types';

export interface ChamadoFiltros {
  status?: StatusChamado;
  categoria?: CategoriaChamado;
  prioridade?: PrioridadeDemanda;
  responsavel_id?: string;
}

export const chamadoService = {
  async listar(filtros?: ChamadoFiltros): Promise<Chamado[]> {
    const params = new URLSearchParams();
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.prioridade) params.append('prioridade', filtros.prioridade);
    if (filtros?.responsavel_id) params.append('responsavel_id', filtros.responsavel_id);

    const response = await api.get<ApiResponse<Chamado[]>>(`/chamados?${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao listar chamados');
  },

  async buscarPorId(id: string): Promise<Chamado> {
    const response = await api.get<ApiResponse<Chamado>>(`/chamados/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao buscar chamado');
  },

  async criar(data: CreateChamadoDTO): Promise<Chamado> {
    const response = await api.post<ApiResponse<Chamado>>('/chamados', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar chamado');
  },

  async atualizarStatus(id: string, status: StatusChamado): Promise<Chamado> {
    const response = await api.patch<ApiResponse<Chamado>>(`/chamados/${id}/status`, { status });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar status');
  },

  async atribuirResponsavel(id: string, responsavel_id: string | null): Promise<Chamado> {
    const response = await api.put<ApiResponse<Chamado>>(`/chamados/${id}`, { responsavel_id });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atribuir responsável');
  },

  async atualizarPrioridade(id: string, prioridade: PrioridadeDemanda): Promise<Chamado> {
    const response = await api.put<ApiResponse<Chamado>>(`/chamados/${id}`, { prioridade });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar prioridade');
  },

  async adicionarComentario(id: string, mensagem: string, interno = false): Promise<ChamadoComentario> {
    const response = await api.post<ApiResponse<ChamadoComentario>>(`/chamados/${id}/comentarios`, {
      mensagem,
      interno,
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao adicionar comentário');
  },

  async avaliar(id: string, avaliacao: AvaliacaoDTO): Promise<Chamado> {
    const response = await api.post<ApiResponse<Chamado>>(`/chamados/${id}/avaliacao`, avaliacao);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao avaliar chamado');
  },
};
