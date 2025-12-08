import { api } from './api';
import {
  ApiResponse,
  SistemaAcesso,
  Credencial,
  CreateSistemaAcessoDTO,
  CreateCredencialDTO,
  TipoSistemaAcesso,
} from '../types';

export interface SistemaAcessoFiltros {
  tipo?: TipoSistemaAcesso;
  responsavel_id?: string;
}

export const sistemaAcessoService = {
  // Sistemas
  async listar(filtros?: SistemaAcessoFiltros): Promise<SistemaAcesso[]> {
    const params = new URLSearchParams();
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.responsavel_id) params.append('responsavel_id', filtros.responsavel_id);

    const response = await api.get<ApiResponse<SistemaAcesso[]>>(`/sistemas-acesso?${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao listar sistemas');
  },

  async buscarPorId(id: string): Promise<SistemaAcesso> {
    const response = await api.get<ApiResponse<SistemaAcesso>>(`/sistemas-acesso/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao buscar sistema');
  },

  async criar(data: CreateSistemaAcessoDTO): Promise<SistemaAcesso> {
    const response = await api.post<ApiResponse<SistemaAcesso>>('/sistemas-acesso', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar sistema');
  },

  async atualizar(id: string, data: Partial<CreateSistemaAcessoDTO>): Promise<SistemaAcesso> {
    const response = await api.put<ApiResponse<SistemaAcesso>>(`/sistemas-acesso/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar sistema');
  },

  async excluir(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/sistemas-acesso/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir sistema');
    }
  },

  // Credenciais
  async listarCredenciais(sistemaId: string): Promise<Credencial[]> {
    const response = await api.get<ApiResponse<Credencial[]>>(`/sistemas-acesso/${sistemaId}/credenciais`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao listar credenciais');
  },

  async criarCredencial(sistemaId: string, data: CreateCredencialDTO): Promise<Credencial> {
    const response = await api.post<ApiResponse<Credencial>>(`/sistemas-acesso/${sistemaId}/credenciais`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar credencial');
  },

  async revelarSenha(credencialId: string): Promise<string> {
    const response = await api.get<ApiResponse<{ senha: string }>>(`/sistemas-acesso/credenciais/${credencialId}/senha`);
    if (response.data.success && response.data.data) {
      return response.data.data.senha;
    }
    throw new Error(response.data.error || 'Erro ao revelar senha');
  },

  async atualizarCredencial(credencialId: string, data: Partial<CreateCredencialDTO>): Promise<Credencial> {
    const response = await api.put<ApiResponse<Credencial>>(`/sistemas-acesso/credenciais/${credencialId}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar credencial');
  },

  async excluirCredencial(credencialId: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/sistemas-acesso/credenciais/${credencialId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir credencial');
    }
  },
};
