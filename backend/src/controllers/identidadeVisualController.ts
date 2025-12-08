import { Request, Response } from 'express';
import { identidadeVisualService } from '../services/identidadeVisualService.js';
import {
  UpdateIdentidadeVisualDTO,
  CreateLogoDTO,
  CreatePaletaCorDTO,
  CreateFonteDTO,
  CreateTemplateDTO,
  TipoLogo,
  UsoFonte,
  TipoTemplate,
} from '../types/identidadeVisual.js';

export class IdentidadeVisualController {
  // Buscar tudo
  async buscarTudo(req: Request, res: Response): Promise<void> {
    try {
      const dados = await identidadeVisualService.buscarTudo();

      res.json({
        success: true,
        data: dados,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar identidade visual';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // Identidade Visual Config
  async buscarIdentidade(req: Request, res: Response): Promise<void> {
    try {
      const identidade = await identidadeVisualService.buscarIdentidade();

      res.json({
        success: true,
        data: identidade,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar identidade';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizarIdentidade(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as UpdateIdentidadeVisualDTO;
      const usuarioId = req.usuario!.userId;

      const identidade = await identidadeVisualService.atualizarIdentidade(dados, usuarioId);

      res.json({
        success: true,
        data: identidade,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar identidade';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  // Logos
  async listarLogos(req: Request, res: Response): Promise<void> {
    try {
      const logos = await identidadeVisualService.listarLogos();

      res.json({
        success: true,
        data: logos,
        total: logos.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar logos';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async criarLogo(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as CreateLogoDTO;
      const usuarioId = req.usuario!.userId;

      if (!dados.nome || !dados.arquivo_url) {
        res.status(400).json({
          success: false,
          error: 'Nome e URL do arquivo são obrigatórios',
        });
        return;
      }

      if (!dados.tipo || !Object.values(TipoLogo).includes(dados.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoLogo).join(', ')}`,
        });
        return;
      }

      const logo = await identidadeVisualService.criarLogo(dados, usuarioId);

      res.status(201).json({
        success: true,
        data: logo,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar logo';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluirLogo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await identidadeVisualService.excluirLogo(id);

      res.json({
        success: true,
        message: 'Logo excluído com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir logo';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // Cores
  async listarCores(req: Request, res: Response): Promise<void> {
    try {
      const cores = await identidadeVisualService.listarCores();

      res.json({
        success: true,
        data: cores,
        total: cores.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar cores';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async criarCor(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as CreatePaletaCorDTO;
      const usuarioId = req.usuario!.userId;

      if (!dados.nome || !dados.codigo_hex) {
        res.status(400).json({
          success: false,
          error: 'Nome e código hex são obrigatórios',
        });
        return;
      }

      // Validar formato hex
      if (!/^#[0-9A-Fa-f]{6}$/.test(dados.codigo_hex)) {
        res.status(400).json({
          success: false,
          error: 'Código hex inválido. Use formato #RRGGBB',
        });
        return;
      }

      const cor = await identidadeVisualService.criarCor(dados, usuarioId);

      res.status(201).json({
        success: true,
        data: cor,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar cor';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizarCor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dados = req.body as Partial<CreatePaletaCorDTO>;

      if (dados.codigo_hex && !/^#[0-9A-Fa-f]{6}$/.test(dados.codigo_hex)) {
        res.status(400).json({
          success: false,
          error: 'Código hex inválido. Use formato #RRGGBB',
        });
        return;
      }

      const cor = await identidadeVisualService.atualizarCor(id, dados);

      res.json({
        success: true,
        data: cor,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar cor';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluirCor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await identidadeVisualService.excluirCor(id);

      res.json({
        success: true,
        message: 'Cor excluída com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir cor';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // Fontes
  async listarFontes(req: Request, res: Response): Promise<void> {
    try {
      const fontes = await identidadeVisualService.listarFontes();

      res.json({
        success: true,
        data: fontes,
        total: fontes.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar fontes';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async criarFonte(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as CreateFonteDTO;
      const usuarioId = req.usuario!.userId;

      if (!dados.nome) {
        res.status(400).json({
          success: false,
          error: 'Nome da fonte é obrigatório',
        });
        return;
      }

      if (!dados.uso || !Object.values(UsoFonte).includes(dados.uso)) {
        res.status(400).json({
          success: false,
          error: `Uso inválido. Use: ${Object.values(UsoFonte).join(', ')}`,
        });
        return;
      }

      const fonte = await identidadeVisualService.criarFonte(dados, usuarioId);

      res.status(201).json({
        success: true,
        data: fonte,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar fonte';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluirFonte(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await identidadeVisualService.excluirFonte(id);

      res.json({
        success: true,
        message: 'Fonte excluída com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir fonte';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // Templates
  async listarTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await identidadeVisualService.listarTemplates();

      res.json({
        success: true,
        data: templates,
        total: templates.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar templates';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async criarTemplate(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as CreateTemplateDTO;
      const usuarioId = req.usuario!.userId;

      if (!dados.nome || !dados.arquivo_url) {
        res.status(400).json({
          success: false,
          error: 'Nome e URL do arquivo são obrigatórios',
        });
        return;
      }

      if (!dados.tipo || !Object.values(TipoTemplate).includes(dados.tipo)) {
        res.status(400).json({
          success: false,
          error: `Tipo inválido. Use: ${Object.values(TipoTemplate).join(', ')}`,
        });
        return;
      }

      const template = await identidadeVisualService.criarTemplate(dados, usuarioId);

      res.status(201).json({
        success: true,
        data: template,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar template';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async registrarDownload(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await identidadeVisualService.registrarDownload(id);

      res.json({
        success: true,
        message: 'Download registrado',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar download';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async excluirTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await identidadeVisualService.excluirTemplate(id);

      res.json({
        success: true,
        message: 'Template excluído com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir template';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}

export const identidadeVisualController = new IdentidadeVisualController();
