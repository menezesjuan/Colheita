import { Router, Response } from 'express';
import { FarmService } from './farm.service.js';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const farmRouter = Router();

// Todas as rotas de fazenda exigem autenticação
farmRouter.use(authenticateToken);

farmRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farm = await FarmService.getFarmByUserId(req.user!.userId);
    res.status(200).json({ success: true, data: farm });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar fazenda' });
  }
});

farmRouter.post('/plant', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { x, y, seedItemId } = req.body;
    const result = await FarmService.plant(req.user!.userId, { x, y, seedItemId });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao plantar cultura' });
  }
});

farmRouter.post('/harvest', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { x, y } = req.body;
    const result = await FarmService.harvest(req.user!.userId, { x, y });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao colher cultura' });
  }
});

farmRouter.post('/till', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { x, y } = req.body;
    const result = await FarmService.tillSoil(req.user!.userId, { x, y });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao arar terra' });
  }
});
