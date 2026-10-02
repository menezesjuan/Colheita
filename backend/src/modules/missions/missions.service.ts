import { getClient, query } from '../../config/db.js';

export class MissionsService {
  static async getUserMissions(userId: string) {
    const res = await query(
      `SELECT 
         m.id, m.title, m.description, m.type, m.target_amount, m.reward_gold, m.reward_xp,
         um.current_amount, um.completed, um.claimed
       FROM missions m
       JOIN user_missions um ON um.mission_id = m.id
       WHERE um.user_id = $1
       ORDER BY um.completed ASC, um.claimed ASC, m.reward_gold ASC`,
      [userId]
    );

    return res.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      targetAmount: row.target_amount,
      currentAmount: Math.min(row.current_amount, row.target_amount),
      rewardGold: Number(row.reward_gold),
      rewardXp: Number(row.reward_xp),
      completed: row.completed,
      claimed: row.claimed
    }));
  }

  static async claimReward(userId: string, missionId: string) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const missionRes = await client.query(
        `SELECT um.id, um.completed, um.claimed, m.title, m.reward_gold, m.reward_xp
         FROM user_missions um
         JOIN missions m ON m.id = um.mission_id
         WHERE um.user_id = $1 AND um.mission_id = $2
         FOR UPDATE OF um`,
        [userId, missionId]
      );

      if (missionRes.rows.length === 0) throw new Error('Missão não encontrada.');
      const mission = missionRes.rows[0];

      if (!mission.completed) throw new Error('Esta missão ainda não foi completada.');
      if (mission.claimed) throw new Error('A recompensa desta missão já foi resgatada.');

      // 1. Creditar ouro na carteira com ledger
      const rewardGold = Number(mission.reward_gold);
      const walletRes = await client.query('SELECT gold_coins FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
      const currentGold = Number(walletRes.rows[0].gold_coins);
      const newGold = currentGold + rewardGold;

      await client.query('UPDATE wallets SET gold_coins = $1, updated_at = NOW() WHERE user_id = $2', [newGold, userId]);

      await client.query(
        `INSERT INTO wallet_transactions 
         (user_id, currency, amount, balance_before, balance_after, transaction_type, metadata)
         VALUES ($1, 'gold', $2, $3, $4, 'mission_reward', $5)`,
        [userId, rewardGold, currentGold, newGold, JSON.stringify({ missionId, title: mission.title })]
      );

      // 2. Conceder XP e checar level up
      const rewardXp = Number(mission.reward_xp);
      const profileRes = await client.query('SELECT level, xp FROM profiles WHERE user_id = $1 FOR UPDATE', [userId]);
      const currentLevel = profileRes.rows[0].level;
      const currentXp = Number(profileRes.rows[0].xp) + rewardXp;
      const xpNeeded = currentLevel * 100;
      let newLevel = currentLevel;
      if (currentXp >= xpNeeded) {
        newLevel += 1;
      }
      await client.query('UPDATE profiles SET xp = $1, level = $2 WHERE user_id = $3', [currentXp, newLevel, userId]);

      // 3. Marcar como resgatada
      await client.query('UPDATE user_missions SET claimed = TRUE, updated_at = NOW() WHERE id = $1', [mission.id]);

      await client.query('COMMIT');
      return {
        success: true,
        message: `Recompensa de "${mission.title}" resgatada! +${rewardGold} Ouro, +${rewardXp} XP.`,
        rewardGold,
        rewardXp,
        newBalance: newGold,
        newLevel
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
