import { getClient, query } from '../../config/db.js';

export class AnimalsService {
  /**
   * Lista todos os animais presentes na fazenda do jogador com status de produção em tempo real
   */
  static async getFarmAnimals(userId: string) {
    const farmRes = await query('SELECT id FROM farms WHERE user_id = $1', [userId]);
    if (farmRes.rows.length === 0) throw new Error('Fazenda não encontrada.');
    const farmId = farmRes.rows[0].id;

    const res = await query(
      `SELECT 
         inst.id, inst.farm_id, inst.animal_id, inst.nickname, inst.fed_at, inst.last_produce_collected_at, inst.created_at,
         a.name as animal_name, a.feed_item_id, a.produce_item_id, a.produce_interval_seconds, a.xp_reward,
         feed_it.name as feed_name,
         prod_it.name as produce_name, prod_it.sprite_id as produce_sprite,
         CASE 
           WHEN inst.fed_at IS NOT NULL THEN
             GREATEST(0, CEIL(a.produce_interval_seconds - EXTRACT(EPOCH FROM (NOW() - inst.fed_at))))
           ELSE NULL
         END as seconds_remaining
       FROM animal_instances inst
       JOIN animals a ON a.id = inst.animal_id
       JOIN items feed_it ON feed_it.id = a.feed_item_id
       JOIN items prod_it ON prod_it.id = a.produce_item_id
       WHERE inst.farm_id = $1
       ORDER BY inst.created_at ASC`,
      [farmId]
    );

    return res.rows.map(row => {
      const isFed = row.fed_at !== null;
      const secondsLeft = row.seconds_remaining !== null ? Number(row.seconds_remaining) : null;
      const canCollect = isFed && secondsLeft === 0;
      const isProducing = isFed && secondsLeft !== null && secondsLeft > 0;

      return {
        id: row.id,
        farmId: row.farm_id,
        animalId: row.animal_id,
        animalName: row.animal_name,
        nickname: row.nickname,
        feedItemId: row.feed_item_id,
        feedName: row.feed_name,
        produceItemId: row.produce_item_id,
        produceName: row.produce_name,
        produceSprite: row.produce_sprite,
        produceIntervalSeconds: Number(row.produce_interval_seconds),
        fedAt: row.fed_at,
        isFed,
        isProducing,
        canCollect,
        secondsRemaining: secondsLeft,
        xpReward: Number(row.xp_reward)
      };
    });
  }

