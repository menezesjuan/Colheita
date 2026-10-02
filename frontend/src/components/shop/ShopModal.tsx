import React, { useState, useEffect } from 'react';
import { X, Store, Coins, Clock, Lock, Check } from 'lucide-react';
import { CardDoubleBezel } from '../common/CardDoubleBezel.js';
import { ItemSprite } from '../sprites/GameSprites.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../api/client.js';

interface ShopItem {
  id: string;
  name: string;
  category: string;
  rarity: string;
  description: string;
  spriteId: string;
  priceGold: number;
  minLevel: number;
  isUnlocked: boolean;
  growthTimeSeconds: number | null;
}

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemPurchased: () => Promise<void>;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, onItemPurchased }) => {
  const { user, refreshUser } = useAuth();
  const [catalog, setCatalog] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [buying, setBuying] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<ShopItem[]>('/inventory/shop');
      if (res.success && res.data) {
        setCatalog(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
      setSelectedItem(null);
      setQuantity(1);
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuy = async () => {
    if (!selectedItem) return;
    setBuying(true);
    setFeedback(null);
    try {
      const res = await apiRequest('/inventory/shop/buy', {
        method: 'POST',
        body: JSON.stringify({ itemId: selectedItem.id, quantity })
      });

      if (!res.success) throw new Error(res.error);

      setFeedback(res.message || 'Compra realizada com sucesso!');
      await refreshUser();
      await onItemPurchased();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Falha ao comprar item');
    } finally {
      setBuying(false);
    }
  };

  const totalCost = selectedItem ? selectedItem.priceGold * quantity : 0;
  const canAfford = user ? user.wallet.goldCoins >= totalCost : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-4xl">
        <CardDoubleBezel innerClassName="p-6 max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Store className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Armazém Agrícola da Vila</h2>
                <p className="text-xs text-zinc-400">Adquira sementes selecionadas e rações balanceadas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            
            {/* Lista do Catálogo */}
            <div className="md:col-span-2 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh]">
              {loading ? (
                <div className="col-span-full py-12 text-center text-zinc-500">Carregando catálogo...</div>
              ) : (
                catalog.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.isUnlocked) {
                          setSelectedItem(item);
                          setQuantity(1);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        !item.isUnlocked
                          ? 'opacity-40 bg-black/30 border-white/5 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/40'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
                          <ItemSprite spriteId={item.spriteId} size={36} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{item.description}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                              <Coins className="w-3.5 h-3.5" />
                              {item.priceGold}
                            </span>
                            {item.growthTimeSeconds && (
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-400" />
                                {item.growthTimeSeconds}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!item.isUnlocked && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                          <Lock className="w-3 h-3" /> Nível {item.minLevel}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Painel Lateral de Checkout */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
              {selectedItem ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                        <ItemSprite spriteId={selectedItem.spriteId} size={48} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">{selectedItem.name}</h3>
                        <span className="text-xs text-amber-400 font-mono font-semibold">
                          {selectedItem.priceGold} Ouro / unidade
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <label className="text-xs text-zinc-400">Quantidade Desejada:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 5))}
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 font-mono"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 font-mono"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={quantity}
                          onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 text-center py-1.5 rounded-lg bg-black/60 border border-white/10 text-white font-mono font-bold text-sm"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 font-mono"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => setQuantity(quantity + 5)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 font-mono"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Preço Unitário:</span>
                        <span className="font-mono text-zinc-200">{selectedItem.priceGold}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Quantidade:</span>
                        <span className="font-mono text-zinc-200">{quantity}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-white/5">
                        <span className="text-white">Total:</span>
                        <span className="text-amber-400 font-mono flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {totalCost.toLocaleString('pt-BR')} Ouro
                        </span>
                      </div>
                    </div>
                  </div>

                  {feedback && (
                    <div className="my-2 p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> {feedback}
                    </div>
                  )}

                  <button
                    disabled={buying || !canAfford}
                    onClick={handleBuy}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      !canAfford
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    {canAfford ? 'Confirmar Compra' : 'Ouro Insuficiente'}
                  </button>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs">
                  Selecione um item do catálogo para ver detalhes e comprar.
                </div>
              )}
            </div>

          </div>

        </CardDoubleBezel>
      </div>
    </div>
  );
};
