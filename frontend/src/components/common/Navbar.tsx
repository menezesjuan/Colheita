import React from 'react';
import { 
  Sprout, 
  Coins, 
  Sparkles, 
  Package, 
  Store, 
  ShoppingBag, 
  Bird, 
  CheckCircle2, 
  Trophy, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface NavbarProps {
  onOpenInventory: () => void;
  onOpenShop: () => void;
  onOpenAnimals: () => void;
  onOpenMarket: () => void;
  onOpenMissions: () => void;
  onOpenSocial: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInventory,
  onOpenShop,
  onOpenAnimals,
  onOpenMarket,
  onOpenMissions,
  onOpenSocial,
  onOpenAdmin
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-4 z-40 px-4 mb-6">
      <div className="max-w-6xl mx-auto backdrop-blur-2xl bg-black/60 border border-white/10 rounded-full px-5 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-between gap-4 flex-wrap">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 p-[1px] flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Colheita dos Sonhos
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0
              </span>
            </span>
            <div className="text-[11px] text-zinc-400 font-medium">
              Fazenda de <span className="text-zinc-200">{user.username}</span> • Nível {user.profile.level}
            </div>
          </div>
        </div>

        {/* Status de Moedas do Jogador */}
        <div className="flex items-center gap-3">
          {/* Ouro */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Coins className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
            <span className="text-xs font-bold text-amber-300 font-mono tracking-wide">
              {user.wallet.goldCoins.toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Gemas */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.5} />
            <span className="text-xs font-bold text-cyan-300 font-mono tracking-wide">
              {user.wallet.gems}
            </span>
          </div>
        </div>

        {/* Botões de Ação e Navegação */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 active:scale-[0.96] transition-all"
            title="Armazém / Inventário"
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Armazém</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 active:scale-[0.96] transition-all"
            title="Loja da Vila"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Loja</span>
          </button>

          <button
            onClick={onOpenAnimals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 active:scale-[0.96] transition-all"
            title="Curral de Animais"
          >
            <Bird className="w-3.5 h-3.5 text-sky-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Animais</span>
          </button>

          <button
            onClick={onOpenMarket}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 active:scale-[0.96] transition-all"
            title="Mercado Global P2P"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Mercado P2P</span>
          </button>

          <button
            onClick={onOpenMissions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 active:scale-[0.96] transition-all"
            title="Missões Diárias"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Missões</span>
          </button>

          <button
            onClick={onOpenSocial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 active:scale-[0.96] transition-all"
            title="Ranking & Visitas"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Social</span>
          </button>

          {user.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-[0.96] transition-all"
              title="Painel Administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button
            onClick={logout}
            className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-white/[0.05] active:scale-[0.95] transition-all"
            title="Sair da Conta"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

      </div>
    </header>
  );
};
