import { Router, Response } from 'express';
import { AnimalsService } from './animals.service.js';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const animalsRouter = Router();

animalsRouter.use(authenticateToken);

animalsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const animals = await AnimalsService.getFarmAnimals(req.user!.userId);
    res.status(200).json({ success: true, data: animals });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar animais da fazenda' });
  }
});

animalsRouter.post('/buy', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { animalId, nickname } = req.body;
    const result = await AnimalsService.buyAnimal(req.user!.userId, { animalId, nickname });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao comprar animal' });
  }
});

animalsRouter.post('/feed', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { instanceId } = req.body;
    const result = await AnimalsService.feedAnimal(req.user!.userId, instanceId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao alimentar animal' });
  }
});

animalsRouter.post('/collect', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { instanceId } = req.body;
    const result = await AnimalsService.collectProduce(req.user!.userId, instanceId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao coletar produção animal' });
  }
});
