// Enums
export enum PerfilUsuario {
  LIDER = 'LIDER',
  ANALISTA = 'ANALISTA',
  EXTERNO = 'EXTERNO',
}

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

// Interfaces
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  setor?: string | null;
  data_criacao: string;
  ativo: boolean;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao?: string | null;
  objetivo?: string | null;
  tipo: TipoProjeto;
  status: StatusProjeto;
  lider_id: string;
  lider?: Usuario;
  equipe?: Usuario[];
  data_inicio?: string | null;
  data_fim_prevista?: string | null;
  risco?: NivelRisco | null;
  tags: string[];
  links_externos: { titulo: string; url: string }[];
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface Demanda {
  id: string;
  titulo: string;
  descricao?: string | null;
  tipo: TipoDemanda;
  prioridade: PrioridadeDemanda;
  status: StatusDemanda;
  projeto_id?: string | null;
  projeto?: { id: string; nome: string } | null;
  responsavel_id?: string | null;
  responsavel?: Usuario | null;
  solicitante_id: string;
  solicitante?: Usuario;
  prazo?: string | null;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

// DTOs
export interface LoginDTO {
  email: string;
  senha: string;
}

export interface CreateDemandaDTO {
  titulo: string;
  descricao?: string;
  tipo?: TipoDemanda;
  prioridade?: PrioridadeDemanda;
  projeto_id?: string;
  responsavel_id?: string;
  prazo?: string;
}

export interface UpdateDemandaDTO extends Partial<CreateDemandaDTO> {
  status?: StatusDemanda;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

// Chamados
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

export interface ChamadoComentario {
  id: string;
  chamado_id: string;
  autor_id: string;
  autor?: Usuario;
  mensagem: string;
  interno: boolean;
  data: string;
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
  solicitante?: Usuario;
  responsavel_id?: string | null;
  responsavel?: Usuario | null;
  setor_solicitante?: string | null;
  data_abertura: string;
  data_fechamento?: string | null;
  avaliacao_nota?: number | null;
  avaliacao_comentario?: string | null;
  data_atualizacao: string;
  comentarios?: ChamadoComentario[];
  ativo: boolean;
}

export interface CreateChamadoDTO {
  titulo: string;
  descricao: string;
  categoria?: CategoriaChamado;
  prioridade?: PrioridadeDemanda;
  setor_solicitante?: string;
}

export interface AvaliacaoDTO {
  nota: number;
  comentario?: string;
}

// Sistemas de Acesso
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
  responsavel?: Usuario | null;
  observacoes?: string | null;
  instrucoes_acesso?: string | null;
  icone?: string | null;
  criado_por_id: string;
  criado_por?: Usuario;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface Credencial {
  id: string;
  sistema_id: string;
  descricao?: string | null;
  usuario_referente_id?: string | null;
  usuario_referente_nome?: string | null;
  usuario_referente?: Usuario | null;
  login: string;
  ambiente: AmbienteCredencial;
  observacoes?: string | null;
  criado_por_id: string;
  criado_por?: Usuario;
  data_criacao: string;
  data_atualizacao: string;
  ativo: boolean;
}

export interface CreateSistemaAcessoDTO {
  nome: string;
  url?: string;
  tipo?: TipoSistemaAcesso;
  responsavel_id?: string;
  observacoes?: string;
  instrucoes_acesso?: string;
  icone?: string;
}

export interface CreateCredencialDTO {
  descricao?: string;
  usuario_referente_id?: string;
  usuario_referente_nome?: string;
  login: string;
  senha: string;
  ambiente?: AmbienteCredencial;
  observacoes?: string;
}

// Identidade Visual
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

export interface IdentidadeVisualConfig {
  id: string;
  descricao?: string | null;
  missao?: string | null;
  visao?: string | null;
  valores?: string | null;
  guidelines_url?: string | null;
  data_atualizacao: string;
}

export interface Logo {
  id: string;
  nome: string;
  tipo: TipoLogo;
  arquivo_url: string;
  descricao?: string | null;
  formato?: string | null;
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
  fonte_google?: string | null;
  descricao?: string | null;
  exemplo?: string | null;
  ordem: number;
  ativo: boolean;
}

export interface TemplateArquivo {
  id: string;
  nome: string;
  tipo: TipoTemplate;
  arquivo_url: string;
  descricao?: string | null;
  formato?: string | null;
  preview_url?: string | null;
  downloads: number;
  ordem: number;
  ativo: boolean;
}

export interface IdentidadeVisualCompleta {
  identidade: IdentidadeVisualConfig | null;
  logos: Logo[];
  cores: PaletaCor[];
  fontes: FonteTipografica[];
  templates: TemplateArquivo[];
}

export interface CreateLogoDTO {
  nome: string;
  tipo: TipoLogo;
  arquivo_url: string;
  descricao?: string;
}

export interface CreateCorDTO {
  nome: string;
  codigo_hex: string;
  descricao?: string;
  categoria?: string;
}

export interface CreateFonteDTO {
  nome: string;
  uso: UsoFonte;
  familia?: string;
  fonte_google?: string;
  descricao?: string;
}

export interface CreateTemplateDTO {
  nome: string;
  tipo: TipoTemplate;
  arquivo_url: string;
  descricao?: string;
  preview_url?: string;
}

// Metrics Types
export interface ResumoGeral {
  projetos_ativos: number;
  projetos_total: number;
  demandas_abertas: number;
  demandas_total: number;
  chamados_abertos: number;
  chamados_total: number;
  chamados_atrasados: number;
  usuarios_ativos: number;
  tempo_medio_resolucao_dias: number | null;
}

export interface ChamadosPorSetor {
  setor: string;
  total: number;
  abertos: number;
  concluidos: number;
}

export interface ProjetosPorStatus {
  status: string;
  total: number;
  percentual: number;
}

export interface ProjetosPorTipo {
  tipo: string;
  total: number;
  percentual: number;
}

export interface TempoMedioResolucao {
  periodo: string;
  tempo_medio_horas: number;
  tempo_medio_dias: number;
  total_resolvidos: number;
}

export interface DemandasPorResponsavel {
  responsavel_id: string | null;
  responsavel_nome: string;
  total: number;
  a_fazer: number;
  em_andamento: number;
  concluidas: number;
}

export interface DemandasPorPrioridade {
  prioridade: string;
  total: number;
  percentual: number;
}

export interface ChamadosPorCategoria {
  categoria: string;
  total: number;
  percentual: number;
}

export interface ChamadosPorStatus {
  status: string;
  total: number;
  percentual: number;
}

export interface EvolucaoMensal {
  mes: string;
  ano: number;
  projetos_criados: number;
  demandas_criadas: number;
  chamados_abertos: number;
  chamados_fechados: number;
}

export interface TopProjetos {
  projeto_id: string;
  projeto_nome: string;
  total_demandas: number;
  demandas_concluidas: number;
  percentual_conclusao: number;
}
