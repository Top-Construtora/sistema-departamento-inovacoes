import { UsuarioSemSenha } from './usuario.js';

export interface Nota {
  id: string;
  autor_id: string;
  conteudo: string;
  editada: boolean;
  data_envio: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface NotaComRelacoes extends Nota {
  autor?: UsuarioSemSenha;
  anexos?: NotaAnexo[];
}

export interface NotaAnexo {
  id: string;
  nota_id: string;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_bytes: number;
  url: string;
  data_upload: string;
}

export interface CreateNotaDTO {
  conteudo: string;
}

export interface UpdateNotaDTO {
  conteudo: string;
}
