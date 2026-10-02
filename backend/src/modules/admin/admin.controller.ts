import { Router, Response } from 'express';
import { AdminService } from './admin.service.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const adminRouter = Router();

// Todas as rotas administrativas requerem autenticação E permissão de ADMIN
adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);

adminRouter.get('/metrics', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const metrics = await AdminService.getSystemMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar métricas' });
  }
});

adminRouter.get('/users', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await AdminService.listUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao listar usuários' });
  }
});

adminRouter.post('/users/:id/ban', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { isBanned } = req.body;
    const result = await AdminService.toggleBanUser(req.user!.userId, req.params.id, Boolean(isBanned));
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao alterar banimento do usuário' });
  }
});

adminRouter.post('/config/market-fee', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { feePercent } = req.body;
    const result = await AdminService.updateMarketFee(req.user!.userId, Number(feePercent));
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao atualizar taxa de mercado' });
  }
});

adminRouter.get('/audit-logs', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await AdminService.getAuditLogs();
    res.status(200).json({ success: true, data: logs });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao listar logs de auditoria' });
  }
});
