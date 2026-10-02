import { getClient, query } from '../../config/db.js';

export class MarketService {
  /**
   * Busca anúncios ativos com filtros, paginação e ordenação
   */
  static async getActiveListings(params: {
    search?: string;
    category?: string;
    sortBy?: 'unit_price' | 'created_at';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      category,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = params;

    const offset = (page - 1) * limit;
    const conditions: string[] = ["l.status = 'active' AND l.quantity > 0"];
    const queryParams: any[] = [];

    if (search && search.trim().length > 0) {
      queryParams.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`LOWER(it.name) LIKE $${queryParams.length}`);
    }

    if (category && category !== 'all') {
      queryParams.push(category);
      conditions.push(`it.category = $${queryParams.length}`);
    }

    const whereClause = conditions.join(' AND ');
    const orderClause = sortBy === 'unit_price' ? `l.unit_price ${sortOrder}` : `l.created_at ${sortOrder}`;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM market_listings l
      JOIN items it ON it.id = l.item_id
      WHERE ${whereClause}
    `;
    const countRes = await query(countQuery, queryParams);
    const total = parseInt(countRes.rows[0].total, 10);

    const dataQuery = `
      SELECT 
        l.id, l.seller_id, l.item_id, l.quantity, l.unit_price, l.status, l.created_at,
        u.username as seller_username,
        p.avatar_url as seller_avatar, p.level as seller_level,
        it.name as item_name, it.category, it.rarity, it.description, it.sprite_id, it.base_sell_price
      FROM market_listings l
      JOIN users u ON u.id = l.seller_id
      JOIN profiles p ON p.user_id = l.seller_id
      JOIN items it ON it.id = l.item_id
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const dataRes = await query(dataQuery, [...queryParams, limit, offset]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      listings: dataRes.rows.map(row => ({
        id: row.id,
        sellerId: row.seller_id,
        sellerUsername: row.seller_username,
        sellerAvatar: row.seller_avatar,
        sellerLevel: row.seller_level,
        itemId: row.item_id,
        quantity: row.quantity,
        unitPrice: Number(row.unit_price),
        totalPrice: Number(row.unit_price) * row.quantity,
        status: row.status,
        createdAt: row.created_at,
        item: {
          id: row.item_id,
          name: row.item_name,
          category: row.category,
          rarity: row.rarity,
          description: row.description,
          spriteId: row.sprite_id,
          baseSellPrice: Number(row.base_sell_price)
        }
      }))
    };
  }

