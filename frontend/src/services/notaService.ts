import { api } from './api';
import { ApiResponse, Nota, NotaAnexo, CreateNotaDTO } from '../types';

interface UploadResponse {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
}

export const notaService = {
  async listar(offset = 0, limit = 100): Promise<Nota[]> {
    const response = await api.get<ApiResponse<Nota[]>>(
      `/notas?offset=${offset}&limit=${limit}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao listar notas');
  },

  async criar(data: CreateNotaDTO): Promise<Nota> {
    const response = await api.post<ApiResponse<Nota>>('/notas', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar nota');
  },

  async atualizar(id: string, conteudo: string): Promise<Nota> {
    const response = await api.put<ApiResponse<Nota>>(`/notas/${id}`, { conteudo });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar nota');
  },

  async excluir(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/notas/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir nota');
    }
  },

  async uploadArquivo(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<UploadResponse>>('/upload/anexo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao fazer upload');
  },

  async adicionarAnexo(notaId: string, arquivo: { nome: string; tipo: string; tamanho: number; url: string }): Promise<NotaAnexo> {
    const response = await api.post<ApiResponse<NotaAnexo>>(`/notas/${notaId}/anexos`, arquivo);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao adicionar anexo');
  },
};
