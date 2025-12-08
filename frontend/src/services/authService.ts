import { api } from './api';
import { ApiResponse, AuthResponse, LoginDTO, Usuario } from '../types';

interface RegisterDTO {
  nome: string;
  email: string;
  senha: string;
  setor?: string;
}

export const authService = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (response.data.success && response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao fazer login');
  },

  async register(data: RegisterDTO): Promise<Usuario> {
    const response = await api.post<ApiResponse<Usuario>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao criar conta');
  },

  async me(): Promise<Usuario> {
    const response = await api.get<ApiResponse<Usuario>>('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao buscar usuário');
  },

  async definirNovaSenha(novaSenha: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/definir-senha', { novaSenha });
    if (response.data.success && response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
      return response.data.data;
    }
    throw new Error(response.data.error || 'Erro ao definir senha');
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUsuario(): Usuario | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
