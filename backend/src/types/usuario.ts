export enum PerfilUsuario {
  LIDER = 'LIDER',
  ANALISTA = 'ANALISTA',
  EXTERNO = 'EXTERNO',
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  setor?: string | null;
  data_criacao: Date;
  ativo: boolean;
  deve_trocar_senha: boolean;
}

export interface UsuarioSemSenha {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  setor?: string | null;
  data_criacao: Date;
  ativo: boolean;
  deve_trocar_senha: boolean;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil?: PerfilUsuario;
  setor?: string;
  deve_trocar_senha?: boolean;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  perfil: PerfilUsuario;
}
