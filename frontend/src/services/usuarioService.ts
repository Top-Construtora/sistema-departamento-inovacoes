import { api } from './api';
import { ApiResponse, Usuario, PerfilUsuario } from '../types';

interface UpdateUsuarioDTO {
  nome?: string;
  perfil?: PerfilUsuario;
  setor?: string | null;
}

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const response = await api.get<ApiResponse<Usuario[]>>('/usuarios');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  async listarInternos(): Promise<Usuario[]> {
    const response = await api.get<ApiResponse<Usuario[]>>('/usuarios?internos=true');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  async buscarPorId(id: string): Promise<Usuario | null> {
    const response = await api.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  },

  async atualizar(id: string, data: UpdateUsuarioDTO): Promise<Usuario> {
    const response = await api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao atualizar usuário');
  },

  async alterarStatus(id: string, ativo: boolean): Promise<Usuario> {
    const response = await api.patch<ApiResponse<Usuario>>(`/usuarios/${id}/status`, { ativo });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao alterar status do usuário');
  },

  async resetarSenha(id: string, novaSenha: string): Promise<void> {
    const response = await api.patch<ApiResponse<void>>(`/usuarios/${id}/resetar-senha`, { novaSenha });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao resetar senha');
    }
  },
};
