import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { Usuario, UsuarioSemSenha, CreateUsuarioDTO, PerfilUsuario } from '../types/usuario.js';

// Cost factor para bcrypt (12 = ~300ms, equilibrio entre seguranca e performance)
const BCRYPT_SALT_ROUNDS = 12;

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
      })
      .select('id, nome, email, perfil, setor, data_criacao, ativo')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Email já cadastrado');
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return usuario as UsuarioSemSenha;
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
      .select('id, nome, email, perfil, setor, data_criacao, ativo')
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error || !usuario) {
      return null;
    }

    return usuario as UsuarioSemSenha;
  }

  async verificarSenha(senha: string, senhaHash: string): Promise<boolean> {
    return bcrypt.compare(senha, senhaHash);
  }
}

export const usuarioService = new UsuarioService();
