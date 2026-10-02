import { Router, Response } from 'express';
import { InventoryService } from './inventory.service.js';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware.js';

export const inventoryRouter = Router();

inventoryRouter.use(authenticateToken);

inventoryRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const items = await InventoryService.getUserInventory(req.user!.userId);
    res.status(200).json({ success: true, data: items });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar inventário' });
  }
});

inventoryRouter.get('/shop', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const catalog = await InventoryService.getShopCatalog(req.user!.userId);
    res.status(200).json({ success: true, data: catalog });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao carregar catálogo da loja' });
  }
});

inventoryRouter.post('/shop/buy', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId, quantity } = req.body;
    const result = await InventoryService.buyFromShop(req.user!.userId, { itemId, quantity: Number(quantity) });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao comprar item' });
  }
});

inventoryRouter.post('/sell', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId, quantity } = req.body;
    const result = await InventoryService.sellToNpc(req.user!.userId, { itemId, quantity: Number(quantity) });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Erro ao vender item' });
  }
});
