import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Coins, 
  TrendingUp, 
  Sliders, 
  FileText, 
  Ban, 
  CheckCircle, 
  Check 
} from 'lucide-react';
import { CardDoubleBezel } from '../common/CardDoubleBezel.js';
import { apiRequest } from '../../api/client.js';

interface AdminMetrics {
  totalUsers: number;
  circulatingGold: number;
  circulatingGems: number;
  marketVolume: number;
  feesCollected: number;
  totalTransactions: number;
  activeListings: number;
  currentMarketFee: number;
}

interface AdminUserItem {
  id: string;
  username: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  displayName: string;
  level: number;
  goldCoins: number;
}

interface AuditLogItem {
  id: string;
  action: string;
  targetEntity: string;
  targetId: string;
  payload: any;
  actorUsername: string;
  createdAt: string;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'config' | 'logs'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edição de taxa
  const [newFee, setNewFee] = useState<number>(8);
  const [savingFee, setSavingFee] = useState<boolean>(false);
  const [feeSuccess, setFeeSuccess] = useState<boolean>(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes, lRes] = await Promise.all([
        apiRequest<AdminMetrics>('/admin/metrics'),
        apiRequest<AdminUserItem[]>('/admin/users'),
        apiRequest<AuditLogItem[]>('/admin/audit-logs')
      ]);

      if (mRes.success && mRes.data) {
        setMetrics(mRes.data);
        setNewFee(mRes.data.currentMarketFee);
      }
      if (uRes.success && uRes.data) setUsers(uRes.data);
      if (lRes.success && lRes.data) setAuditLogs(lRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    try {
      const res = await apiRequest(`/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ isBanned: !currentBanned })
      });
      if (!res.success) throw new Error(res.error);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar suspensão.');
    }
  };

  const handleUpdateFee = async () => {
    setSavingFee(true);
    setFeeSuccess(false);
    try {
      const res = await apiRequest('/admin/config/market-fee', {
        method: 'POST',
        body: JSON.stringify({ feePercent: newFee })
      });
      if (!res.success) throw new Error(res.error);
      setFeeSuccess(true);
      await fetchAdminData();
      setTimeout(() => setFeeSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar taxa.');
    } finally {
      setSavingFee(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-5xl">
        <CardDoubleBezel innerClassName="p-6 max-h-[88vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Painel de Governança & Administração</h2>
                <p className="text-xs text-zinc-400">Controle macroeconômico, gestão de jogadores e auditoria em tempo real</p>
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
          <div className="flex items-center gap-2 py-3 border-b border-white/5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'metrics'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Métricas Macroeconômicas
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Jogadores ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'config'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Parâmetros Econômicos
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Logs de Auditoria
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="py-16 text-center text-zinc-500">Carregando dados administrativos...</div>
            ) : activeTab === 'metrics' && metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Usuários */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Usuários Registrados</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {metrics.totalUsers}
                  </div>
                </div>

                {/* Ouro em Circulação */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Ouro em Circulação</span>
                    <Coins className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {metrics.circulatingGold.toLocaleString('pt-BR')}
                  </div>
                </div>

                {/* Volume P2P */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Volume Transacionado P2P</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-300">
                    {metrics.marketVolume.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {metrics.totalTransactions} operações realizadas
                  </div>
                </div>

                {/* Taxas Recolhidas (Sink) */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-medium">Ouro Queimado (Taxas P2P)</span>
                    <Coins className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-300">
                    {metrics.feesCollected.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Taxa atual: {metrics.currentMarketFee}%
                  </div>
                </div>

              </div>
            ) : activeTab === 'users' ? (
              <div className="space-y-2">
                {users.map(u => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.displayName}</span>
                        <span className="text-zinc-500">@{u.username}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                        {u.isBanned && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-400 text-[10px] font-bold">
                            SUSPENSO
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-400 mt-1">
                        E-mail: {u.email} • Nível {u.level} • {u.goldCoins.toLocaleString('pt-BR')} Ouro
                      </div>
                    </div>

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleBan(u.id, u.isBanned)}
                        className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
                          u.isBanned
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        {u.isBanned ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Reativar Conta
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" /> Suspender
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : activeTab === 'config' ? (
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-base">Calibração da Taxa de Mercado P2P</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A taxa é recolhida em cada transação bem-sucedida no Mercado Livre entre jogadores e permanentemente drenada da economia para conter pressões inflacionárias.
                </p>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-300 font-medium">Percentual de Corretagem (%):</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={newFee}
                      onChange={e => setNewFee(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                      className="w-24 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono font-bold text-base text-center"
                    />
                    <span className="text-xs text-zinc-400">Padrão recomendado: 8%</span>
                  </div>
                </div>

                {feeSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Parâmetro atualizado com sucesso!
                  </div>
                )}

                <button
                  disabled={savingFee}
                  onClick={handleUpdateFee}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white transition-all active:scale-[0.98]"
                >
                  {savingFee ? 'Salvando...' : 'Salvar e Aplicar no Banco'}
                </button>
              </div>
            ) : (
              /* Logs de Auditoria */
              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs flex flex-col gap-1 font-mono"
                  >
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-bold text-rose-400">{log.action}</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-zinc-300 text-[11px]">
                      Ator: <strong className="text-white">{log.actorUsername}</strong> • Entidade: {log.targetEntity} (ID: {log.targetId || 'N/A'})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </CardDoubleBezel>
      </div>
    </div>
  );
};
