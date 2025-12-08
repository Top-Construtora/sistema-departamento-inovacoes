import { UsuarioSemSenha } from './usuario.js';

export enum TipoSistemaAcesso {
  PLATAFORMA_CURSO = 'PLATAFORMA_CURSO',
  DESENVOLVIMENTO = 'DESENVOLVIMENTO',
  INFRA = 'INFRA',
  COMUNICACAO = 'COMUNICACAO',
  ANALYTICS = 'ANALYTICS',
  CLOUD = 'CLOUD',
  BANCO_DADOS = 'BANCO_DADOS',
  API_EXTERNA = 'API_EXTERNA',
  FERRAMENTA_INTERNA = 'FERRAMENTA_INTERNA',
  OUTRO = 'OUTRO',
}

export enum AmbienteCredencial {
  PRODUCAO = 'PRODUCAO',
  HOMOLOGACAO = 'HOMOLOGACAO',
  DESENVOLVIMENTO = 'DESENVOLVIMENTO',
}

export interface SistemaAcesso {
  id: string;
  nome: string;
  url?: string | null;
  tipo: TipoSistemaAcesso;
  responsavel_id?: string | null;
  observacoes?: string | null;
  instrucoes_acesso?: string | null;
  icone?: string | null;
  criado_por_id: string;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface SistemaAcessoComRelacoes extends SistemaAcesso {
  responsavel?: UsuarioSemSenha | null;
  criado_por?: UsuarioSemSenha;
  credenciais?: Credencial[];
}

export interface Credencial {
  id: string;
  sistema_id: string;
  descricao?: string | null;
  usuario_referente_id?: string | null;
  usuario_referente_nome?: string | null;
  login: string;
  // Senha nao e retornada por padrao, apenas quando solicitado
  senha_descriptografada?: string;
  ambiente: AmbienteCredencial;
  observacoes?: string | null;
  criado_por_id: string;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface CredencialComRelacoes extends Credencial {
  usuario_referente?: UsuarioSemSenha | null;
  criado_por?: UsuarioSemSenha;
}

export interface CredencialLog {
  id: string;
  credencial_id: string;
  usuario_id: string;
  acao: string;
  ip_address?: string | null;
  data: string;
}

// DTOs
export interface CreateSistemaAcessoDTO {
  nome: string;
  url?: string;
  tipo?: TipoSistemaAcesso;
  responsavel_id?: string;
  observacoes?: string;
  instrucoes_acesso?: string;
  icone?: string;
}

export interface UpdateSistemaAcessoDTO {
  nome?: string;
  url?: string | null;
  tipo?: TipoSistemaAcesso;
  responsavel_id?: string | null;
  observacoes?: string | null;
  instrucoes_acesso?: string | null;
  icone?: string | null;
}

export interface CreateCredencialDTO {
  descricao?: string;
  usuario_referente_id?: string;
  usuario_referente_nome?: string;
  login: string;
  senha: string; // Sera criptografada antes de salvar
  ambiente?: AmbienteCredencial;
  observacoes?: string;
}

export interface UpdateCredencialDTO {
  descricao?: string | null;
  usuario_referente_id?: string | null;
  usuario_referente_nome?: string | null;
  login?: string;
  senha?: string; // Se fornecida, sera criptografada
  ambiente?: AmbienteCredencial;
  observacoes?: string | null;
}

export interface SistemaAcessoFiltros {
  tipo?: TipoSistemaAcesso;
  responsavel_id?: string;
  ativo?: boolean;
}
