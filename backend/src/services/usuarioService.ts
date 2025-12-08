import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { Usuario, UsuarioSemSenha, CreateUsuarioDTO, PerfilUsuario } from '../types/usuario.js';

// Cost factor para bcrypt (12 = ~300ms, equilibrio entre seguranca e performance)
const BCRYPT_SALT_ROUNDS = 12;

interface UsuarioFiltros {
  perfil?: PerfilUsuario;
  ativo?: boolean;
  internos?: boolean;
}

interface UpdateUsuarioDTO {
  nome?: string;
  perfil?: PerfilUsuario;
  setor?: string | null;
}

export class UsuarioService {
  async criar(data: CreateUsuarioDTO): Promise<UsuarioSemSenha> {
    // Hash da senha com cost factor seguro
    const senhaHash = await bcrypt.hash(data.senha, BCRYPT_SALT_ROUNDS);

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert({
        nome: data.nome,
        email: data.email.toLowerCase(),
        senha: senhaHash,
        perfil: data.perfil || PerfilUsuario.EXTERNO,
        setor: data.setor || null,
        deve_trocar_senha: data.deve_trocar_senha ?? false,
      })
      .select('id, nome, email, perfil, setor, data_criacao, ativo, deve_trocar_senha')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Email já cadastrado');
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return usuario as UsuarioSemSenha;
  }

  async listar(filtros: UsuarioFiltros = {}): Promise<UsuarioSemSenha[]> {
    let query = supabase
      .from('usuarios')
      .select('id, nome, email, perfil, setor, data_criacao, ativo, deve_trocar_senha')
      .order('nome', { ascending: true });

    if (filtros.perfil) {
      query = query.eq('perfil', filtros.perfil);
    }

    if (filtros.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }

    if (filtros.internos) {
      query = query.in('perfil', [PerfilUsuario.LIDER, PerfilUsuario.ANALISTA]);
    }

    const { data: usuarios, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar usuários: ${error.message}`);
    }

    return (usuarios || []) as UsuarioSemSenha[];
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('ativo', true)
      .single();

    if (error || !usuario) {
      return null;
    }

    return usuario as Usuario;
  }

  async buscarPorId(id: string): Promise<UsuarioSemSenha | null> {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, perfil, setor, data_criacao, ativo, deve_trocar_senha')
      .eq('id', id)
      .single();

    if (error || !usuario) {
      return null;
    }

    return usuario as UsuarioSemSenha;
  }

  async atualizar(id: string, data: UpdateUsuarioDTO): Promise<UsuarioSemSenha | null> {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update(data)
      .eq('id', id)
      .select('id, nome, email, perfil, setor, data_criacao, ativo, deve_trocar_senha')
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return usuario as UsuarioSemSenha;
  }

  async alterarStatus(id: string, ativo: boolean): Promise<UsuarioSemSenha | null> {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update({ ativo })
      .eq('id', id)
      .select('id, nome, email, perfil, setor, data_criacao, ativo, deve_trocar_senha')
      .single();

    if (error) {
      throw new Error(`Erro ao alterar status do usuário: ${error.message}`);
    }

    return usuario as UsuarioSemSenha;
  }

  async resetarSenha(id: string, novaSenha: string): Promise<void> {
    const senhaHash = await bcrypt.hash(novaSenha, BCRYPT_SALT_ROUNDS);

    const { error } = await supabase
      .from('usuarios')
      .update({ senha: senhaHash })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao resetar senha: ${error.message}`);
    }
  }

  async definirSenhaPrimeiroAcesso(id: string, novaSenha: string): Promise<UsuarioSemSenha> {
    const senhaHash = await bcrypt.hash(novaSenha, BCRYPT_SALT_ROUNDS);

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update({ senha: senhaHash, deve_trocar_senha: false })
      .eq('id', id)
      .select('id, nome, email, perfil, setor, data_criacao, ativo, deve_trocar_senha')
      .single();

    if (error) {
      throw new Error(`Erro ao definir senha: ${error.message}`);
    }

    return usuario as UsuarioSemSenha;
  }

  async verificarSenha(senha: string, senhaHash: string): Promise<boolean> {
    return bcrypt.compare(senha, senhaHash);
  }
}

export const usuarioService = new UsuarioService();
