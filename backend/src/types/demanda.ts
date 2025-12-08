import { UsuarioSemSenha } from './usuario.js';
import { Projeto } from './projeto.js';

export enum TipoDemanda {
  BUG = 'BUG',
  MELHORIA = 'MELHORIA',
  NOVA_FEATURE = 'NOVA_FEATURE',
  ESTUDO = 'ESTUDO',
  SUPORTE_INTERNO = 'SUPORTE_INTERNO',
  DOCUMENTACAO = 'DOCUMENTACAO',
  OUTRO = 'OUTRO',
}

export enum PrioridadeDemanda {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum StatusDemanda {
  A_FAZER = 'A_FAZER',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  EM_VALIDACAO = 'EM_VALIDACAO',
  CONCLUIDA = 'CONCLUIDA',
}

export interface Demanda {
  id: string;
  titulo: string;
  descricao?: string | null;
  tipo: TipoDemanda;
  prioridade: PrioridadeDemanda;
  status: StatusDemanda;
  projeto_id?: string | null;
  responsavel_id?: string | null;
  solicitante_id: string;
  prazo?: string | null;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface DemandaComRelacoes extends Demanda {
  projeto?: Pick<Projeto, 'id' | 'nome'> | null;
  responsavel?: UsuarioSemSenha | null;
  solicitante?: UsuarioSemSenha;
}

export interface CreateDemandaDTO {
  titulo: string;
  descricao?: string;
  tipo?: TipoDemanda;
  prioridade?: PrioridadeDemanda;
  status?: StatusDemanda;
  projeto_id?: string;
  responsavel_id?: string;
  solicitante_id: string;
  prazo?: string;
}

export interface UpdateDemandaDTO {
  titulo?: string;
  descricao?: string;
  tipo?: TipoDemanda;
  prioridade?: PrioridadeDemanda;
  status?: StatusDemanda;
  projeto_id?: string | null;
  responsavel_id?: string | null;
  prazo?: string | null;
}

export interface UpdateStatusDTO {
  status: StatusDemanda;
}

export interface DemandaFiltros {
  status?: StatusDemanda;
  prioridade?: PrioridadeDemanda;
  responsavel_id?: string;
  solicitante_id?: string;
  projeto_id?: string;
  tipo?: TipoDemanda;
  ativo?: boolean;
}
