import { Router, Response } from 'express';
import { MissionsService } from './missions.service.js';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const missionsRouter = Router();

missionsRouter.use(authenticateToken);

missionsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const missions = await MissionsService.getUserMissions(req.user!.userId);
    res.status(200).json({ success: true, data: missions });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar missões' });
  }
});

missionsRouter.post('/:id/claim', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await MissionsService.claimReward(req.user!.userId, req.params.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao resgatar recompensa da missão' });
  }
});
