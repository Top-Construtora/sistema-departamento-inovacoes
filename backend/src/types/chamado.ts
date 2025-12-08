import { UsuarioSemSenha } from './usuario.js';
import { PrioridadeDemanda } from './demanda.js';

export enum CategoriaChamado {
  PROBLEMA = 'PROBLEMA',
  MELHORIA = 'MELHORIA',
  REQUISICAO_ACESSO = 'REQUISICAO_ACESSO',
  AUTOMACAO = 'AUTOMACAO',
  CONSULTORIA = 'CONSULTORIA',
  OUTROS = 'OUTROS',
}

export enum StatusChamado {
  NOVO = 'NOVO',
  EM_TRIAGEM = 'EM_TRIAGEM',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  AGUARDANDO_USUARIO = 'AGUARDANDO_USUARIO',
  EM_VALIDACAO = 'EM_VALIDACAO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  REABERTO = 'REABERTO',
}

export interface Chamado {
  id: string;
  numero_protocolo: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeDemanda;
  status: StatusChamado;
  solicitante_id: string;
  responsavel_id?: string | null;
  setor_solicitante?: string | null;
  data_abertura: string;
  data_fechamento?: string | null;
  avaliacao_nota?: number | null;
  avaliacao_comentario?: string | null;
  data_atualizacao: string;
  ativo: boolean;
}

export interface ChamadoComRelacoes extends Chamado {
  solicitante?: UsuarioSemSenha;
  responsavel?: UsuarioSemSenha | null;
  comentarios?: ChamadoComentario[];
}

export interface ChamadoComentario {
  id: string;
  chamado_id: string;
  autor_id: string;
  autor?: UsuarioSemSenha;
  mensagem: string;
  interno: boolean;
  data: string;
}

export interface CreateChamadoDTO {
  titulo: string;
  descricao: string;
  categoria?: CategoriaChamado;
  prioridade?: PrioridadeDemanda;
  setor_solicitante?: string;
}

export interface UpdateChamadoDTO {
  titulo?: string;
  descricao?: string;
  categoria?: CategoriaChamado;
  prioridade?: PrioridadeDemanda;
  responsavel_id?: string | null;
  setor_solicitante?: string;
}

export interface UpdateStatusChamadoDTO {
  status: StatusChamado;
}

export interface CreateComentarioDTO {
  mensagem: string;
  interno?: boolean;
}

export interface AvaliacaoDTO {
  nota: number;
  comentario?: string;
}

export interface ChamadoFiltros {
  status?: StatusChamado;
  categoria?: CategoriaChamado;
  prioridade?: PrioridadeDemanda;
  solicitante_id?: string;
  responsavel_id?: string;
  ativo?: boolean;
}

export { PrioridadeDemanda };
