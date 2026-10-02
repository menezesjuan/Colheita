# SCHEMA E ESTRUTURA DO BANCO DE DADOS (PostgreSQL)

## Tabelas Principais e Relacionamentos

### 1. Usuários e Autenticação
- `users`: `id (UUID PK)`, `username (UNIQUE)`, `email (UNIQUE)`, `password_hash`, `role (ENUM: 'player', 'admin')`, `is_banned (BOOLEAN)`, `created_at`, `updated_at`.
- `profiles`: `user_id (FK)`, `display_name`, `avatar_url`, `level (INT default 1)`, `xp (BIGINT default 0)`, `title`, `bio`.

### 2. Carteira e Ledger Financeiro
- `wallets`: `user_id (PK, FK)`, `gold_coins (BIGINT default 500)`, `gems (INT default 20)`, `updated_at`.
- `wallet_transactions`: `id (UUID PK)`, `user_id (FK)`, `currency ('gold' | 'gems')`, `amount (BIGINT)`, `balance_before (BIGINT)`, `balance_after (BIGINT)`, `transaction_type ('crop_sell', 'market_buy', 'market_sell', 'animal_buy', 'seed_buy', 'reward', 'admin_adjustment')`, `reference_id (UUID null)`, `metadata (JSONB)`, `created_at`.

### 3. Fazenda e Canteiros
- `farms`: `id (UUID PK)`, `user_id (FK UNIQUE)`, `name`, `width (INT default 10)`, `height (INT default 10)`, `created_at`.
- `farm_tiles`: `id (UUID PK)`, `farm_id (FK)`, `x (INT)`, `y (INT)`, `tile_type ('soil', 'grass', 'water', 'building', 'animal_pen')`, `crop_id (VARCHAR FK null)`, `planted_at (TIMESTAMPTZ null)`, `watered_at (TIMESTAMPTZ null)`, `state ('empty', 'planted', 'growing', 'ready', 'withered')`, `CONSTRAINT unique_farm_coord UNIQUE(farm_id, x, y)`.

### 4. Itens e Inventário
- `items`: `id (VARCHAR PK)`, `name`, `category ('seed', 'crop', 'animal_product', 'feed', 'tool', 'decor')`, `rarity ('common', 'uncommon', 'rare', 'epic', 'legendary')`, `description`, `sprite_id`, `base_sell_price (BIGINT)`, `base_buy_price (BIGINT null)`, `max_stack (INT default 99)`.
- `inventory`: `id (UUID PK)`, `user_id (FK)`, `item_id (VARCHAR FK)`, `quantity (INT check quantity > 0)`, `CONSTRAINT unique_user_item UNIQUE(user_id, item_id)`.

### 5. Culturas e Animais
- `crops`: `id (VARCHAR PK)`, `name`, `seed_item_id (VARCHAR FK)`, `harvest_item_id (VARCHAR FK)`, `growth_time_seconds (INT)`, `water_interval_seconds (INT)`, `min_level (INT default 1)`, `min_yield (INT default 1)`, `max_yield (INT default 2)`, `xp_reward (INT)`.
- `animals`: `id (VARCHAR PK)`, `name`, `buy_cost_gold (BIGINT)`, `feed_item_id (VARCHAR FK)`, `produce_item_id (VARCHAR FK)`, `produce_interval_seconds (INT)`, `min_level (INT default 1)`, `xp_reward (INT)`.
- `animal_instances`: `id (UUID PK)`, `farm_id (FK)`, `animal_id (VARCHAR FK)`, `nickname`, `fed_at (TIMESTAMPTZ null)`, `last_produce_collected_at (TIMESTAMPTZ null)`, `created_at`.

### 6. Mercado P2P
- `market_listings`: `id (UUID PK)`, `seller_id (FK)`, `item_id (VARCHAR FK)`, `quantity (INT check quantity > 0)`, `unit_price (BIGINT check unit_price > 0)`, `status ('active', 'sold_out', 'cancelled')`, `created_at`, `updated_at`.
- `market_transactions`: `id (UUID PK)`, `listing_id (FK)`, `seller_id (FK)`, `buyer_id (FK)`, `item_id (VARCHAR FK)`, `quantity (INT)`, `unit_price (BIGINT)`, `total_price (BIGINT)`, `fee_amount (BIGINT)`, `seller_net (BIGINT)`, `created_at`.

### 7. Governança e Configurações
- `game_config`: `key (VARCHAR PK)`, `value (JSONB)`, `description`, `updated_at`.
- `audit_logs`: `id (UUID PK)`, `actor_id (UUID null)`, `action (VARCHAR)`, `target_entity (VARCHAR)`, `target_id (VARCHAR null)`, `payload (JSONB)`, `ip_address (VARCHAR null)`, `created_at`.
