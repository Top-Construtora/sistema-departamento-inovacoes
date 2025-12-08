// Audit Log Types

export enum AcaoAuditoria {
  // Auth
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FALHOU = 'LOGIN_FALHOU',

  // Projetos
  PROJETO_CRIAR = 'PROJETO_CRIAR',
  PROJETO_ATUALIZAR = 'PROJETO_ATUALIZAR',
  PROJETO_EXCLUIR = 'PROJETO_EXCLUIR',

  // Demandas
  DEMANDA_CRIAR = 'DEMANDA_CRIAR',
  DEMANDA_ATUALIZAR = 'DEMANDA_ATUALIZAR',
  DEMANDA_MOVER = 'DEMANDA_MOVER',
  DEMANDA_EXCLUIR = 'DEMANDA_EXCLUIR',

  // Chamados
  CHAMADO_CRIAR = 'CHAMADO_CRIAR',
  CHAMADO_ATUALIZAR = 'CHAMADO_ATUALIZAR',
  CHAMADO_STATUS_ALTERAR = 'CHAMADO_STATUS_ALTERAR',
  CHAMADO_ATRIBUIR = 'CHAMADO_ATRIBUIR',
  CHAMADO_COMENTAR = 'CHAMADO_COMENTAR',
  CHAMADO_AVALIAR = 'CHAMADO_AVALIAR',

  // Sistemas de Acesso
  SISTEMA_CRIAR = 'SISTEMA_CRIAR',
  SISTEMA_ATUALIZAR = 'SISTEMA_ATUALIZAR',
  SISTEMA_EXCLUIR = 'SISTEMA_EXCLUIR',

  // Credenciais (operacoes sensiveis)
  CREDENCIAL_CRIAR = 'CREDENCIAL_CRIAR',
  CREDENCIAL_ATUALIZAR = 'CREDENCIAL_ATUALIZAR',
  CREDENCIAL_EXCLUIR = 'CREDENCIAL_EXCLUIR',
  CREDENCIAL_VISUALIZAR_SENHA = 'CREDENCIAL_VISUALIZAR_SENHA',

  // Identidade Visual
  IDENTIDADE_ATUALIZAR = 'IDENTIDADE_ATUALIZAR',
  LOGO_CRIAR = 'LOGO_CRIAR',
  LOGO_EXCLUIR = 'LOGO_EXCLUIR',
  COR_CRIAR = 'COR_CRIAR',
  COR_EXCLUIR = 'COR_EXCLUIR',
}

export enum TipoRecurso {
  USUARIO = 'USUARIO',
  PROJETO = 'PROJETO',
  DEMANDA = 'DEMANDA',
  CHAMADO = 'CHAMADO',
  SISTEMA_ACESSO = 'SISTEMA_ACESSO',
  CREDENCIAL = 'CREDENCIAL',
  IDENTIDADE_VISUAL = 'IDENTIDADE_VISUAL',
}

export interface AuditLog {
  id: string;
  usuario_id: string | null;
  usuario_email?: string;
  acao: AcaoAuditoria;
  recurso_tipo: TipoRecurso;
  recurso_id?: string | null;
  recurso_nome?: string | null;
  detalhes?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  data_hora: string;
}

export interface CreateAuditLogDTO {
  usuario_id?: string | null;
  usuario_email?: string;
  acao: AcaoAuditoria;
  recurso_tipo: TipoRecurso;
  recurso_id?: string;
  recurso_nome?: string;
  detalhes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLogFiltros {
  usuario_id?: string;
  acao?: AcaoAuditoria;
  recurso_tipo?: TipoRecurso;
  recurso_id?: string;
  data_inicio?: string;
  data_fim?: string;
}
