import { query } from '../../config/db.js';
import { FarmService } from '../farm/farm.service.js';
import { AnimalsService } from '../animals/animals.service.js';

export class SocialService {
  /**
   * Ranking global dos maiores fazendeiros
   */
  static async getLeaderboard(limit = 20) {
    const res = await query(
      `SELECT 
         u.id as user_id, u.username,
         p.display_name, p.avatar_url, p.level, p.xp, p.title,
         w.gold_coins,
         f.name as farm_name
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       JOIN wallets w ON w.user_id = u.id
       LEFT JOIN farms f ON f.user_id = u.id
       WHERE u.is_banned = FALSE
       ORDER BY p.level DESC, p.xp DESC, w.gold_coins DESC
       LIMIT $1`,
      [limit]
    );

    return res.rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      level: row.level,
      xp: Number(row.xp),
      title: row.title,
      goldCoins: Number(row.gold_coins),
      farmName: row.farm_name
    }));
  }

  /**
   * Visita pública à fazenda de outro jogador
   */
  static async getPublicFarm(targetUserId: string) {
    const profileRes = await query(
      `SELECT u.id, u.username, p.display_name, p.avatar_url, p.level, p.title, p.bio
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1 AND u.is_banned = FALSE`,
      [targetUserId]
    );

    if (profileRes.rows.length === 0) {
      throw new Error('Jogador não encontrado ou perfil indisponível.');
    }

    const farmData = await FarmService.getFarmByUserId(targetUserId);
    const animals = await AnimalsService.getFarmAnimals(targetUserId);

    return {
      owner: profileRes.rows[0],
      farm: farmData,
      animals
    };
  }
}
