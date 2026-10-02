import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/colheita_game',
  JWT_SECRET: process.env.JWT_SECRET || 'colheita_secret_key_prod_2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
