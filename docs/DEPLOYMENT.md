# GUIA DE DEPLOYMENT & EXECUÇÃO DO PROJETO

## 1. Pré-Requisitos
- Node.js >= 18 (Recomendado v20 ou v24)
- PostgreSQL >= 14 (Com banco `colheita_game` criado)
- npm >= 9

## 2. Configuração Rápida
1. Configure o banco PostgreSQL local:
   ```bash
   createdb -U postgres colheita_game
   ```
2. Inicialize o Backend:
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```
3. Inicialize o Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 3. Variáveis de Ambiente
Backend (`backend/.env`):
```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/colheita_game
JWT_SECRET=super_secret_colheita_key_production_grade_jwt_2026
MARKET_FEE_PERCENTAGE=8
CORS_ORIGIN=http://localhost:5173
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000/api
```
