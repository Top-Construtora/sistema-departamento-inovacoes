import { Request, Response } from 'express';
import { portfolioService } from '../services/portfolioService.js';
import {
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  CreateVersaoDTO,
  PortfolioFiltros,
  CategoriaPortfolio,
} from '../types/portfolio.js';

export class PortfolioController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreatePortfolioDTO;
      const usuarioId = req.usuario!.userId;

      if (!data.nome) {
        res.status(400).json({
          success: false,
          error: 'Nome do projeto é obrigatório',
        });
        return;
      }

      // Validar categoria
      if (data.categoria && !Object.values(CategoriaPortfolio).includes(data.categoria)) {
        res.status(400).json({
          success: false,
          error: `Categoria inválida. Use: ${Object.values(CategoriaPortfolio).join(', ')}`,
        });
        return;
      }

      // Validar impacto_quantitativo se fornecido
      if (data.impacto_quantitativo) {
        if (!Array.isArray(data.impacto_quantitativo)) {
          res.status(400).json({
            success: false,
            error: 'impacto_quantitativo deve ser um array de KPIs',
          });
          return;
        }

        for (const kpi of data.impacto_quantitativo) {
          if (!kpi.nome || kpi.valor === undefined || !kpi.unidade) {
            res.status(400).json({
              success: false,
              error: 'Cada KPI deve ter nome, valor e unidade',
            });
            return;
          }
        }
      }

      const portfolio = await portfolioService.criar(data, usuarioId);

      res.status(201).json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar projeto no portfolio';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, publicado, tecnologia, setor } = req.query;

      const filtros: PortfolioFiltros = {};

      if (categoria && Object.values(CategoriaPortfolio).includes(categoria as CategoriaPortfolio)) {
        filtros.categoria = categoria as CategoriaPortfolio;
      }

      if (publicado !== undefined) {
        filtros.publicado = publicado === 'true';
      }

      if (tecnologia && typeof tecnologia === 'string') {
        filtros.tecnologia = tecnologia;
      }

      if (setor && typeof setor === 'string') {
        filtros.setor = setor;
      }

      const portfolios = await portfolioService.listar(filtros);

      res.json({
        success: true,
        data: portfolios,
        total: portfolios.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar portfolio';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const portfolio = await portfolioService.buscarPorId(id);

      if (!portfolio) {
        res.status(404).json({
          success: false,
          error: 'Projeto não encontrado no portfolio',
        });
        return;
      }

      res.json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar projeto';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdatePortfolioDTO;

      // Validar categoria se fornecida
      if (data.categoria && !Object.values(CategoriaPortfolio).includes(data.categoria)) {
        res.status(400).json({
          success: false,
          error: `Categoria inválida. Use: ${Object.values(CategoriaPortfolio).join(', ')}`,
        });
        return;
      }

      // Validar impacto_quantitativo se fornecido
      if (data.impacto_quantitativo) {
        if (!Array.isArray(data.impacto_quantitativo)) {
          res.status(400).json({
            success: false,
            error: 'impacto_quantitativo deve ser um array de KPIs',
          });
          return;
        }

        for (const kpi of data.impacto_quantitativo) {
          if (!kpi.nome || kpi.valor === undefined || !kpi.unidade) {
            res.status(400).json({
              success: false,
              error: 'Cada KPI deve ter nome, valor e unidade',
            });
            return;
          }
        }
      }

      const portfolio = await portfolioService.atualizar(id, data);

      if (!portfolio) {
        res.status(404).json({
          success: false,
          error: 'Projeto não encontrado no portfolio',
        });
        return;
      }

      res.json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar projeto';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async excluir(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const portfolio = await portfolioService.buscarPorId(id);

      if (!portfolio) {
        res.status(404).json({
          success: false,
          error: 'Projeto não encontrado no portfolio',
        });
        return;
      }

      await portfolioService.excluir(id);

      res.json({
        success: true,
        message: 'Projeto removido do portfolio com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir projeto';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // Versoes
  async criarVersao(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as CreateVersaoDTO;
      const usuarioId = req.usuario!.userId;

      if (!data.numero_versao) {
        res.status(400).json({
          success: false,
          error: 'Número da versão é obrigatório',
        });
        return;
      }

      const versao = await portfolioService.criarVersao(id, data, usuarioId);

      res.status(201).json({
        success: true,
        data: versao,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar versão';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async listarVersoes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const portfolio = await portfolioService.buscarPorId(id);

      if (!portfolio) {
        res.status(404).json({
          success: false,
          error: 'Projeto não encontrado no portfolio',
        });
        return;
      }

      const versoes = await portfolioService.listarVersoes(id);

      res.json({
        success: true,
        data: versoes,
        total: versoes.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar versões';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}

export const portfolioController = new PortfolioController();
