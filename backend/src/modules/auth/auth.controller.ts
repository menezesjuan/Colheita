import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { authenticateToken, AuthenticatedRequest } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const result = await AuthService.register({ username, email, password });
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Falha no cadastro' });
  }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, password } = req.body;
    const result = await AuthService.login({ login, password });
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Falha no login' });
  }
});

authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await AuthService.getMe(req.user!.userId);
    res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Falha ao buscar dados do usuário' });
  }
});