  /**
   * Compra um novo animal para a fazenda
   */
  static async buyAnimal(userId: string, data: { animalId: string; nickname?: string }) {
    const { animalId, nickname } = data;
    if (!animalId) throw new Error('Espécie do animal é obrigatória.');

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const farmRes = await client.query('SELECT id FROM farms WHERE user_id = $1', [userId]);
      if (farmRes.rows.length === 0) throw new Error('Fazenda não encontrada.');
      const farmId = farmRes.rows[0].id;

      // 1. Obter dados da espécie
      const animalRes = await client.query(
        'SELECT id, name, buy_cost_gold, min_level FROM animals WHERE id = $1',
        [animalId]
      );
      if (animalRes.rows.length === 0) throw new Error('Espécie de animal desconhecida.');
      const animal = animalRes.rows[0];

      // Checar nível
      const profileRes = await client.query('SELECT level FROM profiles WHERE user_id = $1', [userId]);
      const currentLevel = profileRes.rows[0]?.level || 1;
      if (currentLevel < animal.min_level) {
        throw new Error(`Este animal requer nível ${animal.min_level}. Seu nível atual é ${currentLevel}.`);
      }

      // 2. Debitar custo da carteira
      const cost = Number(animal.buy_cost_gold);
      const walletRes = await client.query('SELECT gold_coins FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
      const currentGold = Number(walletRes.rows[0].gold_coins);
      if (currentGold < cost) {
        throw new Error(`Ouro insuficiente! O animal custa ${cost} moedas. Você possui ${currentGold}.`);
      }

      const newGold = currentGold - cost;
      await client.query('UPDATE wallets SET gold_coins = $1, updated_at = NOW() WHERE user_id = $2', [newGold, userId]);

      // Gravar ledger
      await client.query(
        `INSERT INTO wallet_transactions 
         (user_id, currency, amount, balance_before, balance_after, transaction_type, metadata)
         VALUES ($1, 'gold', $2, $3, $4, 'animal_buy', $5)`,
        [userId, -cost, currentGold, newGold, JSON.stringify({ animalId, name: animal.name })]
      );

      // 3. Criar instância do animal
      const animalName = nickname && nickname.trim().length > 0 ? nickname.trim() : animal.name;
      const instanceRes = await client.query(
        `INSERT INTO animal_instances (farm_id, animal_id, nickname)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [farmId, animalId, animalName]
      );

      await client.query('COMMIT');
      return {
        success: true,
        message: `${animalName} chegou com saúde à sua fazenda!`,
        instanceId: instanceRes.rows[0].id,
        newBalance: newGold
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Alimenta o animal consumindo ração do inventário
   */
  static async feedAnimal(userId: string, instanceId: string) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const farmRes = await client.query('SELECT id FROM farms WHERE user_id = $1', [userId]);
      if (farmRes.rows.length === 0) throw new Error('Fazenda não encontrada.');
      const farmId = farmRes.rows[0].id;

      // 1. Obter instância com lock
      const instRes = await client.query(
        `SELECT inst.id, inst.fed_at, a.feed_item_id, a.name as animal_name, feed_it.name as feed_name
         FROM animal_instances inst
         JOIN animals a ON a.id = inst.animal_id
         JOIN items feed_it ON feed_it.id = a.feed_item_id
         WHERE inst.id = $1 AND inst.farm_id = $2
         FOR UPDATE OF inst`,
        [instanceId, farmId]
      );
      if (instRes.rows.length === 0) throw new Error('Animal não encontrado na sua fazenda.');
      const inst = instRes.rows[0];

      if (inst.fed_at !== null) {
        throw new Error('Este animal já está alimentado e em processo de produção.');
      }

      // 2. Debitar ração do inventário
      const invRes = await client.query(
        'SELECT quantity FROM inventory WHERE user_id = $1 AND item_id = $2 FOR UPDATE',
        [userId, inst.feed_item_id]
      );
      if (invRes.rows.length === 0 || invRes.rows[0].quantity < 1) {
        throw new Error(`Você precisa de 1x ${inst.feed_name} para alimentar este animal!`);
      }

      if (invRes.rows[0].quantity === 1) {
        await client.query('DELETE FROM inventory WHERE user_id = $1 AND item_id = $2', [userId, inst.feed_item_id]);
      } else {
        await client.query('UPDATE inventory SET quantity = quantity - 1 WHERE user_id = $1 AND item_id = $2', [userId, inst.feed_item_id]);
      }

      // 3. Atualizar fed_at no servidor
      await client.query(
        'UPDATE animal_instances SET fed_at = NOW() WHERE id = $1',
        [inst.id]
      );

      // 4. Atualizar missões do tipo 'feed'
      await client.query(
        `UPDATE user_missions
         SET current_amount = current_amount + 1,
             completed = CASE WHEN current_amount + 1 >= (SELECT target_amount FROM missions WHERE missions.id = user_missions.mission_id) THEN TRUE ELSE FALSE END
         WHERE user_id = $1 AND mission_id IN (SELECT id FROM missions WHERE type = 'feed') AND NOT completed`,
        [userId]
      );

      await client.query('COMMIT');
      return { success: true, message: `${inst.animal_name} foi alimentado e começou a produzir!` };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Coleta a produção do animal maduro
   */
  static async collectProduce(userId: string, instanceId: string) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const farmRes = await client.query('SELECT id FROM farms WHERE user_id = $1', [userId]);
      if (farmRes.rows.length === 0) throw new Error('Fazenda não encontrada.');
      const farmId = farmRes.rows[0].id;

      // 1. Obter instância e verificar tempo no servidor com lock
      const instRes = await client.query(
        `SELECT inst.id, inst.fed_at, a.produce_item_id, a.produce_interval_seconds, a.xp_reward,
                prod_it.name as produce_name,
                EXTRACT(EPOCH FROM (NOW() - inst.fed_at)) as elapsed_seconds
         FROM animal_instances inst
         JOIN animals a ON a.id = inst.animal_id
         JOIN items prod_it ON prod_it.id = a.produce_item_id
         WHERE inst.id = $1 AND inst.farm_id = $2
         FOR UPDATE OF inst`,
        [instanceId, farmId]
      );
      if (instRes.rows.length === 0) throw new Error('Animal não encontrado.');
      const inst = instRes.rows[0];

      if (!inst.fed_at) {
        throw new Error('O animal precisa ser alimentado antes de produzir.');
      }

      const elapsed = Number(inst.elapsed_seconds);
      const required = Number(inst.produce_interval_seconds);

      if (elapsed < required) {
        const remaining = Math.ceil(required - elapsed);
        throw new Error(`A produção ainda está em andamento. Aguarde mais ${remaining} segundos.`);
      }

      // 2. Adicionar produto ao inventário
      await client.query(
        `INSERT INTO inventory (user_id, item_id, quantity)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET quantity = inventory.quantity + 1`,
        [userId, inst.produce_item_id]
      );

      // 3. Resetar fed_at e atualizar last_produce_collected_at
      await client.query(
        'UPDATE animal_instances SET fed_at = NULL, last_produce_collected_at = NOW() WHERE id = $1',
        [inst.id]
      );

      // 4. Conceder XP
      const xpReward = Number(inst.xp_reward);
      await client.query(
        'UPDATE profiles SET xp = xp + $1 WHERE user_id = $2',
        [xpReward, userId]
      );

      await client.query('COMMIT');
      return {
        success: true,
        message: `Coletou 1x ${inst.produce_name}! Ganhou ${xpReward} XP.`,
        produceItemId: inst.produce_item_id
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
