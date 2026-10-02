import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';
import { query } from '../../config/db.js';

export interface AuthUserPayload {
  userId: string;
  username: string;
  role: 'player' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Acesso não autorizado: token ausente' });
    return;
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as AuthUserPayload;
    
    // Verificar se o usuário ainda existe e se não foi banido
    const userRes = await query('SELECT is_banned, role FROM users WHERE id = $1', [payload.userId]);
    if (userRes.rows.length === 0) {
      res.status(401).json({ success: false, error: 'Usuário não encontrado' });
      return;
    }

    if (userRes.rows[0].is_banned) {
      res.status(403).json({ success: false, error: 'Esta conta foi suspensa por violação das regras.' });
      return;
    }

    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: userRes.rows[0].role
    };

    next();
  } catch (err) {
    res.status(403).json({ success: false, error: 'Token inválido ou expirado' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Acesso restrito a administradores do sistema' });
    return;
  }
  next();
}
