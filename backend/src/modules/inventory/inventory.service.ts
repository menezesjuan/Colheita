import { getClient, query } from '../../config/db.js';

export class InventoryService {
  /**
   * Retorna os itens do inventário do usuário
   */
  static async getUserInventory(userId: string) {
    const res = await query(
      `SELECT 
         inv.id, inv.item_id, inv.quantity, inv.updated_at,
         it.name, it.category, it.rarity, it.description, it.sprite_id,
         it.base_sell_price, it.base_buy_price, it.max_stack
       FROM inventory inv
       JOIN items it ON it.id = inv.item_id
       WHERE inv.user_id = $1 AND inv.quantity > 0
       ORDER BY it.category ASC, it.name ASC`,
      [userId]
    );

    return res.rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      quantity: row.quantity,
      item: {
        id: row.item_id,
        name: row.name,
        category: row.category,
        rarity: row.rarity,
        description: row.description,
        spriteId: row.sprite_id,
        baseSellPrice: Number(row.base_sell_price),
        baseBuyPrice: row.base_buy_price ? Number(row.base_buy_price) : null,
        maxStack: row.max_stack
      }
    }));
  }

  /**
   * Catálogo de itens disponíveis para compra no armazém da cidade
   */
  static async getShopCatalog(userId: string) {
    const profileRes = await query('SELECT level FROM profiles WHERE user_id = $1', [userId]);
    const playerLevel = profileRes.rows[0]?.level || 1;

    const itemsRes = await query(
      `SELECT 
         it.id, it.name, it.category, it.rarity, it.description, it.sprite_id,
         it.base_buy_price, it.base_sell_price,
         c.min_level as crop_min_level, c.growth_time_seconds,
         a.buy_cost_gold, a.min_level as animal_min_level, a.produce_interval_seconds
       FROM items it
       LEFT JOIN crops c ON c.seed_item_id = it.id
       LEFT JOIN animals a ON a.feed_item_id = it.id
       WHERE it.base_buy_price IS NOT NULL
       ORDER BY it.category ASC, it.base_buy_price ASC`
    );

    return itemsRes.rows.map(row => {
      const minLevel = row.crop_min_level || row.animal_min_level || 1;
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        rarity: row.rarity,
        description: row.description,
        spriteId: row.sprite_id,
        priceGold: Number(row.base_buy_price),
        minLevel,
        isUnlocked: playerLevel >= minLevel,
        growthTimeSeconds: row.growth_time_seconds ? Number(row.growth_time_seconds) : null
      };
    });
  }

  /**
   * Compra de itens na loja da cidade (sementes, rações)
   */
  static async buyFromShop(userId: string, data: { itemId: string; quantity: number }) {
    const { itemId, quantity } = data;
    if (!itemId || !quantity || quantity <= 0) {
      throw new Error('Identificador do item e quantidade válida são obrigatórios.');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Obter dados do item
      const itemRes = await client.query(
        'SELECT id, name, base_buy_price FROM items WHERE id = $1',
        [itemId]
      );
      if (itemRes.rows.length === 0 || !itemRes.rows[0].base_buy_price) {
        throw new Error('Este item não está disponível para venda na loja.');
      }
      const item = itemRes.rows[0];
      const unitPrice = Number(item.base_buy_price);
      const totalCost = unitPrice * quantity;

      // 2. Verificar carteira do jogador com lock
      const walletRes = await client.query(
        'SELECT gold_coins FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      if (walletRes.rows.length === 0) {
        throw new Error('Carteira não encontrada.');
      }
      const currentGold = Number(walletRes.rows[0].gold_coins);

      if (currentGold < totalCost) {
        throw new Error(`Saldo insuficiente! Custo total: ${totalCost} ouro. Você possui: ${currentGold} ouro.`);
      }

      const newGold = currentGold - totalCost;

      // 3. Debitar ouro
      await client.query('UPDATE wallets SET gold_coins = $1, updated_at = NOW() WHERE user_id = $2', [newGold, userId]);

      // 4. Registrar no ledger
      await client.query(
        `INSERT INTO wallet_transactions 
         (user_id, currency, amount, balance_before, balance_after, transaction_type, metadata)
         VALUES ($1, 'gold', $2, $3, $4, 'shop_buy', $5)`,
        [
          userId,
          -totalCost,
          currentGold,
          newGold,
          JSON.stringify({ itemId, quantity, unitPrice, itemName: item.name })
        ]
      );

      // 5. Adicionar ao inventário
      await client.query(
        `INSERT INTO inventory (user_id, item_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
        [userId, itemId, quantity]
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: `Comprou ${quantity}x ${item.name} por ${totalCost} ouro.`,
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
   * Venda de itens diretamente ao armazém/NPC da cidade
   */
  static async sellToNpc(userId: string, data: { itemId: string; quantity: number }) {
    const { itemId, quantity } = data;
    if (!itemId || !quantity || quantity <= 0) {
      throw new Error('Item e quantidade válida são necessários para a venda.');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Obter inventário com lock
      const invRes = await client.query(
        'SELECT quantity FROM inventory WHERE user_id = $1 AND item_id = $2 FOR UPDATE',
        [userId, itemId]
      );
      if (invRes.rows.length === 0 || invRes.rows[0].quantity < quantity) {
        const available = invRes.rows[0]?.quantity || 0;
        throw new Error(`Quantidade insuficiente no inventário! Você possui ${available} unidades.`);
      }

      // 2. Preço de venda base do item
      const itemRes = await client.query(
        'SELECT name, base_sell_price FROM items WHERE id = $1',
        [itemId]
      );
      const item = itemRes.rows[0];
      const unitPrice = Number(item.base_sell_price);
      const totalEarned = unitPrice * quantity;

      // 3. Deduzir ou remover do inventário
      const remainingQty = invRes.rows[0].quantity - quantity;
      if (remainingQty === 0) {
        await client.query('DELETE FROM inventory WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
      } else {
        await client.query('UPDATE inventory SET quantity = $1 WHERE user_id = $2 AND item_id = $3', [remainingQty, userId, itemId]);
      }

      // 4. Creditar ouro na carteira com lock
      const walletRes = await client.query(
        'SELECT gold_coins FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      const currentGold = Number(walletRes.rows[0].gold_coins);
      const newGold = currentGold + totalEarned;

      await client.query('UPDATE wallets SET gold_coins = $1, updated_at = NOW() WHERE user_id = $2', [newGold, userId]);

      // 5. Registrar no ledger de auditoria
      await client.query(
        `INSERT INTO wallet_transactions 
         (user_id, currency, amount, balance_before, balance_after, transaction_type, metadata)
         VALUES ($1, 'gold', $2, $3, $4, 'npc_sell', $5)`,
        [
          userId,
          totalEarned,
          currentGold,
          newGold,
          JSON.stringify({ itemId, quantity, unitPrice, itemName: item.name })
        ]
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: `Vendeu ${quantity}x ${item.name} por ${totalEarned} moedas de ouro!`,
        earnedGold: totalEarned,
        newBalance: newGold
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