  /**
   * Cria um anúncio no mercado retirando os itens do inventário
   */
  static async createListing(userId: string, data: { itemId: string; quantity: number; unitPrice: number }) {
    const { itemId, quantity, unitPrice } = data;
    if (!itemId || !quantity || quantity <= 0 || !unitPrice || unitPrice <= 0) {
      throw new Error('Item, quantidade positiva e preço unitário válido são obrigatórios.');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Verificar inventário do usuário com bloqueio
      const invRes = await client.query(
        'SELECT quantity FROM inventory WHERE user_id = $1 AND item_id = $2 FOR UPDATE',
        [userId, itemId]
      );
      if (invRes.rows.length === 0 || invRes.rows[0].quantity < quantity) {
        throw new Error('Você não possui a quantidade informada desse item em seu inventário.');
      }

      // 2. Deduzir ou remover do inventário
      const remaining = invRes.rows[0].quantity - quantity;
      if (remaining === 0) {
        await client.query('DELETE FROM inventory WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
      } else {
        await client.query('UPDATE inventory SET quantity = $1 WHERE user_id = $2 AND item_id = $3', [remaining, userId, itemId]);
      }

      // 3. Criar anúncio público
      const listingRes = await client.query(
        `INSERT INTO market_listings (seller_id, item_id, quantity, unit_price, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING id, created_at`,
        [userId, itemId, quantity, unitPrice]
      );

      await client.query('COMMIT');
      return {
        success: true,
        message: 'Anúncio publicado no Mercado Global!',
        listingId: listingRes.rows[0].id
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Compra itens de um anúncio com bloqueio transacional (SELECT FOR UPDATE)
   * Previne simultaneidade e race conditions
   */
  static async buyListing(buyerId: string, data: { listingId: string; quantity: number }) {
    const { listingId, quantity } = data;
    if (!listingId || !quantity || quantity <= 0) {
      throw new Error('Identificador do anúncio e quantidade válida são obrigatórios.');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Bloquear o anúncio no PostgreSQL para garantir exclusividade de leitura/atualização
      const listingRes = await client.query(
        `SELECT l.id, l.seller_id, l.item_id, l.quantity, l.unit_price, l.status,
                it.name as item_name
         FROM market_listings l
         JOIN items it ON it.id = l.item_id
         WHERE l.id = $1
         FOR UPDATE OF l`,
        [listingId]
      );

      if (listingRes.rows.length === 0) {
        throw new Error('Anúncio não encontrado.');
      }

      const listing = listingRes.rows[0];

      if (listing.status !== 'active' || listing.quantity <= 0) {
        throw new Error('Este anúncio já foi esgotado ou cancelado por outro jogador.');
      }

      if (listing.seller_id === buyerId) {
        throw new Error('Você não pode comprar do seu próprio anúncio.');
      }

      if (quantity > listing.quantity) {
        throw new Error(`Quantidade indisponível! Restam apenas ${listing.quantity} unidades deste item.`);
      }

      const unitPrice = Number(listing.unit_price);
      const totalPrice = unitPrice * quantity;

      // 2. Obter a taxa de corretagem do mercado em game_config
      const configRes = await client.query(
        "SELECT value FROM game_config WHERE key = 'market_fee_percent'"
      );
      const feePercent = configRes.rows.length > 0 ? Number(configRes.rows[0].value) : 8;
      const feeAmount = Math.floor(totalPrice * (feePercent / 100));
      const sellerNet = totalPrice - feeAmount;

      // 3. Verificar e debitar saldo do comprador com lock
      const buyerWalletRes = await client.query(
        'SELECT gold_coins FROM wallets WHERE user_id = $1 FOR UPDATE',
        [buyerId]
      );
      const buyerGold = Number(buyerWalletRes.rows[0].gold_coins);
      if (buyerGold < totalPrice) {
        throw new Error(`Saldo insuficiente! Total: ${totalPrice} ouro. Você possui: ${buyerGold} ouro.`);
      }

      const buyerNewGold = buyerGold - totalPrice;
      await client.query(
        'UPDATE wallets SET gold_coins = $1, updated_at = NOW() WHERE user_id = $2',
        [buyerNewGold, buyerId]
      );

      // Registrar débito no ledger do comprador
      await client.query(
        `INSERT INTO wallet_transactions 
         (user_id, currency, amount, balance_before, balance_after, transaction_type, reference_id, metadata)
         VALUES ($1, 'gold', $2, $3, $4, 'market_buy', $5, $6)`,
        [
          buyerId,
          -totalPrice,
          buyerGold,
          buyerNewGold,
          listing.id,
          JSON.stringify({ itemId: listing.item_id, itemName: listing.item_name, quantity, unitPrice })
        ]
      );

      // 4. Creditar valor líquido no vendedor com lock
      const sellerWalletRes = await client.query(
        'SELECT gold_coins FROM wallets WHERE user_id = $1 FOR UPDATE',
        [listing.seller_id]
      );
      const sellerGold = Number(sellerWalletRes.rows[0].gold_coins);
      const sellerNewGold = sellerGold + sellerNet;

      await client.query(
        'UPDATE wallets SET gold_coins = $1, updated_at = NOW() WHERE user_id = $2',
        [sellerNewGold, listing.seller_id]
      );

      // Registrar crédito no ledger do vendedor
      await client.query(
        `INSERT INTO wallet_transactions 
         (user_id, currency, amount, balance_before, balance_after, transaction_type, reference_id, metadata)
         VALUES ($1, 'gold', $2, $3, $4, 'market_sell', $5, $6)`,
        [
          listing.seller_id,
          sellerNet,
          sellerGold,
          sellerNewGold,
          listing.id,
          JSON.stringify({ itemId: listing.item_id, itemName: listing.item_name, quantity, unitPrice, feeAmount, gross: totalPrice })
        ]
      );

      // 5. Transferir item para o inventário do comprador
      await client.query(
        `INSERT INTO inventory (user_id, item_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
        [buyerId, listing.item_id, quantity]
      );

      // 6. Atualizar a listagem
      const remainingListingQty = listing.quantity - quantity;
      if (remainingListingQty === 0) {
        await client.query(
          "UPDATE market_listings SET quantity = 0, status = 'sold_out', updated_at = NOW() WHERE id = $1",
          [listing.id]
        );
      } else {
        await client.query(
          "UPDATE market_listings SET quantity = $1, updated_at = NOW() WHERE id = $2",
          [remainingListingQty, listing.id]
        );
      }

      // 7. Gravar transação do mercado
      await client.query(
        `INSERT INTO market_transactions 
         (listing_id, seller_id, buyer_id, item_id, quantity, unit_price, total_price, fee_amount, seller_net)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          listing.id,
          listing.seller_id,
          buyerId,
          listing.item_id,
          quantity,
          unitPrice,
          totalPrice,
          feeAmount,
          sellerNet
        ]
      );

      // 8. Atualizar missões do comprador (buy_market) e do vendedor (sell_market)
      await client.query(
        `UPDATE user_missions
         SET current_amount = current_amount + 1,
             completed = CASE WHEN current_amount + 1 >= (SELECT target_amount FROM missions WHERE missions.id = user_missions.mission_id) THEN TRUE ELSE FALSE END
         WHERE user_id = $1 AND mission_id IN (SELECT id FROM missions WHERE type = 'buy_market') AND NOT completed`,
        [buyerId]
      );

      await client.query(
        `UPDATE user_missions
         SET current_amount = current_amount + 1,
             completed = CASE WHEN current_amount + 1 >= (SELECT target_amount FROM missions WHERE missions.id = user_missions.mission_id) THEN TRUE ELSE FALSE END
         WHERE user_id = $1 AND mission_id IN (SELECT id FROM missions WHERE type = 'sell_market') AND NOT completed`,
        [listing.seller_id]
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: `Compra de ${quantity}x ${listing.item_name} realizada com sucesso por ${totalPrice} moedas!`,
        totalPrice,
        feeAmount,
        remainingBuyerGold: buyerNewGold
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Cancelamento de anúncio ativo com devolução dos itens ao vendedor
   */
  static async cancelListing(userId: string, listingId: string) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const listingRes = await client.query(
        `SELECT id, seller_id, item_id, quantity, status
         FROM market_listings
         WHERE id = $1
         FOR UPDATE`,
        [listingId]
      );

      if (listingRes.rows.length === 0) throw new Error('Anúncio não encontrado.');
      const listing = listingRes.rows[0];

      if (listing.seller_id !== userId) throw new Error('Você só pode cancelar anúncios criados por você.');
      if (listing.status !== 'active' || listing.quantity <= 0) {
        throw new Error('Apenas anúncios ativos com itens restantes podem ser cancelados.');
      }

      // Devolver itens ao inventário do vendedor
      await client.query(
        `INSERT INTO inventory (user_id, item_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity`,
        [userId, listing.item_id, listing.quantity]
      );

      // Atualizar status do anúncio para cancelled
      await client.query(
        "UPDATE market_listings SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
        [listing.id]
      );

      await client.query('COMMIT');
      return { success: true, message: 'Anúncio cancelado e itens devolvidos ao seu inventário.' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Histórico recente de negociações no mercado
   */
  static async getTransactionHistory(limit = 30) {
    const res = await query(
      `SELECT 
         tx.id, tx.quantity, tx.unit_price, tx.total_price, tx.fee_amount, tx.created_at,
         it.name as item_name, it.sprite_id,
         seller.username as seller_username,
         buyer.username as buyer_username
       FROM market_transactions tx
       JOIN items it ON it.id = tx.item_id
       JOIN users seller ON seller.id = tx.seller_id
       JOIN users buyer ON buyer.id = tx.buyer_id
       ORDER BY tx.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return res.rows.map(row => ({
      id: row.id,
      itemName: row.item_name,
      spriteId: row.sprite_id,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      totalPrice: Number(row.total_price),
      feeAmount: Number(row.fee_amount),
      sellerUsername: row.seller_username,
      buyerUsername: row.buyer_username,
      createdAt: row.created_at
    }));
  }
}
