import { Request, Response } from 'express';
import { usuarioService } from '../services/usuarioService.js';
import { PerfilUsuario } from '../types/usuario.js';

export class UsuarioController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, perfil, setor } = req.body;

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
          error: 'Senha deve ter no mínimo 6 caracteres',
        });
        return;
      }

      if (perfil && !Object.values(PerfilUsuario).includes(perfil)) {
        res.status(400).json({
          success: false,
          error: `Perfil inválido. Use: ${Object.values(PerfilUsuario).join(', ')}`,
        });
        return;
      }

      const usuario = await usuarioService.criar({
        nome,
        email,
        senha,
        perfil: perfil || PerfilUsuario.EXTERNO,
        setor: setor || null,
        deve_trocar_senha: true, // Usuário criado internamente deve trocar senha no primeiro login
      });

      res.status(201).json({
        success: true,
        data: usuario,
        message: 'Usuário criado com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar usuário';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { perfil, ativo, internos } = req.query;

      const filtros: { perfil?: PerfilUsuario; ativo?: boolean; internos?: boolean } = {};

      if (perfil && Object.values(PerfilUsuario).includes(perfil as PerfilUsuario)) {
        filtros.perfil = perfil as PerfilUsuario;
      }

      if (ativo !== undefined) {
        filtros.ativo = ativo === 'true';
      }

      if (internos === 'true') {
        filtros.internos = true;
      }

      const usuarios = await usuarioService.listar(filtros);

      res.json({
        success: true,
        data: usuarios,
        total: usuarios.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar usuários';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const usuario = await usuarioService.buscarPorId(id);

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

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validar perfil se fornecido
      if (data.perfil && !Object.values(PerfilUsuario).includes(data.perfil)) {
        res.status(400).json({
          success: false,
          error: `Perfil inválido. Use: ${Object.values(PerfilUsuario).join(', ')}`,
        });
        return;
      }

      const usuario = await usuarioService.atualizar(id, data);

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
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async alterarStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      if (typeof ativo !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Campo ativo é obrigatório e deve ser booleano',
        });
        return;
      }

      const usuario = await usuarioService.alterarStatus(id, ativo);

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
        message: ativo ? 'Usuário ativado com sucesso' : 'Usuário desativado com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar status do usuário';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async resetarSenha(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { novaSenha } = req.body;

      if (!novaSenha || novaSenha.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Senha deve ter no mínimo 6 caracteres',
        });
        return;
      }

      await usuarioService.resetarSenha(id, novaSenha);

      res.json({
        success: true,
        message: 'Senha resetada com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao resetar senha';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}

export const usuarioController = new UsuarioController();
