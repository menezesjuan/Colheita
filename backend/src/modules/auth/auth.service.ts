import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getClient, query } from '../../config/db.js';
import { ENV } from '../../config/env.js';

export class AuthService {
  static async register(data: { username: string; email: string; password: string }) {
    const { username, email, password } = data;

    if (!username || username.trim().length < 3) {
      throw new Error('Nome de usuário deve conter pelo menos 3 caracteres.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Endereço de e-mail inválido.');
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Iniciar transação atômica completa
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Checar se já existe username ou email
      const existingUser = await client.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [cleanUsername, cleanEmail]
      );
      if (existingUser.rows.length > 0) {
        throw new Error('Nome de usuário ou e-mail já está em uso.');
      }

      // 2. Hash da senha com bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 3. Criar usuário (se for o primeiro usuário criado no sistema, concedemos role admin)
      const totalUsersRes = await client.query('SELECT COUNT(*) as count FROM users');
      const isFirstUser = parseInt(totalUsersRes.rows[0].count, 10) === 0;
      const role = isFirstUser ? 'admin' : 'player';

      const userRes = await client.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, email, role, created_at`,
        [cleanUsername, cleanEmail, passwordHash, role]
      );
      const user = userRes.rows[0];

      // 4. Criar perfil
      await client.query(
        `INSERT INTO profiles (user_id, display_name, avatar_url, level, xp, title, bio)
         VALUES ($1, $2, $3, 1, 0, $4, $5)`,
        [
          user.id,
          username.trim(),
          'avatar_green_sprout',
          'Pioneiro dos Campos',
          'Cultivando os primeiros brotos de uma grande jornada agrícola.'
        ]
      );

      // 5. Criar carteira com fundos iniciais (500 gold, 20 gemas)
      await client.query(
        `INSERT INTO wallets (user_id, gold_coins, gems)
         VALUES ($1, 500, 20)`,
        [user.id]
      );

      // Registrar transação no ledger
      await client.query(
        `INSERT INTO wallet_transactions (user_id, currency, amount, balance_before, balance_after, transaction_type, metadata)
         VALUES ($1, 'gold', 500, 0, 500, 'starter_bonus', '{"reason": "Bônus de boas-vindas"}'::jsonb)`,
        [user.id]
      );

      // 6. Criar fazenda 6x6 e os 36 tiles
      const farmRes = await client.query(
        `INSERT INTO farms (user_id, name, width, height)
         VALUES ($1, $2, 6, 6)
         RETURNING id, width, height`,
        [user.id, `Fazenda de ${username}`]
      );
      const farmId = farmRes.rows[0].id;

      // Gerar tiles iniciais (4 canteiros de solo arado no centro e grama nos demais)
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          const isSoil = (x >= 1 && x <= 4) && (y >= 1 && y <= 4);
          const tileType = isSoil ? 'soil' : 'grass';
          await client.query(
            `INSERT INTO farm_tiles (farm_id, x, y, tile_type, state)
             VALUES ($1, $2, $3, $4, 'empty')`,
            [farmId, x, y, tileType]
          );
        }
      }

      // 7. Conceder itens iniciais no inventário
      // 10 sementes de trigo, 5 sementes de cenoura, 5 rações de galinha
      await client.query(
        `INSERT INTO inventory (user_id, item_id, quantity)
         VALUES 
          ($1, 'seed_wheat', 10),
          ($1, 'seed_carrot', 5),
          ($1, 'feed_chicken', 5)`,
        [user.id]
      );

      // 8. Atribuir missões iniciais
      const missionsRes = await client.query('SELECT id FROM missions');
      for (const m of missionsRes.rows) {
        await client.query(
          `INSERT INTO user_missions (user_id, mission_id, current_amount, completed, claimed)
           VALUES ($1, $2, 0, FALSE, FALSE)`,
          [user.id, m.id]
        );
      }

      // 9. Gravar log de auditoria
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, target_entity, target_id, payload)
         VALUES ($1, 'USER_REGISTER', 'users', $2, $3)`,
        [user.id, String(user.id), JSON.stringify({ username: user.username, role: user.role })]
      );

      await client.query('COMMIT');

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async login(data: { login: string; password: string }) {
    const { login, password } = data;
    if (!login || !password) {
      throw new Error('Credenciais de login e senha são obrigatórias.');
    }

    const cleanLogin = login.trim().toLowerCase();
    const userRes = await query(
      `SELECT id, username, email, password_hash, role, is_banned
       FROM users
       WHERE username = $1 OR email = $1`,
      [cleanLogin]
    );

    if (userRes.rows.length === 0) {
      throw new Error('Usuário ou senha incorretos.');
    }

    const user = userRes.rows[0];

    if (user.is_banned) {
      throw new Error('Esta conta está suspensa por violação das diretrizes.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Usuário ou senha incorretos.');
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  static async getMe(userId: string) {
    const userRes = await query(
      `SELECT u.id, u.username, u.email, u.role, u.is_banned, u.created_at,
              p.display_name, p.avatar_url, p.level, p.xp, p.title, p.bio,
              w.gold_coins, w.gems
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       JOIN wallets w ON w.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new Error('Usuário não encontrado.');
    }

    const row = userRes.rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      profile: {
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        level: row.level,
        xp: Number(row.xp),
        title: row.title,
        bio: row.bio
      },
      wallet: {
        goldCoins: Number(row.gold_coins),
        gems: row.gems
      }
    };
  }
}
