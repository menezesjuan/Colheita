import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { farmRouter } from './modules/farm/farm.controller.js';
import { inventoryRouter } from './modules/inventory/inventory.controller.js';
import { walletRouter } from './modules/wallet/wallet.controller.js';
import { animalsRouter } from './modules/animals/animals.controller.js';
import { marketRouter } from './modules/market/market.controller.js';
import { missionsRouter } from './modules/missions/missions.controller.js';
import { socialRouter } from './modules/social/social.controller.js';
import { adminRouter } from './modules/admin/admin.controller.js';

const app = express();

app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Logging de requisições simplificado
app.use((req, _res, next) => {
  const start = Date.now();
  next();
  // Não logar requisições estáticas se houver
});

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString(), game: 'Colheita dos Sonhos API' });
});

// Montagem dos módulos da API REST
app.use('/api/auth', authRouter);
app.use('/api/farm', farmRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/animals', animalsRouter);
app.use('/api/market', marketRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/social', socialRouter);
app.use('/api/admin', adminRouter);

// Tratamento de erro 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint não encontrado.' });
});

// Tratamento global de erros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: 'Erro interno no servidor do jogo.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`[Colheita dos Sonhos] Servidor ativo na porta ${ENV.PORT}`);
    console.log(`[Database] Conectado ao PostgreSQL: ${ENV.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
  });
}

export default app;
