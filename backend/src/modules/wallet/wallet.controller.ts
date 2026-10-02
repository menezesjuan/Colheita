import { Router, Response } from 'express';
import { WalletService } from './wallet.service.js';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const walletRouter = Router();

walletRouter.use(authenticateToken);

walletRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const wallet = await WalletService.getWallet(req.user!.userId);
    res.status(200).json({ success: true, data: wallet });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar carteira' });
  }
});

walletRouter.get('/transactions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const history = await WalletService.getTransactionHistory(req.user!.userId);
    res.status(200).json({ success: true, data: history });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar histórico financeiro' });
  }
});
