import { Router, Response } from 'express';
import { MarketService } from './market.service.js';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const marketRouter = Router();

// Todas as rotas do mercado exigem autenticação
marketRouter.use(authenticateToken);

marketRouter.get('/listings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category, sortBy, sortOrder, page, limit } = req.query;
    const data = await MarketService.getActiveListings({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      sortBy: sortBy === 'unit_price' ? 'unit_price' : 'created_at',
      sortOrder: sortOrder === 'ASC' ? 'ASC' : 'DESC',
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 20
    });
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar mercado' });
  }
});

marketRouter.post('/listings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId, quantity, unitPrice } = req.body;
    const result = await MarketService.createListing(req.user!.userId, {
      itemId,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice)
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao publicar anúncio' });
  }
});

marketRouter.post('/buy', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { listingId, quantity } = req.body;
    const result = await MarketService.buyListing(req.user!.userId, {
      listingId,
      quantity: Number(quantity)
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao comprar do mercado' });
  }
});

marketRouter.delete('/listings/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await MarketService.cancelListing(req.user!.userId, req.params.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao cancelar anúncio' });
  }
});

marketRouter.get('/history', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const history = await MarketService.getTransactionHistory();
    res.status(200).json({ success: true, data: history });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao buscar histórico do mercado' });
  }
});
