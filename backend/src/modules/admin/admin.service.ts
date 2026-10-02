import { query, getClient } from '../../config/db.js';

export class AdminService {
  /**
   * Métricas macroeconômicas e estatísticas gerais do sistema
   */
  static async getSystemMetrics() {
    // 1. Total de usuários
    const usersCountRes = await query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersCountRes.rows[0].total, 10);

    // 2. Massa monetária atual em circulação
    const totalGoldRes = await query('SELECT COALESCE(SUM(gold_coins), 0) as total_gold, COALESCE(SUM(gems), 0) as total_gems FROM wallets');
    const circulatingGold = Number(totalGoldRes.rows[0].total_gold);
    const circulatingGems = Number(totalGoldRes.rows[0].total_gems);

    // 3. Métricas do Mercado P2P
    const marketVolumeRes = await query(
      `SELECT 
         COALESCE(SUM(total_price), 0) as total_volume,
         COALESCE(SUM(fee_amount), 0) as total_fees_collected,
         COUNT(*) as total_transactions
       FROM market_transactions`
    );
    const marketVolume = Number(marketVolumeRes.rows[0].total_volume);
    const feesCollected = Number(marketVolumeRes.rows[0].total_fees_collected);
    const totalTransactions = parseInt(marketVolumeRes.rows[0].total_transactions, 10);

    // 4. Anúncios ativos
    const activeListingsRes = await query("SELECT COUNT(*) as count FROM market_listings WHERE status = 'active'");
    const activeListings = parseInt(activeListingsRes.rows[0].count, 10);

    // 5. Taxa atual do mercado
    const feeConfigRes = await query("SELECT value FROM game_config WHERE key = 'market_fee_percent'");
    const currentMarketFee = feeConfigRes.rows.length > 0 ? Number(feeConfigRes.rows[0].value) : 8;

    return {
      totalUsers,
      circulatingGold,
      circulatingGems,
      marketVolume,
      feesCollected,
      totalTransactions,
      activeListings,
      currentMarketFee
    };
  }

  /**
   * Lista usuários com perfil e status
   */
  static async listUsers(limit = 50) {
    const res = await query(
      `SELECT 
         u.id, u.username, u.email, u.role, u.is_banned, u.created_at,
         p.display_name, p.level, p.xp,
         w.gold_coins, w.gems
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       JOIN wallets w ON w.user_id = u.id
       ORDER BY u.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return res.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      isBanned: row.is_banned,
      createdAt: row.created_at,
      displayName: row.display_name,
      level: row.level,
      xp: Number(row.xp),
      goldCoins: Number(row.gold_coins),
      gems: Number(row.gems)
    }));
  }

  /**
   * Bloqueia ou desbloqueia um usuário
   */
  static async toggleBanUser(adminId: string, targetUserId: string, isBanned: boolean) {
    if (adminId === targetUserId) {
      throw new Error('Você não pode alterar o status da sua própria conta.');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE users SET is_banned = $1, updated_at = NOW() WHERE id = $2',
        [isBanned, targetUserId]
      );

      await client.query(
        `INSERT INTO audit_logs (actor_id, action, target_entity, target_id, payload)
         VALUES ($1, $2, 'users', $3, $4)`,
        [
          adminId,
          isBanned ? 'BAN_USER' : 'UNBAN_USER',
          targetUserId,
          JSON.stringify({ isBanned })
        ]
      );

      await client.query('COMMIT');
      return { success: true, message: `Usuário ${isBanned ? 'bloqueado' : 'desbloqueado'} com sucesso.` };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Atualiza a taxa de corretagem do mercado P2P
   */
  static async updateMarketFee(adminId: string, newFeePercent: number) {
    if (newFeePercent < 0 || newFeePercent > 50) {
      throw new Error('A taxa do mercado deve estar entre 0% e 50%.');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO game_config (key, value, description, updated_at)
         VALUES ('market_fee_percent', $1::jsonb, 'Percentual de taxa recolhido no mercado P2P', NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [JSON.stringify(newFeePercent)]
      );

      await client.query(
        `INSERT INTO audit_logs (actor_id, action, target_entity, target_id, payload)
         VALUES ($1, 'UPDATE_MARKET_FEE', 'game_config', 'market_fee_percent', $2)`,
        [adminId, JSON.stringify({ newFeePercent })]
      );

      await client.query('COMMIT');
      return { success: true, message: `Taxa do mercado atualizada para ${newFeePercent}%.` };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Lista logs de auditoria
   */
  static async getAuditLogs(limit = 50) {
    const res = await query(
      `SELECT 
         log.id, log.action, log.target_entity, log.target_id, log.payload, log.created_at,
         u.username as actor_username
       FROM audit_logs log
       LEFT JOIN users u ON u.id = log.actor_id
       ORDER BY log.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return res.rows.map(row => ({
      id: row.id,
      action: row.action,
      targetEntity: row.target_entity,
      targetId: row.target_id,
      payload: row.payload,
      actorUsername: row.actor_username || 'SISTEMA',
      createdAt: row.created_at
    }));
  }
}
