import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { usuarioService } from './usuarioService.js';
import { JwtPayload, LoginDTO, CreateUsuarioDTO, UsuarioSemSenha } from '../types/usuario.js';

export class AuthService {
  async registrar(data: CreateUsuarioDTO): Promise<{ usuario: UsuarioSemSenha; token: string }> {
    const usuario = await usuarioService.criar(data);
    const token = this.gerarToken(usuario);

    return { usuario, token };
  }

  async login(data: LoginDTO): Promise<{ usuario: UsuarioSemSenha; token: string }> {
    const usuario = await usuarioService.buscarPorEmail(data.email);

    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await usuarioService.verificarSenha(data.senha, usuario.senha);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const usuarioSemSenha: UsuarioSemSenha = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      setor: usuario.setor,
      data_criacao: usuario.data_criacao,
      ativo: usuario.ativo,
    };

    const token = this.gerarToken(usuarioSemSenha);

    return { usuario: usuarioSemSenha, token };
  }

  gerarToken(usuario: UsuarioSemSenha): string {
    const payload: JwtPayload = {
      userId: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
  }

  verificarToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw new Error('Token inválido');
    }
  }
}

export const authService = new AuthService();
