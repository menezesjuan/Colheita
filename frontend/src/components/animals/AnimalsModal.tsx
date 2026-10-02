import React, { useState, useEffect } from 'react';
import { X, Bird, Utensils, Sparkles, Clock, Coins, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CardDoubleBezel } from '../common/CardDoubleBezel.js';
import { AnimalSprite, ItemSprite } from '../sprites/GameSprites.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../api/client.js';
import { sounds } from '../../utils/sound.js';

interface AnimalInstanceData {
  id: string;
  farmId: string;
  animalId: string;
  animalName: string;
  nickname: string;
  feedItemId: string;
  feedName: string;
  produceItemId: string;
  produceName: string;
  produceSprite: string;
  produceIntervalSeconds: number;
  fedAt: string | null;
  isFed: boolean;
  isProducing: boolean;
  canCollect: boolean;
  secondsRemaining: number | null;
  xpReward: number;
}

interface AnimalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshFarm: () => Promise<void>;
}

export const AnimalsModal: React.FC<AnimalsModalProps> = ({ isOpen, onClose, onRefreshFarm }) => {
  const { user, refreshUser } = useAuth();
  const [animals, setAnimals] = useState<AnimalInstanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'corral' | 'market'>('corral');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const availableSpecies = [
    { id: 'animal_chicken', name: 'Galinha Carijó', cost: 250, minLevel: 2, desc: 'Produz Ovos Caipiras a cada 90s.', feed: 'feed_chicken', feedName: 'Ração de Grãos' },
    { id: 'animal_cow', name: 'Vaca Holandesa', cost: 800, minLevel: 3, desc: 'Produz Garrafas de Leite a cada 180s.', feed: 'feed_cattle', feedName: 'Feno Aromático' },
    { id: 'animal_sheep', name: 'Ovelha Merino', cost: 1800, minLevel: 5, desc: 'Produz Novelo de Lã Nobre a cada 360s.', feed: 'feed_sheep', feedName: 'Mistura de Pasto' }
  ];

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<AnimalInstanceData[]>('/animals');
      if (res.success && res.data) {
        setAnimals(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnimals();
    }
  }, [isOpen]);

  // Tick local a cada segundo para decrementar o secondsRemaining dos animais
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setAnimals(prev =>
        prev.map(a => {
          if (a.isProducing && a.secondsRemaining !== null && a.secondsRemaining > 0) {
            const nextSec = a.secondsRemaining - 1;
            return {
              ...a,
              secondsRemaining: nextSec,
              canCollect: nextSec === 0,
              isProducing: nextSec > 0
            };
          }
          return a;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFeed = async (instanceId: string) => {
    setActionLoading(instanceId);
    try {
      const res = await apiRequest('/animals/feed', {
        method: 'POST',
        body: JSON.stringify({ instanceId })
      });
      if (!res.success) throw new Error(res.error);
      sounds.playPlant();
      await fetchAnimals();
    } catch (err: any) {
      alert(err.message || 'Falha ao alimentar animal.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCollect = async (instanceId: string) => {
    setActionLoading(instanceId);
    try {
      const res = await apiRequest('/animals/collect', {
        method: 'POST',
        body: JSON.stringify({ instanceId })
      });
      if (!res.success) throw new Error(res.error);

      sounds.playHarvest();
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
      await fetchAnimals();
      await refreshUser();
      await onRefreshFarm();
    } catch (err: any) {
      alert(err.message || 'Falha ao coletar produção.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBuyAnimal = async (animalId: string) => {
    setActionLoading(animalId);
    try {
      const res = await apiRequest('/animals/buy', {
        method: 'POST',
        body: JSON.stringify({ animalId })
      });
      if (!res.success) throw new Error(res.error);

      sounds.playCoins();
      await fetchAnimals();
      await refreshUser();
      setActiveTab('corral');
    } catch (err: any) {
      alert(err.message || 'Falha ao comprar animal.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-4xl">
        <CardDoubleBezel innerClassName="p-6 max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Bird className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Curral & Criações</h2>
                <p className="text-xs text-zinc-400">Cuide de seus animais, alimente-os e colete ovos, leite e lã</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Abas */}
          <div className="flex items-center gap-2 py-3 border-b border-white/5">
            <button
              onClick={() => setActiveTab('corral')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'corral'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Meus Animais ({animals.length})
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'market'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Comprar Criações
            </button>
          </div>

          {/* Conteúdo da Aba */}
          <div className="flex-1 overflow-y-auto pr-1 py-4">
            {activeTab === 'corral' ? (
              animals.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-sm flex flex-col items-center gap-3">
                  <Bird className="w-12 h-12 text-zinc-600" strokeWidth={1} />
                  <span>Você ainda não possui animais em sua fazenda.</span>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs"
                  >
                    Adquirir Primeiro Animal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animals.map(animal => (
                    <div
                      key={animal.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                          <AnimalSprite animalId={animal.animalId} size={50} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{animal.nickname}</h4>
                          <span className="text-xs text-zinc-400">{animal.animalName}</span>
                          
                          <div className="mt-1 flex items-center gap-2">
                            {animal.canCollect ? (
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                Pronto para Coleta!
                              </span>
                            ) : animal.isProducing ? (
                              <span className="text-xs text-zinc-300 font-mono flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-sky-400" />
                                {animal.secondsRemaining}s restantes
                              </span>
                            ) : (
                              <span className="text-xs text-amber-400 flex items-center gap-1">
                                <Utensils className="w-3.5 h-3.5" />
                                Com fome
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botão de Ação */}
                      <div>
                        {animal.canCollect ? (
                          <button
                            disabled={actionLoading === animal.id}
                            onClick={() => handleCollect(animal.id)}
                            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-[0.96] transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Coletar
                          </button>
                        ) : animal.isProducing ? (
                          <div className="px-3 py-2 rounded-xl bg-white/[0.04] text-zinc-400 text-xs font-mono">
                            Produzindo...
                          </div>
                        ) : (
                          <button
                            disabled={actionLoading === animal.id}
                            onClick={() => handleFeed(animal.id)}
                            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-[0.96] transition-all"
                            title={`Requer 1x ${animal.feedName}`}
                          >
                            <Utensils className="w-3.5 h-3.5" />
                            Alimentar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Catálogo de Animais para Compra */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableSpecies.map(sp => {
                  const isLocked = user ? user.profile.level < sp.minLevel : true;
                  const canAfford = user ? user.wallet.goldCoins >= sp.cost : false;

                  return (
                    <div
                      key={sp.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isLocked
                          ? 'opacity-40 bg-black/40 border-white/5'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 mb-3">
                          <AnimalSprite animalId={sp.id} size={64} />
                        </div>
                        <h4 className="font-bold text-white text-base">{sp.name}</h4>
                        <p className="text-xs text-zinc-400 mt-1">{sp.desc}</p>
                        <span className="text-[11px] text-zinc-500 mt-2 font-medium">
                          Alimento: {sp.feedName}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {sp.cost}
                        </span>

                        {isLocked ? (
                          <span className="text-xs text-rose-400 font-semibold">
                            Nível {sp.minLevel}
                          </span>
                        ) : (
                          <button
                            disabled={!canAfford || actionLoading === sp.id}
                            onClick={() => handleBuyAnimal(sp.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                              canAfford
                                ? 'bg-sky-500 hover:bg-sky-400 text-zinc-950 active:scale-[0.96]'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Comprar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </CardDoubleBezel>
      </div>
    </div>
  );
};
