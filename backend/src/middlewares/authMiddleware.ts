import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { JwtPayload, PerfilUsuario } from '../types/usuario.js';

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, error: 'Token não fornecido' });
    return;
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    res.status(401).json({ success: false, error: 'Token mal formatado' });
    return;
  }

  try {
    const payload = authService.verificarToken(token);
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
}

export function apenasInternos(req: Request, res: Response, next: NextFunction): void {
  if (!req.usuario) {
    res.status(401).json({ success: false, error: 'Não autenticado' });
    return;
  }

  const perfisInternos = [PerfilUsuario.LIDER, PerfilUsuario.ANALISTA];

  if (!perfisInternos.includes(req.usuario.perfil)) {
    res.status(403).json({ success: false, error: 'Acesso restrito a usuários internos' });
    return;
  }

  next();
}
