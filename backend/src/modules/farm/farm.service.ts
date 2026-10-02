import { getClient, query } from '../../config/db.js';

export class FarmService {
  /**
   * Obtém a fazenda do usuário com cálculo de tempo restante e progresso em tempo real
   */
  static async getFarmByUserId(userId: string) {
    const farmRes = await query(
      `SELECT id, name, width, height, created_at
       FROM farms
       WHERE user_id = $1`,
      [userId]
    );

    if (farmRes.rows.length === 0) {
      throw new Error('Fazenda não encontrada para este usuário.');
    }

    const farm = farmRes.rows[0];

    // Buscar tiles com dados das culturas e cálculo do tempo no próprio PostgreSQL
    const tilesRes = await query(
      `SELECT 
         t.id, t.x, t.y, t.tile_type, t.crop_id, t.planted_at, t.watered_at, t.state,
         c.name as crop_name, c.growth_time_seconds, c.xp_reward, c.min_yield, c.max_yield,
         CASE 
           WHEN t.planted_at IS NOT NULL AND c.growth_time_seconds IS NOT NULL THEN
             GREATEST(0, CEIL(c.growth_time_seconds - EXTRACT(EPOCH FROM (NOW() - t.planted_at))))
           ELSE 0
         END as seconds_remaining,
         CASE 
           WHEN t.planted_at IS NOT NULL AND c.growth_time_seconds IS NOT NULL THEN
             LEAST(100, ROUND((EXTRACT(EPOCH FROM (NOW() - t.planted_at)) / c.growth_time_seconds) * 100))
           ELSE 0
         END as growth_progress_percent
       FROM farm_tiles t
       LEFT JOIN crops c ON c.id = t.crop_id
       WHERE t.farm_id = $1
       ORDER BY t.y ASC, t.x ASC`,
      [farm.id]
    );

    // Ajustar estado dinâmico caso a planta tenha ficado pronta
    const tiles = tilesRes.rows.map(tile => {
      let state = tile.state;
      const secondsLeft = Number(tile.seconds_remaining);
      if (tile.crop_id && tile.planted_at) {
        if (secondsLeft === 0) {
          state = 'ready';
        } else {
          state = 'growing';
        }
      }
      return {
        id: tile.id,
        x: tile.x,
        y: tile.y,
        tileType: tile.tile_type,
        cropId: tile.crop_id,
        cropName: tile.crop_name,
        plantedAt: tile.planted_at,
        wateredAt: tile.watered_at,
        state,
        secondsRemaining: secondsLeft,
        growthProgressPercent: Number(tile.growth_progress_percent)
      };
    });

    return {
      id: farm.id,
      name: farm.name,
      width: farm.width,
      height: farm.height,
      tiles
    };
  }

