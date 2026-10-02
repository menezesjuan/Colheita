import React, { useState } from 'react';
import { X, Package, Coins, ShoppingBag } from 'lucide-react';
import { CardDoubleBezel } from '../common/CardDoubleBezel.js';
import { ItemSprite } from '../sprites/GameSprites.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../api/client.js';
import { sounds } from '../../utils/sound.js';

export interface InventoryItemData {
  id: string;
  itemId: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    category: string;
    rarity: string;
    description: string;
    spriteId: string;
    baseSellPrice: number;
  };
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItemData[];
  onRefresh: () => Promise<void>;
  onOpenMarketForSell?: (itemId: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onRefresh,
  onOpenMarketForSell
}) => {
  const { refreshUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sellingItemId, setSellingItemId] = useState<string | null>(null);
  const [sellQty, setSellQty] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'crop', label: 'Colheitas' },
    { id: 'seed', label: 'Sementes' },
    { id: 'animal_product', label: 'Produtos Animais' },
    { id: 'feed', label: 'Rações' },
  ];

  const filteredItems = inventory.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.item.category === selectedCategory;
  });

  const handleSellToNpc = async (itemId: string, quantity: number) => {
    setIsProcessing(true);
    try {
      const res = await apiRequest('/inventory/sell', {
        method: 'POST',
        body: JSON.stringify({ itemId, quantity })
      });

      if (!res.success) throw new Error(res.error);

      sounds.playCoins();
      await onRefresh();
      await refreshUser();
      setSellingItemId(null);
    } catch (err: any) {
      alert(err.message || 'Falha na venda');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-3xl">
        <CardDoubleBezel innerClassName="p-6 max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Package className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Armazém da Fazenda</h2>
                <p className="text-xs text-zinc-400">Gerencie seus recursos, sementes e produtos colhidos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Abas de Categorias */}
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid de Itens */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-2">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-16 text-center text-zinc-500 text-sm">
                Nenhum item nesta categoria no momento.
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
                      <ItemSprite spriteId={item.item.spriteId} size={36} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{item.item.name}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{item.item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Qtd: {item.quantity}
                        </span>
                        <span className="text-[11px] text-amber-400 flex items-center gap-0.5">
                          <Coins className="w-3 h-3" />
                          {item.item.baseSellPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Item */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    {sellingItemId === item.itemId ? (
                      <div className="w-full flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={item.quantity}
                          value={sellQty}
                          onChange={e => setSellQty(Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-16 px-2 py-1 rounded bg-black/50 border border-white/10 text-xs text-white font-mono"
                        />
                        <button
                          disabled={isProcessing}
                          onClick={() => handleSellToNpc(item.itemId, sellQty)}
                          className="flex-1 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setSellingItemId(null)}
                          className="px-2 py-1 rounded text-zinc-400 hover:text-white text-xs"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSellingItemId(item.itemId);
                            setSellQty(1);
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-medium flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          Vender NPC
                        </button>

                        {onOpenMarketForSell && item.item.category !== 'seed' && (
                          <button
                            onClick={() => onOpenMarketForSell(item.itemId)}
                            className="py-1.5 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                            title="Anunciar no Mercado P2P"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </CardDoubleBezel>
      </div>
    </div>
  );
};
