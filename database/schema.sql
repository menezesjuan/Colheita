-- Schema SQL Principal - Colheita dos Sonhos
-- PostgreSQL 14+

-- 1. Configurações Globais do Jogo
CREATE TABLE IF NOT EXISTS game_config (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Perfil do Jogador
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(64) NOT NULL,
    avatar_url VARCHAR(255) NOT NULL DEFAULT 'default_avatar',
    level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
    xp BIGINT NOT NULL DEFAULT 0 CHECK (xp >= 0),
    title VARCHAR(64) NOT NULL DEFAULT 'Novo Fazendeiro',
    bio TEXT DEFAULT 'Cultivando sonhos e colhendo o futuro.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_level_xp ON profiles(level DESC, xp DESC);

-- 4. Carteira e Moedas
CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    gold_coins BIGINT NOT NULL DEFAULT 500 CHECK (gold_coins >= 0),
    gems INT NOT NULL DEFAULT 20 CHECK (gems >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ledger / Transações Financeiras Virtuais
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(16) NOT NULL CHECK (currency IN ('gold', 'gems')),
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    transaction_type VARCHAR(64) NOT NULL,
    reference_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_created ON wallet_transactions(user_id, created_at DESC);

-- 6. Itens do Jogo
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN ('seed', 'crop', 'animal_product', 'feed', 'tool', 'decor')),
    rarity VARCHAR(16) NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    description TEXT NOT NULL,
    sprite_id VARCHAR(64) NOT NULL,
    base_sell_price BIGINT NOT NULL CHECK (base_sell_price >= 0),
    base_buy_price BIGINT CHECK (base_buy_price IS NULL OR base_buy_price >= 0),
    max_stack INT NOT NULL DEFAULT 99 CHECK (max_stack > 0)
);

CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- 7. Inventário dos Jogadores
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_item UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_user_item ON inventory(user_id, item_id);

-- 8. Culturas Agrícolas
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    seed_item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    harvest_item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    growth_time_seconds INT NOT NULL CHECK (growth_time_seconds > 0),
    water_interval_seconds INT NOT NULL DEFAULT 60,
    min_level INT NOT NULL DEFAULT 1 CHECK (min_level >= 1),
    min_yield INT NOT NULL DEFAULT 1 CHECK (min_yield > 0),
    max_yield INT NOT NULL DEFAULT 2 CHECK (max_yield >= min_yield),
    xp_reward INT NOT NULL DEFAULT 10 CHECK (xp_reward >= 0)
);

-- 9. Fazendas
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL DEFAULT 'Minha Fazenda Solar',
    width INT NOT NULL DEFAULT 6 CHECK (width >= 4 AND width <= 20),
    height INT NOT NULL DEFAULT 6 CHECK (height >= 4 AND height <= 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Canteiros / Tiles da Fazenda
CREATE TABLE IF NOT EXISTS farm_tiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    x INT NOT NULL,
    y INT NOT NULL,
    tile_type VARCHAR(32) NOT NULL DEFAULT 'soil' CHECK (tile_type IN ('soil', 'grass', 'water', 'building', 'animal_pen')),
    crop_id VARCHAR(64) REFERENCES crops(id) ON DELETE SET NULL,
    planted_at TIMESTAMPTZ,
    watered_at TIMESTAMPTZ,
    state VARCHAR(32) NOT NULL DEFAULT 'empty' CHECK (state IN ('empty', 'planted', 'growing', 'ready', 'withered')),
    CONSTRAINT unique_farm_coord UNIQUE (farm_id, x, y)
);

CREATE INDEX IF NOT EXISTS idx_farm_tiles_farm_id ON farm_tiles(farm_id);

-- 11. Animais
CREATE TABLE IF NOT EXISTS animals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    buy_cost_gold BIGINT NOT NULL CHECK (buy_cost_gold > 0),
    feed_item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    produce_item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    produce_interval_seconds INT NOT NULL CHECK (produce_interval_seconds > 0),
    min_level INT NOT NULL DEFAULT 1,
    xp_reward INT NOT NULL DEFAULT 15
);

-- 12. Instâncias de Animais na Fazenda
CREATE TABLE IF NOT EXISTS animal_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    animal_id VARCHAR(64) NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
    nickname VARCHAR(64) NOT NULL,
    fed_at TIMESTAMPTZ,
    last_produce_collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_animal_instances_farm ON animal_instances(farm_id);

-- 13. Marketplace P2P (Mercado Livre entre Jogadores)
CREATE TABLE IF NOT EXISTS market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity >= 0),
    unit_price BIGINT NOT NULL CHECK (unit_price > 0),
    status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_item ON market_listings(item_id, unit_price ASC);
CREATE INDEX IF NOT EXISTS idx_market_listings_seller ON market_listings(seller_id);

-- 14. Transações do Mercado
CREATE TABLE IF NOT EXISTS market_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES market_listings(id) ON DELETE SET NULL,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price BIGINT NOT NULL CHECK (unit_price > 0),
    total_price BIGINT NOT NULL CHECK (total_price > 0),
    fee_amount BIGINT NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
    seller_net BIGINT NOT NULL CHECK (seller_net >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_tx_created ON market_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_tx_buyer ON market_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_market_tx_seller ON market_transactions(seller_id);

-- 15. Missões do Jogo
CREATE TABLE IF NOT EXISTS missions (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('plant', 'harvest', 'feed', 'sell_market', 'buy_market')),
    target_amount INT NOT NULL CHECK (target_amount > 0),
    reward_gold BIGINT NOT NULL DEFAULT 100,
    reward_xp BIGINT NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id VARCHAR(64) NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    current_amount INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    claimed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_mission UNIQUE (user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);

-- 16. Logs de Auditoria do Sistema
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    target_entity VARCHAR(64) NOT NULL,
    target_id VARCHAR(128),
    payload JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
