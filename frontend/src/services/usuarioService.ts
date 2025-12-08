import { api } from './api';
import { ApiResponse, Usuario } from '../types';

export const usuarioService = {
  async listarInternos(): Promise<Usuario[]> {
    const response = await api.get<ApiResponse<Usuario[]>>('/usuarios?internos=true');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    // Se não existir endpoint, retorna array vazio
    return [];
  },
};
