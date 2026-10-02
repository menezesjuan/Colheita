import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/common/Navbar.js';
import { FarmCanvas, TileData } from '../components/farm/FarmCanvas.js';
import { SeedSelector } from '../components/farm/SeedSelector.js';
import { InventoryModal, InventoryItemData } from '../components/inventory/InventoryModal.js';
import { ShopModal } from '../components/shop/ShopModal.js';
import { AnimalsModal } from '../components/animals/AnimalsModal.js';
import { MarketModal } from '../components/market/MarketModal.js';
import { MissionsModal } from '../components/missions/MissionsModal.js';
import { SocialModal } from '../components/social/SocialModal.js';
import { AdminModal } from '../components/admin/AdminModal.js';
import { useAuth } from '../context/AuthContext.js';
import { apiRequest } from '../api/client.js';

export const GameDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Estados dos Modais
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isAnimalsOpen, setIsAnimalsOpen] = useState<boolean>(false);
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isSocialOpen, setIsSocialOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Pré-seleção ao abrir mercado vindo do inventário
  const [marketPreselectItem, setMarketPreselectItem] = useState<string | null>(null);

  // Dados da Fazenda
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [inventory, setInventory] = useState<InventoryItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ferramentas e Sementes ativas
  const [selectedTool, setSelectedTool] = useState<'inspect' | 'till' | 'plant' | 'harvest'>('inspect');
  const [selectedSeedId, setSelectedSeedId] = useState<string | null>(null);

  // Carregar dados da fazenda e do inventário
  const loadFarmData = useCallback(async () => {
    try {
      const [farmRes, invRes] = await Promise.all([
        apiRequest<{ tiles: TileData[] }>('/farm'),
        apiRequest<InventoryItemData[]>('/inventory')
      ]);

      if (farmRes.success && farmRes.data) {
        setTiles(farmRes.data.tiles);
      }
      if (invRes.success && invRes.data) {
        setInventory(invRes.data);
      }
    } catch (err) {
      console.error('Erro ao sincronizar dados da fazenda:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFarmData();
    // Atualização de sincronização periódica a cada 10 segundos
    const syncInterval = setInterval(loadFarmData, 10000);
    return () => clearInterval(syncInterval);
  }, [loadFarmData]);

  // Ações nos Canteiros
  const handlePlant = async (x: number, y: number, seedItemId: string) => {
    const res = await apiRequest('/farm/plant', {
      method: 'POST',
      body: JSON.stringify({ x, y, seedItemId })
    });
    if (!res.success) throw new Error(res.error);
    await loadFarmData();
    await refreshUser();
  };

  const handleHarvest = async (x: number, y: number) => {
    const res = await apiRequest('/farm/harvest', {
      method: 'POST',
      body: JSON.stringify({ x, y })
    });
    if (!res.success) throw new Error(res.error);
    await loadFarmData();
    await refreshUser();
  };

  const handleTill = async (x: number, y: number) => {
    const res = await apiRequest('/farm/till', {
      method: 'POST',
      body: JSON.stringify({ x, y })
    });
    if (!res.success) throw new Error(res.error);
    await loadFarmData();
  };

  // Filtrar sementes disponíveis para a barra de ação rápida
  const availableSeeds = inventory
    .filter(i => i.item.category === 'seed' && i.quantity > 0)
    .map(i => ({
      id: i.itemId,
      name: i.item.name,
      quantity: i.quantity,
      spriteId: i.item.spriteId
    }));

  return (
    <div className="min-h-screen bg-[#060a08] relative text-zinc-100 flex flex-col justify-between pb-24">
      
      {/* Barra de Navegação Flutuante no Topo */}
      <Navbar
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenAnimals={() => setIsAnimalsOpen(true)}
        onOpenMarket={() => {
          setMarketPreselectItem(null);
          setIsMarketOpen(true);
        }}
        onOpenMissions={() => setIsMissionsOpen(true)}
        onOpenSocial={() => setIsSocialOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Área Central do Jogo: Tabuleiro da Fazenda */}
      <main className="flex-1 flex items-center justify-center">
        {loading ? (
          <div className="text-zinc-500 font-mono text-sm animate-pulse">
            Carregando sua propriedade rural...
          </div>
        ) : (
          <FarmCanvas
            tiles={tiles}
            selectedTool={selectedTool}
            selectedSeedId={selectedSeedId}
            onPlant={handlePlant}
            onHarvest={handleHarvest}
            onTill={handleTill}
          />
        )}
      </main>

      {/* Barra Inferior com Ferramentas e Sementes Rápidas */}
      <SeedSelector
        seeds={availableSeeds}
        selectedSeedId={selectedSeedId}
        onSelectSeed={setSelectedSeedId}
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
      />

      {/* Modais do Jogo */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onRefresh={loadFarmData}
        onOpenMarketForSell={(itemId) => {
          setIsInventoryOpen(false);
          setMarketPreselectItem(itemId);
          setIsMarketOpen(true);
        }}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onItemPurchased={loadFarmData}
      />

      <AnimalsModal
        isOpen={isAnimalsOpen}
        onClose={() => setIsAnimalsOpen(false)}
        onRefreshFarm={loadFarmData}
      />

      <MarketModal
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
        onItemBoughtOrSold={loadFarmData}
        preselectedItemIdForSell={marketPreselectItem}
      />

      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
      />

      <SocialModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
      />

      {user?.role === 'admin' && (
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

    </div>
  );
};
