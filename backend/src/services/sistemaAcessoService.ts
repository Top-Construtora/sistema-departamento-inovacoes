import crypto from 'crypto';
import { supabase } from '../config/database.js';
import { env } from '../config/env.js';
import {
  SistemaAcesso,
  SistemaAcessoComRelacoes,
  Credencial,
  CredencialComRelacoes,
  CreateSistemaAcessoDTO,
  UpdateSistemaAcessoDTO,
  CreateCredencialDTO,
  UpdateCredencialDTO,
  SistemaAcessoFiltros,
} from '../types/sistemaAcesso.js';

// Configuracao de criptografia
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Chave de criptografia derivada do JWT_SECRET (em producao, usar chave separada)
function getEncryptionKey(): Buffer {
  const secret = env.jwtSecret || 'default-encryption-key-change-me';
  return crypto.scryptSync(secret, 'salt', 32);
}

function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Formato: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error('Formato de dados criptografados invalido');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export class SistemaAcessoService {
  // Sistemas de Acesso
  async criarSistema(data: CreateSistemaAcessoDTO, criadoPorId: string): Promise<SistemaAcessoComRelacoes> {
    const { data: sistema, error } = await supabase
      .from('sistemas_acesso')
      .insert({
        nome: data.nome,
        url: data.url || null,
        tipo: data.tipo || 'OUTRO',
        responsavel_id: data.responsavel_id || null,
        observacoes: data.observacoes || null,
        instrucoes_acesso: data.instrucoes_acesso || null,
        icone: data.icone || null,
        criado_por_id: criadoPorId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sistema: ${error.message}`);
    }

    return this.buscarSistemaPorId(sistema.id) as Promise<SistemaAcessoComRelacoes>;
  }

  async listarSistemas(filtros?: SistemaAcessoFiltros): Promise<SistemaAcessoComRelacoes[]> {
    let query = supabase
      .from('sistemas_acesso')
      .select(`
        *,
        responsavel:usuarios!sistemas_acesso_responsavel_id_fkey(id, nome, email, perfil),
        criado_por:usuarios!sistemas_acesso_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', filtros?.ativo ?? true)
      .order('nome', { ascending: true });

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros?.responsavel_id) {
      query = query.eq('responsavel_id', filtros.responsavel_id);
    }

    const { data: sistemas, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar sistemas: ${error.message}`);
    }

    return (sistemas || []) as SistemaAcessoComRelacoes[];
  }

  async buscarSistemaPorId(id: string): Promise<SistemaAcessoComRelacoes | null> {
    const { data: sistema, error } = await supabase
      .from('sistemas_acesso')
      .select(`
        *,
        responsavel:usuarios!sistemas_acesso_responsavel_id_fkey(id, nome, email, perfil),
        criado_por:usuarios!sistemas_acesso_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error || !sistema) {
      return null;
    }

    return sistema as SistemaAcessoComRelacoes;
  }

  async atualizarSistema(id: string, data: UpdateSistemaAcessoDTO): Promise<SistemaAcessoComRelacoes | null> {
    const existente = await this.buscarSistemaPorId(id);
    if (!existente) {
      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.responsavel_id !== undefined) updateData.responsavel_id = data.responsavel_id;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
    if (data.instrucoes_acesso !== undefined) updateData.instrucoes_acesso = data.instrucoes_acesso;
    if (data.icone !== undefined) updateData.icone = data.icone;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('sistemas_acesso')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar sistema: ${error.message}`);
      }
    }

    return this.buscarSistemaPorId(id);
  }

  async excluirSistema(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sistemas_acesso')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir sistema: ${error.message}`);
    }

    return true;
  }

  // Credenciais
  async criarCredencial(
    sistemaId: string,
    data: CreateCredencialDTO,
    criadoPorId: string
  ): Promise<CredencialComRelacoes> {
    // Verificar se sistema existe
    const sistema = await this.buscarSistemaPorId(sistemaId);
    if (!sistema) {
      throw new Error('Sistema nao encontrado');
    }

    // Criptografar a senha
    const senhaCriptografada = encrypt(data.senha);

    const { data: credencial, error } = await supabase
      .from('credenciais')
      .insert({
        sistema_id: sistemaId,
        descricao: data.descricao || null,
        usuario_referente_id: data.usuario_referente_id || null,
        usuario_referente_nome: data.usuario_referente_nome || null,
        login: data.login,
        senha_criptografada: senhaCriptografada,
        ambiente: data.ambiente || 'PRODUCAO',
        observacoes: data.observacoes || null,
        criado_por_id: criadoPorId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar credencial: ${error.message}`);
    }

    return this.buscarCredencialPorId(credencial.id) as Promise<CredencialComRelacoes>;
  }

  async listarCredenciais(sistemaId: string): Promise<CredencialComRelacoes[]> {
    const { data: credenciais, error } = await supabase
      .from('credenciais')
      .select(`
        id,
        sistema_id,
        descricao,
        usuario_referente_id,
        usuario_referente_nome,
        login,
        ambiente,
        observacoes,
        criado_por_id,
        data_criacao,
        data_atualizacao,
        ativo,
        usuario_referente:usuarios!credenciais_usuario_referente_id_fkey(id, nome, email, perfil),
        criado_por:usuarios!credenciais_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('sistema_id', sistemaId)
      .eq('ativo', true)
      .order('descricao', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar credenciais: ${error.message}`);
    }

    // Nao retorna a senha por padrao
    // Supabase pode retornar relacoes como arrays, normalizar
    return (credenciais || []).map((c) => ({
      ...c,
      usuario_referente: Array.isArray(c.usuario_referente) ? c.usuario_referente[0] : c.usuario_referente,
      criado_por: Array.isArray(c.criado_por) ? c.criado_por[0] : c.criado_por,
    })) as CredencialComRelacoes[];
  }

  async buscarCredencialPorId(id: string): Promise<CredencialComRelacoes | null> {
    const { data: credencial, error } = await supabase
      .from('credenciais')
      .select(`
        id,
        sistema_id,
        descricao,
        usuario_referente_id,
        usuario_referente_nome,
        login,
        ambiente,
        observacoes,
        criado_por_id,
        data_criacao,
        data_atualizacao,
        ativo,
        usuario_referente:usuarios!credenciais_usuario_referente_id_fkey(id, nome, email, perfil),
        criado_por:usuarios!credenciais_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error || !credencial) {
      return null;
    }

    // Normalizar relacoes que podem vir como arrays
    return {
      ...credencial,
      usuario_referente: Array.isArray(credencial.usuario_referente)
        ? credencial.usuario_referente[0]
        : credencial.usuario_referente,
      criado_por: Array.isArray(credencial.criado_por)
        ? credencial.criado_por[0]
        : credencial.criado_por,
    } as CredencialComRelacoes;
  }

  async revelarSenha(credencialId: string, usuarioId: string, ipAddress?: string): Promise<string> {
    // Buscar credencial com senha criptografada
    const { data: credencial, error } = await supabase
      .from('credenciais')
      .select('senha_criptografada')
      .eq('id', credencialId)
      .eq('ativo', true)
      .single();

    if (error || !credencial) {
      throw new Error('Credencial nao encontrada');
    }

    // Registrar log de acesso
    await this.registrarLogAcesso(credencialId, usuarioId, 'VISUALIZAR_SENHA', ipAddress);

    // Descriptografar e retornar
    return decrypt(credencial.senha_criptografada);
  }

  async atualizarCredencial(
    id: string,
    data: UpdateCredencialDTO,
    usuarioId: string
  ): Promise<CredencialComRelacoes | null> {
    const existente = await this.buscarCredencialPorId(id);
    if (!existente) {
      return null;
    }

    const updateData: Record<string, unknown> = {};

    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.usuario_referente_id !== undefined) updateData.usuario_referente_id = data.usuario_referente_id;
    if (data.usuario_referente_nome !== undefined) updateData.usuario_referente_nome = data.usuario_referente_nome;
    if (data.login !== undefined) updateData.login = data.login;
    if (data.ambiente !== undefined) updateData.ambiente = data.ambiente;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

    // Se fornecida nova senha, criptografar
    if (data.senha) {
      updateData.senha_criptografada = encrypt(data.senha);
      await this.registrarLogAcesso(id, usuarioId, 'ALTERAR_SENHA');
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('credenciais')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao atualizar credencial: ${error.message}`);
      }
    }

    return this.buscarCredencialPorId(id);
  }

  async excluirCredencial(id: string, usuarioId: string): Promise<boolean> {
    await this.registrarLogAcesso(id, usuarioId, 'EXCLUIR');

    const { error } = await supabase
      .from('credenciais')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir credencial: ${error.message}`);
    }

    return true;
  }

  // Log de auditoria
  private async registrarLogAcesso(
    credencialId: string,
    usuarioId: string,
    acao: string,
    ipAddress?: string
  ): Promise<void> {
    await supabase.from('credenciais_log').insert({
      credencial_id: credencialId,
      usuario_id: usuarioId,
      acao,
      ip_address: ipAddress || null,
    });
  }

  async listarLogsCredencial(credencialId: string): Promise<unknown[]> {
    const { data: logs, error } = await supabase
      .from('credenciais_log')
      .select(`
        *,
        usuario:usuarios!credenciais_log_usuario_id_fkey(id, nome, email)
      `)
      .eq('credencial_id', credencialId)
      .order('data', { ascending: false });

    if (error) {
      return [];
    }

    return logs || [];
  }
}

export const sistemaAcessoService = new SistemaAcessoService();
