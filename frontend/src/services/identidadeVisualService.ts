import { api } from './api';
import {
  ApiResponse,
  IdentidadeVisualCompleta,
  Logo,
  PaletaCor,
  FonteTipografica,
  TemplateArquivo,
  CreateLogoDTO,
  CreateCorDTO,
  CreateFonteDTO,
  CreateTemplateDTO,
} from '../types';

export const identidadeVisualService = {
  async buscarTudo(): Promise<IdentidadeVisualCompleta> {
    const response = await api.get<ApiResponse<IdentidadeVisualCompleta>>('/identidade-visual');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao buscar identidade visual');
  },

  // Logos
  async criarLogo(data: CreateLogoDTO): Promise<Logo> {
    const response = await api.post<ApiResponse<Logo>>('/identidade-visual/logos', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar logo');
  },

  async excluirLogo(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/identidade-visual/logos/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir logo');
    }
  },

  // Cores
  async criarCor(data: CreateCorDTO): Promise<PaletaCor> {
    const response = await api.post<ApiResponse<PaletaCor>>('/identidade-visual/cores', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar cor');
  },

  async atualizarCor(id: string, data: Partial<CreateCorDTO>): Promise<PaletaCor> {
    const response = await api.put<ApiResponse<PaletaCor>>(`/identidade-visual/cores/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar cor');
  },

  async excluirCor(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/identidade-visual/cores/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir cor');
    }
  },

  // Fontes
  async criarFonte(data: CreateFonteDTO): Promise<FonteTipografica> {
    const response = await api.post<ApiResponse<FonteTipografica>>('/identidade-visual/fontes', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar fonte');
  },

  async excluirFonte(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/identidade-visual/fontes/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir fonte');
    }
  },

  // Templates
  async criarTemplate(data: CreateTemplateDTO): Promise<TemplateArquivo> {
    const response = await api.post<ApiResponse<TemplateArquivo>>('/identidade-visual/templates', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar template');
  },

  async registrarDownload(id: string): Promise<void> {
    await api.post(`/identidade-visual/templates/${id}/download`);
  },

  async excluirTemplate(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/identidade-visual/templates/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir template');
    }
  },
};
