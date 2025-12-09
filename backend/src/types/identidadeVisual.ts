import { UsuarioSemSenha } from './usuario.js';

export enum TipoLogo {
  PRINCIPAL = 'PRINCIPAL',
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  ICONE = 'ICONE',
  MONOCROMATICO = 'MONOCROMATICO',
  PB = 'PB',
  NEGATIVO = 'NEGATIVO',
  SIMPLIFICADO = 'SIMPLIFICADO',
}

export enum UsoFonte {
  GERAL = 'GERAL',
  TITULO = 'TITULO',
  SUBTITULO = 'SUBTITULO',
  CORPO = 'CORPO',
  DESTAQUE = 'DESTAQUE',
  CODIGO = 'CODIGO',
  DECORATIVO = 'DECORATIVO',
}

export enum TipoTemplate {
  SLIDE = 'SLIDE',
  DOCUMENTO = 'DOCUMENTO',
  ASSINATURA_EMAIL = 'ASSINATURA_EMAIL',
  PAPEL_TIMBRADO = 'PAPEL_TIMBRADO',
  CARTAO_VISITA = 'CARTAO_VISITA',
  BANNER = 'BANNER',
  POST_SOCIAL = 'POST_SOCIAL',
  RELATORIO = 'RELATORIO',
  OUTRO = 'OUTRO',
}

export interface IdentidadeVisual {
  id: string;
  descricao?: string | null;
  missao?: string | null;
  visao?: string | null;
  valores?: string | null;
  guidelines_url?: string | null;
  atualizado_por_id?: string | null;
  atualizado_por?: UsuarioSemSenha | null;
  data_atualizacao: string;
}

export interface Logo {
  id: string;
  nome: string;
  tipo: TipoLogo;
  arquivo_url: string;
  descricao?: string | null;
  formato?: string | null;
  tamanho_bytes?: number | null;
  criado_por_id: string;
  criado_por?: UsuarioSemSenha;
  data_criacao: string;
  ordem: number;
  ativo: boolean;
}

export interface PaletaCor {
  id: string;
  nome: string;
  codigo_hex: string;
  descricao?: string | null;
  categoria?: string | null;
  rgb?: string | null;
  cmyk?: string | null;
  pantone?: string | null;
  ordem: number;
  criado_por_id: string;
  criado_por?: UsuarioSemSenha;
  data_criacao: string;
  ativo: boolean;
}

export interface FonteTipografica {
  id: string;
  nome: string;
  familia?: string | null;
  uso: UsoFonte;
  peso?: string | null;
  estilo?: string | null;
  arquivo_url?: string | null;
  fonte_url?: string | null;
  descricao?: string | null;
  exemplo?: string | null;
  ordem: number;
  criado_por_id: string;
  criado_por?: UsuarioSemSenha;
  data_criacao: string;
  ativo: boolean;
}

export interface TemplateArquivo {
  id: string;
  nome: string;
  tipo: TipoTemplate;
  arquivo_url: string;
  descricao?: string | null;
  formato?: string | null;
  tamanho_bytes?: number | null;
  preview_url?: string | null;
  downloads: number;
  ordem: number;
  criado_por_id: string;
  criado_por?: UsuarioSemSenha;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

// DTOs
export interface UpdateIdentidadeVisualDTO {
  descricao?: string | null;
  missao?: string | null;
  visao?: string | null;
  valores?: string | null;
  guidelines_url?: string | null;
}

export interface CreateLogoDTO {
  nome: string;
  tipo: TipoLogo;
  arquivo_url: string;
  descricao?: string;
  formato?: string;
  tamanho_bytes?: number;
  ordem?: number;
}

export interface CreatePaletaCorDTO {
  nome: string;
  codigo_hex: string;
  descricao?: string;
  categoria?: string;
  rgb?: string;
  cmyk?: string;
  pantone?: string;
  ordem?: number;
}

export interface CreateFonteDTO {
  nome: string;
  uso: UsoFonte;
  fonte_url?: string;
  descricao?: string;
  ordem?: number;
}

export interface CreateTemplateDTO {
  nome: string;
  tipo: TipoTemplate;
  arquivo_url: string;
  descricao?: string;
  formato?: string;
  tamanho_bytes?: number;
  preview_url?: string;
  ordem?: number;
}
