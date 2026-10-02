import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Coins, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CardDoubleBezel } from '../common/CardDoubleBezel.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../api/client.js';

interface MissionData {
  id: string;
  title: string;
  description: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  rewardGold: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ isOpen, onClose }) => {
  const { refreshUser } = useAuth();
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<MissionData[]>('/missions');
      if (res.success && res.data) {
        setMissions(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMissions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      const res = await apiRequest(`/missions/${missionId}/claim`, {
        method: 'POST'
      });
      if (!res.success) throw new Error(res.error);

      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      await fetchMissions();
      await refreshUser();
    } catch (err: any) {
      alert(err.message || 'Falha ao resgatar recompensa.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl">
        <CardDoubleBezel innerClassName="p-6 max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Missões da Fazenda</h2>
                <p className="text-xs text-zinc-400">Complete tarefas diárias para receber ouro e acelerar seu nível</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Lista de Missões */}
          <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-3">
            {loading ? (
              <div className="py-12 text-center text-zinc-500">Carregando missões...</div>
            ) : missions.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">Nenhuma missão ativa no momento.</div>
            ) : (
              missions.map(m => {
                const progressPct = Math.min(100, Math.round((m.currentAmount / m.targetAmount) * 100));

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-white text-sm">{m.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{m.description}</p>

                      {/* Barra de Progresso */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                          <span>Progresso: {m.currentAmount} / {m.targetAmount}</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Recompensas */}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-mono text-amber-400 font-semibold flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          +{m.rewardGold} Ouro
                        </span>
                        <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          +{m.rewardXp} XP
                        </span>
                      </div>
                    </div>

                    {/* Botão de Resgate */}
                    <div className="self-end sm:self-center">
                      {m.claimed ? (
                        <div className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-500 text-xs font-semibold">
                          Resgatado
                        </div>
                      ) : m.completed ? (
                        <button
                          disabled={claimingId === m.id}
                          onClick={() => handleClaim(m.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-[0.96] transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Resgatar
                        </button>
                      ) : (
                        <div className="px-4 py-2 rounded-xl bg-black/40 text-zinc-500 text-xs font-mono">
                          Em andamento
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </CardDoubleBezel>
      </div>
    </div>
  );
};
