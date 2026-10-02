import pg from 'pg';
import { ENV } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: 25,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente do pool PostgreSQL:', err);
});

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn(`Query lenta detectada (${duration}ms):`, text);
  }
  return res;
}

export async function getClient() {
  return await pool.connect();
}
