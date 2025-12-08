import { UsuarioSemSenha } from './usuario.js';

export enum CategoriaPortfolio {
  AUTOMACAO = 'AUTOMACAO',
  SISTEMA_INTERNO = 'SISTEMA_INTERNO',
  APLICATIVO = 'APLICATIVO',
  INFRA = 'INFRA',
  PESQUISA = 'PESQUISA',
  INTEGRACAO = 'INTEGRACAO',
  DASHBOARD = 'DASHBOARD',
  OUTRO = 'OUTRO',
}

export interface KPIImpacto {
  nome: string;
  valor: number;
  unidade: string;
  descricao?: string;
}

export interface MembroEquipePortfolio {
  usuario_id: string;
  funcao?: string;
  usuario?: UsuarioSemSenha;
}

export interface PortfolioImagem {
  id: string;
  portfolio_projeto_id: string;
  nome: string;
  url: string;
  tipo?: string;
  descricao?: string;
  ordem: number;
  data_upload: string;
}

export interface PortfolioVersao {
  id: string;
  portfolio_projeto_id: string;
  numero_versao: string;
  descricao?: string;
  alteracoes?: Record<string, unknown>;
  criado_por_id?: string;
  criado_por?: UsuarioSemSenha;
  data: string;
}

export interface PortfolioProjeto {
  id: string;
  nome: string;
  descricao_resumida?: string | null;
  problema?: string | null;
  solucao?: string | null;
  tecnologias: string[];
  setores_beneficiados: string[];
  data_conclusao?: string | null;
  impacto_qualitativo?: string | null;
  impacto_quantitativo: KPIImpacto[];
  horas_economizadas?: number | null;
  impacto_financeiro_estimado?: number | null;
  categoria: CategoriaPortfolio;
  projeto_origem_id?: string | null;
  criado_por_id: string;
  data_criacao: string;
  data_atualizacao: string;
  publicado: boolean;
  ativo: boolean;
}

export interface PortfolioProjetoComRelacoes extends PortfolioProjeto {
  equipe?: MembroEquipePortfolio[];
  imagens?: PortfolioImagem[];
  versoes?: PortfolioVersao[];
  criado_por?: UsuarioSemSenha;
}

export interface CreatePortfolioDTO {
  nome: string;
  descricao_resumida?: string;
  problema?: string;
  solucao?: string;
  tecnologias?: string[];
  setores_beneficiados?: string[];
  data_conclusao?: string;
  impacto_qualitativo?: string;
  impacto_quantitativo?: KPIImpacto[];
  horas_economizadas?: number;
  impacto_financeiro_estimado?: number;
  categoria?: CategoriaPortfolio;
  projeto_origem_id?: string;
  publicado?: boolean;
  equipe?: { usuario_id: string; funcao?: string }[];
}

export interface UpdatePortfolioDTO {
  nome?: string;
  descricao_resumida?: string | null;
  problema?: string | null;
  solucao?: string | null;
  tecnologias?: string[];
  setores_beneficiados?: string[];
  data_conclusao?: string | null;
  impacto_qualitativo?: string | null;
  impacto_quantitativo?: KPIImpacto[];
  horas_economizadas?: number | null;
  impacto_financeiro_estimado?: number | null;
  categoria?: CategoriaPortfolio;
  projeto_origem_id?: string | null;
  publicado?: boolean;
  equipe?: { usuario_id: string; funcao?: string }[];
}

export interface CreateVersaoDTO {
  numero_versao: string;
  descricao?: string;
  alteracoes?: Record<string, unknown>;
}

export interface PortfolioFiltros {
  categoria?: CategoriaPortfolio;
  publicado?: boolean;
  tecnologia?: string;
  setor?: string;
  ativo?: boolean;
}
