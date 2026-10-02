# ARQUITETURA DO SISTEMA — COLHEITA DOS SONHOS

## 1. Visão Geral da Arquitetura
O sistema adota uma arquitetura modular moderna e desacoplada:
```
[ Frontend (React + Vite + Tailwind + Framer Motion) ]
                         | (REST API + JWT Auth Bearer)
                         v
     [ Backend Monolítico Modular (Node.js + Express + TypeScript) ]
       |-- Auth Module (JWT, Argon2/Bcrypt, Rate Limiting)
       |-- Farm Module (Grid, Tiles, Server-side Growth Engine)
       |-- Inventory Module (Stacks, Items, Consumables)
       |-- Economy & Ledger Module (Wallets, Double-Entry Transactions)
       |-- Animals Module (Feeding, Timed Production Cycles)
       |-- Marketplace Module (ACID P2P Trading with Row Locks)
       |-- Social Module (Public Farms, Leaderboards, Visiting)
       |-- Admin Module (Metrics, User Audits, System Parameters)
                         |
                         v
          [ PostgreSQL 18 Relational Database ]
          - ACID Transactions & Isolation
          - Row-Level Locking (FOR UPDATE)
          - Foreign Keys & Referential Integrity
          - Auditable Event Logs
```

## 2. Princípios de Separação de Responsabilidades
- **Frontend (`/frontend`)**: Interface de usuário rica, visualização isométrica/top-down de tiles em Canvas/SVG responsivo, componentes Awwwards-tier, feedback imediato com estados otimistas revertíveis em caso de erro retornado pela API.
- **Backend (`/backend`)**: Fonte única da verdade (*single source of truth*). Nenhuma decisão financeira ou temporal é delegada ao cliente.
- **Shared (`/shared`)**: Definições de interfaces TypeScript, enums de itens, status de colheitas, códigos de erro e payloads de requisição e resposta.
- **Database (`/database`)**: Migrations SQL numeradas com DDL estrito, índices de busca para marketplace e inventário, seeds com balanceamento econômico inicial.