  /**
   * Planta uma cultura no canteiro
   */
  static async plant(userId: string, data: { x: number; y: number; seedItemId: string }) {
    const { x, y, seedItemId } = data;
    if (x === undefined || y === undefined || !seedItemId) {
      throw new Error('Coordenadas (x, y) e semente são obrigatórios.');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Obter a fazenda do usuário
      const farmRes = await client.query('SELECT id FROM farms WHERE user_id = $1', [userId]);
      if (farmRes.rows.length === 0) {
        throw new Error('Fazenda não encontrada.');
      }
      const farmId = farmRes.rows[0].id;

      // 2. Verificar se o tile existe, se é 'soil' e se está 'empty'
      const tileRes = await client.query(
        'SELECT id, tile_type, state, crop_id FROM farm_tiles WHERE farm_id = $1 AND x = $2 AND y = $3 FOR UPDATE',
        [farmId, x, y]
      );
      if (tileRes.rows.length === 0) {
        throw new Error(`Canteiro não encontrado nas coordenadas (${x}, ${y}).`);
      }
      const tile = tileRes.rows[0];

      if (tile.tile_type !== 'soil') {
        throw new Error('Apenas canteiros de solo arado podem receber sementes.');
      }
      if (tile.crop_id !== null) {
        throw new Error('Este canteiro já possui uma cultura plantada.');
      }

      // 3. Descobrir qual cultura corresponde à semente
      const cropRes = await client.query('SELECT id, growth_time_seconds, min_level FROM crops WHERE seed_item_id = $1', [seedItemId]);
      if (cropRes.rows.length === 0) {
        throw new Error('Esta semente não corresponde a uma cultura válida.');
      }
      const crop = cropRes.rows[0];

      // Checar nível do jogador
      const profileRes = await client.query('SELECT level FROM profiles WHERE user_id = $1', [userId]);
      const playerLevel = profileRes.rows[0]?.level || 1;
      if (playerLevel < crop.min_level) {
        throw new Error(`Esta cultura requer nível de fazendeiro ${crop.min_level}. Seu nível atual é ${playerLevel}.`);
      }

      // 4. Verificar e debitar 1 unidade da semente do inventário
      const invRes = await client.query(
        'SELECT quantity FROM inventory WHERE user_id = $1 AND item_id = $2 FOR UPDATE',
        [userId, seedItemId]
      );
      if (invRes.rows.length === 0 || invRes.rows[0].quantity < 1) {
        throw new Error('Você não possui esta semente em seu inventário.');
      }

      if (invRes.rows[0].quantity === 1) {
        await client.query('DELETE FROM inventory WHERE user_id = $1 AND item_id = $2', [userId, seedItemId]);
      } else {
        await client.query('UPDATE inventory SET quantity = quantity - 1 WHERE user_id = $1 AND item_id = $2', [userId, seedItemId]);
      }

      // 5. Atualizar o tile com a nova cultura e timestamp do servidor
      await client.query(
        `UPDATE farm_tiles
         SET crop_id = $1, planted_at = NOW(), watered_at = NOW(), state = 'growing'
         WHERE id = $2`,
        [crop.id, tile.id]
      );

      // 6. Atualizar missões do tipo 'plant'
      await client.query(
        `UPDATE user_missions
         SET current_amount = current_amount + 1,
             completed = CASE WHEN current_amount + 1 >= (SELECT target_amount FROM missions WHERE missions.id = user_missions.mission_id) THEN TRUE ELSE FALSE END
         WHERE user_id = $1 AND mission_id IN (SELECT id FROM missions WHERE type = 'plant') AND NOT completed`,
        [userId]
      );

      await client.query('COMMIT');
      return { success: true, message: 'Plantio realizado com sucesso!' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Colheita de uma cultura madura com validação do tempo estritamente no servidor
   */
  static async harvest(userId: string, data: { x: number; y: number }) {
    const { x, y } = data;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const farmRes = await client.query('SELECT id FROM farms WHERE user_id = $1', [userId]);
      if (farmRes.rows.length === 0) {
        throw new Error('Fazenda não encontrada.');
      }
      const farmId = farmRes.rows[0].id;

      // Buscar tile bloqueando linha
      const tileRes = await client.query(
        `SELECT t.id, t.crop_id, t.planted_at,
                c.harvest_item_id, c.growth_time_seconds, c.min_yield, c.max_yield, c.xp_reward,
                EXTRACT(EPOCH FROM (NOW() - t.planted_at)) as elapsed_seconds
         FROM farm_tiles t
         JOIN crops c ON c.id = t.crop_id
         WHERE t.farm_id = $1 AND t.x = $2 AND t.y = $3
         FOR UPDATE OF t`,
        [farmId, x, y]
      );

      if (tileRes.rows.length === 0) {
        throw new Error(`Não há cultura para colher nas coordenadas (${x}, ${y}).`);
      }

      const tile = tileRes.rows[0];
      const elapsed = Number(tile.elapsed_seconds);
      const required = Number(tile.growth_time_seconds);

      // Validação inegociável de tempo no servidor
      if (elapsed < required) {
        const remaining = Math.ceil(required - elapsed);
        throw new Error(`A cultura ainda está crescendo! Faltam ${remaining} segundos para amadurecer.`);
      }

      // 1. Calcular rendimento da colheita (servidor sorteia de forma determinística/segura)
      const minYield = Number(tile.min_yield);
      const maxYield = Number(tile.max_yield);
      const harvestedQty = Math.floor(Math.random() * (maxYield - minYield + 1)) + minYield;

      // 2. Inserir produto no inventário do jogador
      await client.query(
        `INSERT INTO inventory (user_id, item_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
        [userId, tile.harvest_item_id, harvestedQty]
      );

      // 3. Resetar o tile para estado limpo
      await client.query(
        `UPDATE farm_tiles
         SET crop_id = NULL, planted_at = NULL, watered_at = NULL, state = 'empty'
         WHERE id = $1`,
        [tile.id]
      );

      // 4. Adicionar XP e checar level up
      const xpGained = Number(tile.xp_reward);
      const profileRes = await client.query(
        'SELECT level, xp FROM profiles WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      const currentLevel = profileRes.rows[0].level;
      const currentXp = Number(profileRes.rows[0].xp) + xpGained;
      const xpForNextLevel = currentLevel * 100;

      let newLevel = currentLevel;
      let leveledUp = false;
      if (currentXp >= xpForNextLevel) {
        newLevel = currentLevel + 1;
        leveledUp = true;
      }

      await client.query(
        'UPDATE profiles SET xp = $1, level = $2 WHERE user_id = $3',
        [currentXp, newLevel, userId]
      );

      // 5. Atualizar missões do tipo 'harvest'
      await client.query(
        `UPDATE user_missions
         SET current_amount = current_amount + 1,
             completed = CASE WHEN current_amount + 1 >= (SELECT target_amount FROM missions WHERE missions.id = user_missions.mission_id) THEN TRUE ELSE FALSE END
         WHERE user_id = $1 AND mission_id IN (SELECT id FROM missions WHERE type = 'harvest') AND NOT completed`,
        [userId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        harvestedQty,
        harvestItemId: tile.harvest_item_id,
        xpGained,
        leveledUp,
        newLevel
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Converte um pedaço de grama em solo arado cultivável
   */
  static async tillSoil(userId: string, data: { x: number; y: number }) {
    const { x, y } = data;
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const farmRes = await client.query('SELECT id FROM farms WHERE user_id = $1', [userId]);
      if (farmRes.rows.length === 0) throw new Error('Fazenda não encontrada.');
      const farmId = farmRes.rows[0].id;

      const tileRes = await client.query(
        'SELECT id, tile_type FROM farm_tiles WHERE farm_id = $1 AND x = $2 AND y = $3 FOR UPDATE',
        [farmId, x, y]
      );
      if (tileRes.rows.length === 0) throw new Error('Canteiro não encontrado.');
      if (tileRes.rows[0].tile_type === 'soil') throw new Error('Este canteiro já é solo fértil arado.');

      await client.query(
        "UPDATE farm_tiles SET tile_type = 'soil', state = 'empty' WHERE id = $1",
        [tileRes.rows[0].id]
      );

      await client.query('COMMIT');
      return { success: true, message: 'Solo preparado e arado com sucesso!' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
