import { describe, it, expect, beforeAll } from 'vitest';
import { AuthService } from '../modules/auth/auth.service.js';
import { FarmService } from '../modules/farm/farm.service.js';
import { InventoryService } from '../modules/inventory/inventory.service.js';
import { MarketService } from '../modules/market/market.service.js';
import { query } from '../config/db.js';

describe('Suíte de Testes Críticos — Colheita dos Sonhos', () => {
  let player1: any;
  let player2: any;

  beforeAll(async () => {
    // Limpar usuários de teste anteriores
    const testUsers = ['test_farmer_one', 'test_farmer_two', 'test_farmer_three'];
    await query("DELETE FROM users WHERE username = ANY($1)", [testUsers]);

    // Registrar Player 1
    player1 = await AuthService.register({
      username: 'test_farmer_one',
      email: 'farmer1@test.com',
      password: 'password123'
    });

    // Registrar Player 2
    player2 = await AuthService.register({
      username: 'test_farmer_two',
      email: 'farmer2@test.com',
      password: 'password123'
    });
  });

  it('1. Cadastro concede saldo inicial e sementes no inventário', async () => {
    const me = await AuthService.getMe(player1.user.id);
    expect(me.wallet.goldCoins).toBe(500);
    expect(me.wallet.gems).toBe(20);

    const inv = await InventoryService.getUserInventory(player1.user.id);
    const wheatSeed = inv.find(i => i.itemId === 'seed_wheat');
    expect(wheatSeed).toBeDefined();
    expect(wheatSeed!.quantity).toBe(10);
  });

  it('2. Fazenda é inicializada com tiles e plantio consome semente', async () => {
    const farm = await FarmService.getFarmByUserId(player1.user.id);
    expect(farm.tiles.length).toBe(36);

    // Encontrar primeiro canteiro de solo vazio
    const soilTile = farm.tiles.find(t => t.tileType === 'soil' && t.state === 'empty');
    expect(soilTile).toBeDefined();

    // Plantar trigo
    const plantRes = await FarmService.plant(player1.user.id, {
      x: soilTile!.x,
      y: soilTile!.y,
      seedItemId: 'seed_wheat'
    });
    expect(plantRes.success).toBe(true);

    // Inventário deve ter 9 sementes agora
    const invAfter = await InventoryService.getUserInventory(player1.user.id);
    const wheatSeed = invAfter.find(i => i.itemId === 'seed_wheat');
    expect(wheatSeed!.quantity).toBe(9);

    // Tentar colher imediatamente deve falhar pois ainda não atingiu o tempo do servidor
    await expect(
      FarmService.harvest(player1.user.id, { x: soilTile!.x, y: soilTile!.y })
    ).rejects.toThrow(/ainda está crescendo/);
  });

  it('3. Compra na loja debita ouro e concede item no inventário', async () => {
    const buyRes = await InventoryService.buyFromShop(player1.user.id, {
      itemId: 'seed_carrot',
      quantity: 2
    });
    expect(buyRes.success).toBe(true);

    const inv = await InventoryService.getUserInventory(player1.user.id);
    const carrot = inv.find(i => i.itemId === 'seed_carrot');
    // Tinha 5 sementes iniciais + 2 compradas = 7
    expect(carrot!.quantity).toBe(7);
  });

  it('4. Cenário A — Concorrência no Marketplace: dois jogadores tentam comprar o mesmo item limitado simultaneamente', async () => {
    // Dar 1 trigo colhido para o Player 1 para anunciar
    await query(
      `INSERT INTO inventory (user_id, item_id, quantity)
       VALUES ($1, 'crop_wheat', 5)
       ON CONFLICT (user_id, item_id)
       DO UPDATE SET quantity = inventory.quantity + 5`,
      [player1.user.id]
    );

    // Player 1 anuncia 1 trigo por 50 ouro
    const listingRes = await MarketService.createListing(player1.user.id, {
      itemId: 'crop_wheat',
      quantity: 1,
      unitPrice: 50
    });
    const listingId = listingRes.listingId;

    // Criar um terceiro jogador para competir na compra
    const player3 = await AuthService.register({
      username: 'test_farmer_three',
      email: 'farmer3@test.com',
      password: 'password123'
    });

    // Simular duas requisições de compra concorrentes simultâneas com Promise.allSettled
    const [result1, result2] = await Promise.allSettled([
      MarketService.buyListing(player2.user.id, { listingId, quantity: 1 }),
      MarketService.buyListing(player3.user.id, { listingId, quantity: 1 })
    ]);

    const fulfilled = [result1, result2].filter(r => r.status === 'fulfilled');
    const rejected = [result1, result2].filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // O erro do rejeitado deve indicar indisponibilidade ou esgotamento
    if (rejected[0].status === 'rejected') {
      expect(rejected[0].reason.message).toMatch(/(esgotado|indisponível)/i);
    }
  });

  it('5. Usuário não pode vender item que não possui no inventário', async () => {
    await expect(
      MarketService.createListing(player2.user.id, {
        itemId: 'crop_strawberry',
        quantity: 10,
        unitPrice: 500
      })
    ).rejects.toThrow(/não possui a quantidade informada/i);
  });
});
