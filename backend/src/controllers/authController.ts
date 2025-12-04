import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { usuarioService } from '../services/usuarioService.js';
import { CreateUsuarioDTO, LoginDTO, PerfilUsuario } from '../types/usuario.js';

export class AuthController {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, perfil, setor } = req.body as CreateUsuarioDTO;

      if (!nome || !email || !senha) {
        res.status(400).json({
          success: false,
          error: 'Nome, email e senha são obrigatórios',
        });
        return;
      }

      if (senha.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Senha deve ter pelo menos 6 caracteres',
        });
        return;
      }

      const perfisValidos = Object.values(PerfilUsuario);
      if (perfil && !perfisValidos.includes(perfil)) {
        res.status(400).json({
          success: false,
          error: `Perfil inválido. Use: ${perfisValidos.join(', ')}`,
        });
        return;
      }

      const resultado = await authService.registrar({
        nome,
        email,
        senha,
        perfil,
        setor,
      });

      res.status(201).json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body as LoginDTO;

      if (!email || !senha) {
        res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios',
        });
        return;
      }

      const resultado = await authService.login({ email, senha });

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      res.status(401).json({
        success: false,
        error: message,
      });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({
          success: false,
          error: 'Não autenticado',
        });
        return;
      }

      const usuario = await usuarioService.buscarPorId(req.usuario.userId);

      if (!usuario) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}

export const authController = new AuthController();
