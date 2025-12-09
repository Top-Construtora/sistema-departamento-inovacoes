import { api } from './api';
import { ApiResponse } from '../types';

interface UploadResponse {
  url: string;
}

export const uploadService = {
  /**
   * Faz upload de uma logo para o Supabase Storage
   */
  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<UploadResponse>>('/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data) {
      return response.data.data.url;
    }
    throw new Error(response.data.error || 'Erro ao fazer upload do logo');
  },

  /**
   * Faz upload de um template para o Supabase Storage
   */
  async uploadTemplate(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<UploadResponse>>('/upload/template', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data) {
      return response.data.data.url;
    }
    throw new Error(response.data.error || 'Erro ao fazer upload do template');
  },

  /**
   * Exclui um arquivo do Supabase Storage
   */
  async deleteFile(url: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>('/upload', {
      data: { url },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir arquivo');
    }
  },
};
