import { query } from '../../config/db.js';

export class WalletService {
  static async getWallet(userId: string) {
    const res = await query(
      'SELECT gold_coins, gems, updated_at FROM wallets WHERE user_id = $1',
      [userId]
    );
    if (res.rows.length === 0) {
      throw new Error('Carteira não encontrada.');
    }
    return {
      goldCoins: Number(res.rows[0].gold_coins),
      gems: Number(res.rows[0].gems),
      updatedAt: res.rows[0].updated_at
    };
  }

  static async getTransactionHistory(userId: string, limit = 50) {
    const res = await query(
      `SELECT id, currency, amount, balance_before, balance_after, transaction_type, metadata, created_at
       FROM wallet_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return res.rows.map(row => ({
      id: row.id,
      currency: row.currency,
      amount: Number(row.amount),
      balanceBefore: Number(row.balance_before),
      balanceAfter: Number(row.balance_after),
      transactionType: row.transaction_type,
      metadata: row.metadata,
      createdAt: row.created_at
    }));
  }
}
