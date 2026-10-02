import React from 'react';
import { Shovel, MousePointer, Info, Sparkles } from 'lucide-react';
import { ItemSprite } from '../sprites/GameSprites.js';
import { sounds } from '../../utils/sound.js';

interface SeedItem {
  id: string;
  name: string;
  quantity: number;
  spriteId: string;
}

interface SeedSelectorProps {
  seeds: SeedItem[];
  selectedSeedId: string | null;
  onSelectSeed: (seedId: string | null) => void;
  selectedTool: 'inspect' | 'till' | 'plant' | 'harvest';
  onSelectTool: (tool: 'inspect' | 'till' | 'plant' | 'harvest') => void;
}

export const SeedSelector: React.FC<SeedSelectorProps> = ({
  seeds,
  selectedSeedId,
  onSelectSeed,
  selectedTool,
  onSelectTool
}) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 px-4 w-full max-w-2xl">
      <div className="backdrop-blur-2xl bg-zinc-950/85 border border-white/10 rounded-3xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-between gap-3 overflow-x-auto">
        
        {/* Ferramentas Básicas (Enxada e Inspeção) */}
        <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTool('inspect');
            }}
            className={`p-2.5 rounded-2xl transition-all active:scale-[0.94] ${
              selectedTool === 'inspect'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Inspecionar Canteiros"
          >
            <MousePointer className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTool('till');
            }}
            className={`p-2.5 rounded-2xl transition-all active:scale-[0.94] ${
              selectedTool === 'till'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Arar Terra Virgem"
          >
            <Shovel className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Sementes Ativas do Jogador */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {seeds.length === 0 ? (
            <div className="text-xs text-zinc-400 flex items-center gap-2 px-4 py-1.5 font-medium">
              <Info className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              <span>Sem sementes no armazém. Adquira na <strong>Loja da Vila</strong>!</span>
            </div>
          ) : (
            seeds.map(seed => {
              const isSelected = selectedSeedId === seed.id;
              return (
                <button
                  key={seed.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectSeed(isSelected ? null : seed.id);
                    onSelectTool('plant');
                  }}
                  className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all select-none active:scale-[0.95] ${
                    isSelected
                      ? 'bg-emerald-500/25 border border-emerald-400/50 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                      : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] text-zinc-300'
                  }`}
                >
                  <ItemSprite spriteId={seed.spriteId} size={30} />
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight text-white">{seed.name}</div>
                    <div className="text-[11px] text-emerald-400 font-mono font-bold">x{seed.quantity}</div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
                  )}
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
