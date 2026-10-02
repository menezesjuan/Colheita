import React from 'react';
import { Shovel, Sparkles, MousePointer, Info } from 'lucide-react';
import { ItemSprite } from '../sprites/GameSprites.js';

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 w-full max-w-2xl">
      <div className="backdrop-blur-2xl bg-zinc-950/80 border border-white/10 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-3 overflow-x-auto">
        
        {/* Ferramentas Básicas */}
        <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
          <button
            onClick={() => onSelectTool('inspect')}
            className={`p-2.5 rounded-xl transition-all ${
              selectedTool === 'inspect'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Modo Inspeção"
          >
            <MousePointer className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <button
            onClick={() => onSelectTool('till')}
            className={`p-2.5 rounded-xl transition-all ${
              selectedTool === 'till'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Arar Terra"
          >
            <Shovel className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Lista de Sementes Disponíveis */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {seeds.length === 0 ? (
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 px-3 py-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
              Sem sementes. Compre na Loja!
            </div>
          ) : (
            seeds.map(seed => {
              const isSelected = selectedSeedId === seed.id;
              return (
                <button
                  key={seed.id}
                  onClick={() => {
                    onSelectSeed(isSelected ? null : seed.id);
                    onSelectTool('plant');
                  }}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all select-none ${
                    isSelected
                      ? 'bg-emerald-500/20 border border-emerald-400/50 shadow-lg shadow-emerald-950/50'
                      : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-zinc-300'
                  }`}
                >
                  <ItemSprite spriteId={seed.spriteId} size={28} />
                  <div className="text-left">
                    <div className="text-xs font-semibold leading-tight text-white">{seed.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-medium">x{seed.quantity}</div>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
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
