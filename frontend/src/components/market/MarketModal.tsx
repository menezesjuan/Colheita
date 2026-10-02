import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Search, 
  Coins, 
  PlusCircle, 
  History, 
  Trash2, 
  Check, 
  Clock, 
  Filter 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CardDoubleBezel } from '../common/CardDoubleBezel.js';
import { ItemSprite } from '../sprites/GameSprites.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../api/client.js';

interface MarketListingData {
  id: string;
  sellerId: string;
  sellerUsername: string;
  sellerAvatar: string;
  sellerLevel: number;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
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

interface MarketHistoryItem {
  id: string;
  itemName: string;
  spriteId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  feeAmount: number;
  sellerUsername: string;
  buyerUsername: string;
  createdAt: string;
}

interface InventoryOption {
  itemId: string;
  name: string;
  quantity: number;
  spriteId: string;
  baseSellPrice: number;
}

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemBoughtOrSold: () => Promise<void>;
  preselectedItemIdForSell?: string | null;
}

export const MarketModal: React.FC<MarketModalProps> = ({
  isOpen,
  onClose,
  onItemBoughtOrSold,
  preselectedItemIdForSell
}) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my_listings' | 'history'>('browse');

  // Estados de navegação e filtros
  const [listings, setListings] = useState<MarketListingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'unit_price' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Estados de criação de anúncio
  const [userInventory, setUserInventory] = useState<InventoryOption[]>([]);
  const [selectedItemToSell, setSelectedItemToSell] = useState<string>('');
  const [sellQty, setSellQty] = useState<number>(1);
  const [sellPrice, setSellPrice] = useState<number>(50);
  const [submittingListing, setSubmittingListing] = useState<boolean>(false);

  // Estados de compra
  const [buyingListingId, setBuyingListingId] = useState<string | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [isProcessingBuy, setIsProcessingBuy] = useState<boolean>(false);

  // Histórico
  const [historyList, setHistoryList] = useState<MarketHistoryItem[]>([]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        sortOrder
      });
      const res = await apiRequest<{ listings: MarketListingData[] }>(`/market/listings?${q.toString()}`);
      if (res.success && res.data) {
        setListings(res.data.listings);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInventoryForSell = async () => {
    try {
      const res = await apiRequest<any[]>('/inventory');
      if (res.success && res.data) {
        const eligible = res.data
          .filter(i => i.item.category !== 'seed') // não vende sementes no mercado P2P
          .map(i => ({
            itemId: i.itemId,
            name: i.item.name,
            quantity: i.quantity,
            spriteId: i.item.spriteId,
            baseSellPrice: i.item.baseSellPrice
          }));
        setUserInventory(eligible);
        if (eligible.length > 0 && !selectedItemToSell) {
          setSelectedItemToSell(eligible[0].itemId);
          setSellPrice(Math.round(eligible[0].baseSellPrice * 1.3));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiRequest<MarketHistoryItem[]>('/market/history');
      if (res.success && res.data) {
        setHistoryList(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchListings();
      fetchUserInventoryForSell();
      fetchHistory();
      if (preselectedItemIdForSell) {
        setActiveTab('create');
        setSelectedItemToSell(preselectedItemIdForSell);
      }
    }
  }, [isOpen, searchTerm, selectedCategory, sortBy, sortOrder]);

  if (!isOpen) return null;

  const handleBuy = async (listing: MarketListingData, qty: number) => {
    setIsProcessingBuy(true);
    try {
      const res = await apiRequest('/market/buy', {
        method: 'POST',
        body: JSON.stringify({ listingId: listing.id, quantity: qty })
      });

      if (!res.success) throw new Error(res.error);

      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      setBuyingListingId(null);
      await fetchListings();
      await refreshUser();
      await onItemBoughtOrSold();
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar compra no mercado.');
    } finally {
      setIsProcessingBuy(false);
    }
  };

  const handleCreateListing = async () => {
    if (!selectedItemToSell || sellQty <= 0 || sellPrice <= 0) {
      alert('Selecione o item, quantidade e preço válidos.');
      return;
    }

    setSubmittingListing(true);
    try {
      const res = await apiRequest('/market/listings', {
        method: 'POST',
        body: JSON.stringify({
          itemId: selectedItemToSell,
          quantity: sellQty,
          unitPrice: sellPrice
        })
      });

      if (!res.success) throw new Error(res.error);

      alert('Anúncio publicado com sucesso no Mercado Global!');
      setActiveTab('browse');
      await fetchListings();
      await fetchUserInventoryForSell();
      await onItemBoughtOrSold();
    } catch (err: any) {
      alert(err.message || 'Falha ao publicar anúncio.');
    } finally {
      setSubmittingListing(false);
    }
  };

  const handleCancelListing = async (listingId: string) => {
    try {
      const res = await apiRequest(`/market/listings/${listingId}`, {
        method: 'DELETE'
      });
      if (!res.success) throw new Error(res.error);

      await fetchListings();
      await fetchUserInventoryForSell();
      await onItemBoughtOrSold();
    } catch (err: any) {
      alert(err.message || 'Falha ao cancelar anúncio.');
    }
  };

  const selectedInventoryItem = userInventory.find(i => i.itemId === selectedItemToSell);
  const estimatedGross = sellQty * sellPrice;
  const estimatedFee = Math.floor(estimatedGross * 0.08); // 8% taxa do mercado
  const estimatedNet = estimatedGross - estimatedFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-5xl">
        <CardDoubleBezel innerClassName="p-6 max-h-[88vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Mercado Global P2P</h2>
                <p className="text-xs text-zinc-400">Compre e venda produtos diretamente com outros jogadores com segurança ACID</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Abas Superiores */}
          <div className="flex items-center gap-2 py-3 border-b border-white/5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'browse'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Explorar Ofertas
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Criar Anúncio
            </button>
            <button
              onClick={() => setActiveTab('my_listings')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'my_listings'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Meus Anúncios
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Histórico Público
            </button>
          </div>

          {/* Aba: Explorar Ofertas */}
          {activeTab === 'browse' && (
            <div className="flex-1 overflow-hidden flex flex-col py-3">
              {/* Barra de Busca e Filtros */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar por nome do produto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300"
                  >
                    <option value="all">Todas Categorias</option>
                    <option value="crop">Colheitas</option>
                    <option value="animal_product">Produtos Animais</option>
                    <option value="feed">Rações</option>
                  </select>

                  <select
                    value={`${sortBy}_${sortOrder}`}
                    onChange={e => {
                      const [by, ord] = e.target.value.split('_');
                      setSortBy(by as any);
                      setSortOrder(ord as any);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300"
                  >
                    <option value="created_at_DESC">Mais Recentes</option>
                    <option value="unit_price_ASC">Menor Preço</option>
                    <option value="unit_price_DESC">Maior Preço</option>
                  </select>
                </div>
              </div>

              {/* Grid de Ofertas */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                  <div className="col-span-full py-16 text-center text-zinc-500">Buscando ofertas no mercado...</div>
                ) : listings.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-zinc-500">
                    Nenhum anúncio ativo encontrado. Seja o primeiro a anunciar!
                  </div>
                ) : (
                  listings.map(item => {
                    const isOwnListing = user?.id === item.sellerId;
                    const isBuyingThis = buyingListingId === item.id;
                    const canAfford = user ? user.wallet.goldCoins >= (item.unitPrice * buyQuantity) : false;

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                            <ItemSprite spriteId={item.item.spriteId} size={40} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{item.item.name}</h4>
                            <div className="text-[11px] text-zinc-400">
                              Vendedor: <span className="text-zinc-200">{item.sellerUsername}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5" />
                                {item.unitPrice} /un
                              </span>
                              <span className="text-xs text-zinc-400 font-mono">
                                Restam: <strong className="text-white">{item.quantity}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ação de Compra */}
                        <div className="pt-2 border-t border-white/5">
                          {isOwnListing ? (
                            <span className="block text-center text-[11px] text-zinc-500 py-1 font-medium">
                              Seu próprio anúncio
                            </span>
                          ) : isBuyingThis ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-400">Qtd:</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.quantity}
                                  value={buyQuantity}
                                  onChange={e => setBuyQuantity(Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                                  className="w-16 px-2 py-1 rounded bg-black/50 border border-white/10 text-xs text-white font-mono"
                                />
                                <span className="text-xs font-mono text-amber-400 font-bold ml-auto">
                                  Total: {(item.unitPrice * buyQuantity).toLocaleString('pt-BR')} Ouro
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={isProcessingBuy || !canAfford}
                                  onClick={() => handleBuy(item, buyQuantity)}
                                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                                    canAfford
                                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                  }`}
                                >
                                  {canAfford ? 'Confirmar Compra' : 'Saldo Insuficiente'}
                                </button>
                                <button
                                  onClick={() => setBuyingListingId(null)}
                                  className="px-2 py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setBuyingListingId(item.id);
                                setBuyQuantity(1);
                              }}
                              className="w-full py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              Comprar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Aba: Criar Novo Anúncio */}
          {activeTab === 'create' && (
            <div className="flex-1 overflow-y-auto py-4 max-w-lg mx-auto w-full">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base">Publicar Novo Anúncio P2P</h3>
                
                {userInventory.length === 0 ? (
                  <div className="text-sm text-zinc-500 py-6 text-center">
                    Você não possui produtos colhidos ou itens animais no inventário para vender.
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">Selecione o Item para Venda:</label>
                      <select
                        value={selectedItemToSell}
                        onChange={e => {
                          setSelectedItemToSell(e.target.value);
                          const it = userInventory.find(i => i.itemId === e.target.value);
                          if (it) {
                            setSellPrice(Math.round(it.baseSellPrice * 1.3));
                            setSellQty(1);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                      >
                        {userInventory.map(item => (
                          <option key={item.itemId} value={item.itemId}>
                            {item.name} (Disponível: {item.quantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-400">Quantidade:</label>
                        <input
                          type="number"
                          min={1}
                          max={selectedInventoryItem?.quantity || 1}
                          value={sellQty}
                          onChange={e => setSellQty(Math.min(selectedInventoryItem?.quantity || 1, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-zinc-400">Preço Unitário (Ouro):</label>
                        <input
                          type="number"
                          min={1}
                          value={sellPrice}
                          onChange={e => setSellPrice(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-amber-300 font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Resumo da Venda e Taxa de Corretagem */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Preço Bruto Total:</span>
                        <span className="font-mono text-zinc-200">{estimatedGross} Ouro</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Taxa do Mercado (8%):</span>
                        <span className="font-mono text-rose-400">-{estimatedFee} Ouro</span>
                      </div>
                      <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5">
                        <span>Você Receberá Líquido:</span>
                        <span className="font-mono text-emerald-400">{estimatedNet} Ouro</span>
                      </div>
                    </div>

                    <button
                      disabled={submittingListing}
                      onClick={handleCreateListing}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-sm text-white shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all"
                    >
                      {submittingListing ? 'Publicando...' : 'Publicar Anúncio no Mercado'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Aba: Meus Anúncios */}
          {activeTab === 'my_listings' && (
            <div className="flex-1 overflow-y-auto py-3">
              {listings.filter(l => l.sellerId === user?.id).length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-sm">
                  Você não tem anúncios ativos no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listings
                    .filter(l => l.sellerId === user?.id)
                    .map(item => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <ItemSprite spriteId={item.item.spriteId} size={40} />
                          <div>
                            <h4 className="font-semibold text-white text-sm">{item.item.name}</h4>
                            <div className="text-xs text-zinc-400">
                              Restante: <strong className="text-white">{item.quantity}</strong> • {item.unitPrice} Ouro/un
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCancelListing(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancelar
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Aba: Histórico Público de Transações */}
          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto py-3">
              {historyList.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-sm">
                  Nenhuma transação registrada recentemente no mercado.
                </div>
              ) : (
                <div className="space-y-2">
                  {historyList.map(tx => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <ItemSprite spriteId={tx.spriteId} size={32} />
                        <div>
                          <span className="font-semibold text-white">{tx.buyerUsername}</span>
                          <span className="text-zinc-500"> comprou </span>
                          <span className="text-emerald-400 font-semibold">{tx.quantity}x {tx.itemName}</span>
                          <span className="text-zinc-500"> de </span>
                          <span className="font-semibold text-white">{tx.sellerUsername}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-400 flex items-center gap-1 justify-end">
                          <Coins className="w-3.5 h-3.5" />
                          {tx.totalPrice} Ouro
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Taxa: {tx.feeAmount} Ouro
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </CardDoubleBezel>
      </div>
    </div>
  );
};
