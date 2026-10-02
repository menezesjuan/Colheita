import React, { useState, useEffect } from 'react';
import { X, Trophy, Eye, Coins, Sparkles, User, MapPin } from 'lucide-react';
import { CardDoubleBezel } from '../common/CardDoubleBezel.js';
import { SoilTileSprite, GrassTileSprite, CropGrowthSprite, AnimalSprite } from '../sprites/GameSprites.js';
import { apiRequest } from '../../api/client.js';

interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  title: string;
  goldCoins: number;
  farmName: string;
}

interface PublicFarmData {
  owner: {
    username: string;
    displayName: string;
    level: number;
    title: string;
    bio: string;
  };
  farm: {
    name: string;
    width: number;
    height: number;
    tiles: any[];
  };
  animals: any[];
}

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visitingFarm, setVisitingFarm] = useState<PublicFarmData | null>(null);
  const [loadingVisit, setLoadingVisit] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<LeaderboardUser[]>('/social/leaderboard');
      if (res.success && res.data) {
        setLeaderboard(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      setVisitingFarm(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVisitUser = async (userId: string) => {
    setLoadingVisit(true);
    try {
      const res = await apiRequest<PublicFarmData>(`/social/farms/${userId}`);
      if (res.success && res.data) {
        setVisitingFarm(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao visitar fazenda.');
    } finally {
      setLoadingVisit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-4xl">
        <CardDoubleBezel innerClassName="p-6 max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Trophy className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Comunidade & Ranking Rural</h2>
                <p className="text-xs text-zinc-400">Descubra os maiores produtores do servidor e visite suas propriedades</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (visitingFarm) {
                  setVisitingFarm(null);
                } else {
                  onClose();
                }
              }}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-y-auto py-4">
            {visitingFarm ? (
              /* Visão de Visita a Outra Fazenda */
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                      {visitingFarm.owner.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {visitingFarm.farm.name}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          Nível {visitingFarm.owner.level}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">Proprietário: {visitingFarm.owner.displayName} (@{visitingFarm.owner.username})</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setVisitingFarm(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-zinc-300"
                  >
                    Voltar ao Ranking
                  </button>
                </div>

                {/* Grid Visual da Fazenda do Jogador Visitado */}
                <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="grid grid-cols-6 gap-2">
                    {visitingFarm.farm.tiles.map(tile => (
                      <div
                        key={tile.id}
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center overflow-hidden"
                      >
                        <div className="absolute inset-0">
                          {tile.tileType === 'soil' ? (
                            <SoilTileSprite size={undefined} className="w-full h-full" isWatered={tile.wateredAt !== null} />
                          ) : (
                            <GrassTileSprite size={undefined} className="w-full h-full" />
                          )}
                        </div>

                        {tile.cropId && (
                          <div className="relative z-10 flex flex-col items-center justify-center">
                            <CropGrowthSprite cropId={tile.cropId} state={tile.state as any} size={40} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animais do Jogador Visitado */}
                {visitingFarm.animals.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Criações no Curral</h4>
                    <div className="flex items-center gap-4 overflow-x-auto">
                      {visitingFarm.animals.map(a => (
                        <div key={a.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2">
                          <AnimalSprite animalId={a.animalId} size={36} />
                          <div className="text-xs">
                            <div className="font-semibold text-white">{a.nickname}</div>
                            <div className="text-[10px] text-zinc-400">{a.animalName}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Tabela do Ranking Global */
              <div className="space-y-2">
                {loading ? (
                  <div className="py-16 text-center text-zinc-500">Calculando posições do ranking...</div>
                ) : (
                  leaderboard.map(lb => (
                    <div
                      key={lb.userId}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          lb.rank === 1
                            ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/40'
                            : lb.rank === 2
                            ? 'bg-zinc-300 text-zinc-950'
                            : lb.rank === 3
                            ? 'bg-amber-700 text-zinc-100'
                            : 'bg-white/[0.05] text-zinc-400'
                        }`}>
                          #{lb.rank}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{lb.displayName}</span>
                            <span className="text-xs text-zinc-500">@{lb.username}</span>
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 font-semibold">Nível {lb.level}</span>
                            <span>•</span>
                            <span className="text-zinc-400">{lb.farmName || 'Fazenda Solar'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 justify-end">
                            <Coins className="w-3.5 h-3.5" />
                            {lb.goldCoins.toLocaleString('pt-BR')} Ouro
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {lb.xp.toLocaleString('pt-BR')} XP
                          </div>
                        </div>

                        <button
                          disabled={loadingVisit}
                          onClick={() => handleVisitUser(lb.userId)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
                          title="Visitar Fazenda"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          Visitar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </CardDoubleBezel>
      </div>
    </div>
  );
};
