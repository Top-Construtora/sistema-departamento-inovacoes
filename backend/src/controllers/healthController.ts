import { Request, Response } from 'express';

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Sistema de Inovações - OK',
      timestamp: new Date().toISOString(),
    });
  }
}

export const healthController = new HealthController();
