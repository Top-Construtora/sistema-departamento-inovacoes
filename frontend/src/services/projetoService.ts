import { api } from './api';
import { ApiResponse, Projeto } from '../types';

export const projetoService = {
  async listar(): Promise<Projeto[]> {
    const response = await api.get<ApiResponse<Projeto[]>>('/projetos');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao listar projetos');
  },

  async buscarPorId(id: string): Promise<Projeto> {
    const response = await api.get<ApiResponse<Projeto>>(`/projetos/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao buscar projeto');
  },
};
