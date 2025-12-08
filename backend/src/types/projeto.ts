import { UsuarioSemSenha } from './usuario.js';

export enum TipoProjeto {
  SISTEMA_INTERNO = 'SISTEMA_INTERNO',
  AUTOMACAO = 'AUTOMACAO',
  PESQUISA = 'PESQUISA',
  INTEGRACAO = 'INTEGRACAO',
  MELHORIA = 'MELHORIA',
  OUTRO = 'OUTRO',
}

export enum StatusProjeto {
  IDEIA = 'IDEIA',
  EM_ANALISE = 'EM_ANALISE',
  EM_DESENVOLVIMENTO = 'EM_DESENVOLVIMENTO',
  EM_TESTES = 'EM_TESTES',
  EM_PRODUCAO = 'EM_PRODUCAO',
  ARQUIVADO = 'ARQUIVADO',
}

export enum NivelRisco {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

export interface LinkExterno {
  titulo: string;
  url: string;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao?: string | null;
  objetivo?: string | null;
  tipo: TipoProjeto;
  status: StatusProjeto;
  lider_id: string;
  data_inicio?: string | null;
  data_fim_prevista?: string | null;
  risco?: NivelRisco | null;
  tags: string[];
  links_externos: LinkExterno[];
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface ProjetoComRelacoes extends Projeto {
  lider?: UsuarioSemSenha;
  equipe?: UsuarioSemSenha[];
}

export interface CreateProjetoDTO {
  nome: string;
  descricao?: string;
  objetivo?: string;
  tipo?: TipoProjeto;
  status?: StatusProjeto;
  lider_id: string;
  data_inicio?: string;
  data_fim_prevista?: string;
  risco?: NivelRisco;
  tags?: string[];
  links_externos?: LinkExterno[];
  equipe_ids?: string[];
}

export interface UpdateProjetoDTO {
  nome?: string;
  descricao?: string;
  objetivo?: string;
  tipo?: TipoProjeto;
  status?: StatusProjeto;
  lider_id?: string;
  data_inicio?: string;
  data_fim_prevista?: string;
  risco?: NivelRisco;
  tags?: string[];
  links_externos?: LinkExterno[];
  equipe_ids?: string[];
}

export interface ProjetoFiltros {
  status?: StatusProjeto;
  lider_id?: string;
  tipo?: TipoProjeto;
  tag?: string;
  ativo?: boolean;
}
