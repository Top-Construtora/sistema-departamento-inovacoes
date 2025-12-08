import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { usuarioService } from '../services/usuarioService.js';
import { auditService } from '../services/auditService.js';
import { CreateUsuarioDTO, LoginDTO, PerfilUsuario } from '../types/usuario.js';

// Mensagens de erro padronizadas (nunca revelar se email existe ou nao)
const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  MISSING_FIELDS: 'Email e senha são obrigatórios',
  REGISTRATION_FAILED: 'Erro ao registrar usuário',
} as const;

// Regex para validacao basica de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthController {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, perfil, setor } = req.body as CreateUsuarioDTO;

      // Validacao de campos obrigatorios
      if (!nome || !email || !senha) {
        res.status(400).json({
          success: false,
          error: 'Nome, email e senha são obrigatórios',
        });
        return;
      }

      // Validacao de formato de email
      if (!EMAIL_REGEX.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Formato de email inválido',
        });
        return;
      }

      // Validacao de forca da senha
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
      // Log interno do erro real (nunca expor ao cliente)
      console.error('[AUTH] Erro no registro:', error instanceof Error ? error.message : error);

      // Mensagem para o cliente (pode revelar "email ja cadastrado" pois e validacao)
      const message = error instanceof Error ? error.message : AUTH_ERRORS.REGISTRATION_FAILED;
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];

    try {
      const { email, senha } = req.body as LoginDTO;

      // Validacao de campos obrigatorios
      if (!email || !senha) {
        res.status(400).json({
          success: false,
          error: AUTH_ERRORS.MISSING_FIELDS,
        });
        return;
      }

      // Validacao de formato de email (evita queries desnecessarias)
      if (!EMAIL_REGEX.test(email)) {
        // Log interno - nao revelar ao cliente que o formato esta errado
        console.error('[AUTH] Tentativa de login com email mal formatado');
        res.status(401).json({
          success: false,
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
        });
        return;
      }

      const resultado = await authService.login({ email, senha });

      // Log de login bem sucedido
      await auditService.logLogin(resultado.usuario.id, email, ip, userAgent);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      // Log interno do erro real (NUNCA expor ao cliente)
      console.error('[AUTH] Falha no login:', error instanceof Error ? error.message : 'Erro desconhecido');

      // Log de auditoria com motivo generico (sem expor detalhes)
      const { email } = req.body as LoginDTO;
      if (email && EMAIL_REGEX.test(email)) {
        // Usar motivo generico no log de auditoria tambem
        await auditService.logLoginFalhou(email, 'Credenciais invalidas', ip, userAgent);
      }

      // SEMPRE retornar mensagem generica ao cliente
      // Nunca revelar se o email existe ou se a senha esta errada
      res.status(401).json({
        success: false,
        error: AUTH_ERRORS.INVALID_CREDENTIALS,
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
