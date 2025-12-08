import { Request, Response } from 'express';
import { metricsService } from '../services/metricsService.js';

export const metricsController = {
  async getResumoGeral(_req: Request, res: Response) {
    try {
      const resumo = await metricsService.getResumoGeral();
      res.json({ success: true, data: resumo });
    } catch (error) {
      console.error('Erro ao buscar resumo geral:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar resumo geral' });
    }
  },

  async getChamadosPorSetor(_req: Request, res: Response) {
    try {
      const data = await metricsService.getChamadosPorSetor();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar chamados por setor:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar chamados por setor' });
    }
  },

  async getProjetosPorStatus(_req: Request, res: Response) {
    try {
      const data = await metricsService.getProjetosPorStatus();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar projetos por status:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar projetos por status' });
    }
  },

  async getProjetosPorTipo(_req: Request, res: Response) {
    try {
      const data = await metricsService.getProjetosPorTipo();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar projetos por tipo:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar projetos por tipo' });
    }
  },

  async getTempoMedioResolucao(req: Request, res: Response) {
    try {
      const meses = parseInt(req.query.meses as string) || 6;
      const data = await metricsService.getTempoMedioResolucao(meses);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar tempo medio resolucao:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar tempo medio de resolucao' });
    }
  },

  async getDemandasPorResponsavel(_req: Request, res: Response) {
    try {
      const data = await metricsService.getDemandasPorResponsavel();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar demandas por responsavel:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar demandas por responsavel' });
    }
  },

  async getDemandasPorPrioridade(_req: Request, res: Response) {
    try {
      const data = await metricsService.getDemandasPorPrioridade();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar demandas por prioridade:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar demandas por prioridade' });
    }
  },

  async getChamadosPorCategoria(_req: Request, res: Response) {
    try {
      const data = await metricsService.getChamadosPorCategoria();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar chamados por categoria:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar chamados por categoria' });
    }
  },

  async getChamadosPorStatus(_req: Request, res: Response) {
    try {
      const data = await metricsService.getChamadosPorStatus();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar chamados por status:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar chamados por status' });
    }
  },

  async getEvolucaoMensal(req: Request, res: Response) {
    try {
      const meses = parseInt(req.query.meses as string) || 6;
      const data = await metricsService.getEvolucaoMensal(meses);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar evolucao mensal:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar evolucao mensal' });
    }
  },

  async getTopProjetos(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const data = await metricsService.getTopProjetos(limit);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro ao buscar top projetos:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar top projetos' });
    }
  },
};
