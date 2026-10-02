import { Router, Response } from 'express';
import { SocialService } from './social.service.js';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const socialRouter = Router();

socialRouter.use(authenticateToken);

socialRouter.get('/leaderboard', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const leaderboard = await SocialService.getLeaderboard();
    res.status(200).json({ success: true, data: leaderboard });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar ranking' });
  }
});

socialRouter.get('/farms/:userId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await SocialService.getPublicFarm(req.params.userId);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar fazenda do jogador' });
  }
});
