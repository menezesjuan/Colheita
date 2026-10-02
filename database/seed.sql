-- Seed inicial de dados - Colheita dos Sonhos

-- 1. Configurações Globais
INSERT INTO game_config (key, value, description) VALUES
('market_fee_percent', '8'::jsonb, 'Percentual de taxa recolhido em cada venda no mercado P2P'),
('initial_gold', '500'::jsonb, 'Ouro inicial para novos jogadores'),
('initial_gems', '20'::jsonb, 'Gemas iniciais para novos jogadores'),
('farm_default_size', '{"width": 6, "height": 6}'::jsonb, 'Dimensões iniciais da fazenda')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Itens Base do Jogo
INSERT INTO items (id, name, category, rarity, description, sprite_id, base_sell_price, base_buy_price, max_stack) VALUES
-- Sementes
('seed_wheat', 'Sementes de Trigo Solar', 'seed', 'common', 'Sementes douradas de rápido crescimento. Ciclo de 30s.', 'seed_wheat', 5, 10, 99),
('seed_carrot', 'Sementes de Cenoura Doce', 'seed', 'common', 'Cenouras crocantes e nutritivas. Ciclo de 60s.', 'seed_carrot', 12, 25, 99),
('seed_tomato', 'Sementes de Tomate Carmim', 'seed', 'uncommon', 'Tomates maduros e suculentos. Ciclo de 120s.', 'seed_tomato', 30, 60, 99),
('seed_corn', 'Sementes de Milho Dourado', 'seed', 'rare', 'Espigas graúdas que alimentam a fazenda. Ciclo de 300s.', 'seed_corn', 75, 150, 99),
('seed_strawberry', 'Sementes de Morango Rubi', 'seed', 'epic', 'Morangos perfumados e valiosos. Ciclo de 600s.', 'seed_strawberry', 180, 350, 99),

-- Colheitas
('crop_wheat', 'Trigo Dourado', 'crop', 'common', 'Fardo de trigo ceifado na plenitude.', 'crop_wheat', 20, 30, 999),
('crop_carrot', 'Cenoura Doce', 'crop', 'common', 'Cenoura fresca recém-arrancada da terra.', 'crop_carrot', 45, 65, 999),
('crop_tomato', 'Tomate Carmim', 'crop', 'uncommon', 'Tomate vermelho brilhante, excelente para venda.', 'crop_tomato', 110, 150, 999),
('crop_corn', 'Milho Dourado', 'crop', 'rare', 'Grãos selecionados de altíssimo valor nutricional.', 'crop_corn', 260, 340, 999),
('crop_strawberry', 'Morango Rubi', 'crop', 'epic', 'Fruta nobre disputadíssima no mercado de doces.', 'crop_strawberry', 600, 800, 999),

-- Rações
('feed_chicken', 'Ração de Grãos Finos', 'feed', 'common', 'Alimento especial moído para aves poedeiras.', 'feed_chicken', 8, 15, 99),
('feed_cattle', 'Feno Aromático Selecionado', 'feed', 'common', 'Fardo de capim seco balanceado para gado leiteiro.', 'feed_cattle', 25, 45, 99),
('feed_sheep', 'Mistura Nutritiva de Pasto', 'feed', 'uncommon', 'Nutrientes que deixam a lã densa e reluzente.', 'feed_sheep', 50, 90, 99),

-- Produtos de Animais
('product_egg', 'Ovo Caipira Especial', 'animal_product', 'common', 'Ovo fresco colhido diretamente do ninho.', 'product_egg', 35, 50, 999),
('product_milk', 'Garrafa de Leite Integral', 'animal_product', 'uncommon', 'Leite fresco, cremoso e rico em cálcio.', 'product_milk', 95, 130, 999),
('product_wool', 'Novelo de Lã Macia', 'animal_product', 'rare', 'Fibra natural de alta gramatura para tecidos finos.', 'product_wool', 220, 300, 999)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    base_sell_price = EXCLUDED.base_sell_price,
    base_buy_price = EXCLUDED.base_buy_price,
    description = EXCLUDED.description;

-- 3. Culturas Agrícolas
INSERT INTO crops (id, name, seed_item_id, harvest_item_id, growth_time_seconds, water_interval_seconds, min_level, min_yield, max_yield, xp_reward) VALUES
('crop_wheat', 'Trigo Solar', 'seed_wheat', 'crop_wheat', 30, 20, 1, 1, 2, 10),
('crop_carrot', 'Cenoura Doce', 'seed_carrot', 'crop_carrot', 60, 40, 2, 1, 3, 22),
('crop_tomato', 'Tomate Carmim', 'seed_tomato', 'crop_tomato', 120, 60, 3, 2, 4, 45),
('crop_corn', 'Milho Dourado', 'seed_corn', 'crop_corn', 300, 150, 4, 2, 5, 110),
('crop_strawberry', 'Morango Rubi', 'seed_strawberry', 'crop_strawberry', 600, 300, 5, 3, 6, 250)
ON CONFLICT (id) DO UPDATE SET
    growth_time_seconds = EXCLUDED.growth_time_seconds,
    xp_reward = EXCLUDED.xp_reward;

-- 4. Animais da Fazenda
INSERT INTO animals (id, name, buy_cost_gold, feed_item_id, produce_item_id, produce_interval_seconds, min_level, xp_reward) VALUES
('animal_chicken', 'Galinha Carijó', 250, 'feed_chicken', 'product_egg', 90, 2, 25),
('animal_cow', 'Vaca Holandesa', 800, 'feed_cattle', 'product_milk', 180, 3, 60),
('animal_sheep', 'Ovelha Merino', 1800, 'feed_sheep', 'product_wool', 360, 5, 140)
ON CONFLICT (id) DO UPDATE SET
    buy_cost_gold = EXCLUDED.buy_cost_gold,
    produce_interval_seconds = EXCLUDED.produce_interval_seconds;

-- 5. Missões
INSERT INTO missions (id, title, description, type, target_amount, reward_gold, reward_xp) VALUES
('mission_first_plant', 'Primeiro Plantio', 'Plante 3 sementes quaisquer em seus canteiros arados.', 'plant', 3, 100, 30),
('mission_harvest_master', 'Colheita Farta', 'Colha 5 culturas maduras em sua fazenda.', 'harvest', 5, 200, 60),
('mission_feed_animals', 'Amigo dos Animais', 'Alimente seus animais de criação 2 vezes.', 'feed', 2, 250, 80),
('mission_market_merchant', 'Comerciante Ativo', 'Venda pelo menos 1 item no Mercado Livre P2P.', 'sell_market', 1, 300, 100)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    reward_gold = EXCLUDED.reward_gold,
    reward_xp = EXCLUDED.reward_xp;
