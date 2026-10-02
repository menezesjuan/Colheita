import React, { useState, useEffect } from 'react';
import { Shovel, Sparkles, Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoilTileSprite, GrassTileSprite, CropGrowthSprite } from '../sprites/GameSprites.js';

export interface TileData {
  id: string;
  x: number;
  y: number;
  tileType: 'soil' | 'grass' | 'water' | 'building' | 'animal_pen';
  cropId: string | null;
  cropName: string | null;
  plantedAt: string | null;
  wateredAt: string | null;
  state: 'empty' | 'planted' | 'growing' | 'ready' | 'withered';
  secondsRemaining: number;
  growthProgressPercent: number;
}

interface FarmCanvasProps {
  tiles: TileData[];
  selectedTool: 'inspect' | 'till' | 'plant' | 'harvest';
  selectedSeedId: string | null;
  onPlant: (x: number, y: number, seedId: string) => Promise<void>;
  onHarvest: (x: number, y: number) => Promise<void>;
  onTill: (x: number, y: number) => Promise<void>;
}

export const FarmCanvas: React.FC<FarmCanvasProps> = ({
  tiles,
  selectedTool,
  selectedSeedId,
  onPlant,
  onHarvest,
  onTill
}) => {
  // Estado local para tick de contagem regressiva em tempo real a cada segundo
  const [localTiles, setLocalTiles] = useState<TileData[]>(tiles);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLocalTiles(tiles);
  }, [tiles]);

  // Timer local a cada segundo para decrementar o secondsRemaining no cliente
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTiles(prev =>
        prev.map(t => {
          if (t.state === 'growing' && t.secondsRemaining > 0) {
            const nextSec = t.secondsRemaining - 1;
            return {
              ...t,
              secondsRemaining: nextSec,
              state: nextSec === 0 ? 'ready' : 'growing'
            };
          }
          return t;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTileClick = async (tile: TileData) => {
    const tileKey = `${tile.x}-${tile.y}`;
    if (actionLoading) return;

    try {
      setActionLoading(tileKey);

      // Ação inteligente baseada no estado do tile ou na ferramenta selecionada
      if (tile.tileType === 'grass') {
        await onTill(tile.x, tile.y);
        return;
      }

      if (tile.tileType === 'soil') {
        if (tile.state === 'ready') {
          // Colheita com efeito de celebração
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.7 }
          });
          await onHarvest(tile.x, tile.y);
          return;
        }

        if (tile.state === 'empty') {
          if (!selectedSeedId) {
            alert('Selecione uma semente na barra inferior antes de plantar!');
            return;
          }
          await onPlant(tile.x, tile.y, selectedSeedId);
          return;
        }
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar ação no canteiro.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Moldura da Fazenda com Double Bezel */}
      <div className="relative p-3 rounded-3xl bg-white/[0.02] ring-1 ring-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
        <div className="relative p-6 rounded-[calc(1.5rem-0.375rem)] bg-[#0a110c] border border-white/5 overflow-hidden">
          
          {/* Luz ambiente volumétrica de fundo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Grid da Fazenda (6 colunas) */}
          <div className="grid grid-cols-6 gap-2.5 relative z-10">
            {localTiles.map(tile => {
              const isHovered = hoveredTile?.x === tile.x && hoveredTile?.y === tile.y;
              const isReady = tile.state === 'ready';
              const isGrowing = tile.state === 'growing';
              const isLoading = actionLoading === `${tile.x}-${tile.y}`;

              return (
                <div
                  key={tile.id}
                  onMouseEnter={() => setHoveredTile({ x: tile.x, y: tile.y })}
                  onMouseLeave={() => setHoveredTile(null)}
                  onClick={() => handleTileClick(tile)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl cursor-pointer select-none transition-all duration-200 flex items-center justify-center ${
                    isReady ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-[1.03] animate-pulse' : ''
                  } ${isHovered ? 'scale-[1.04]' : ''} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {/* Sprite do Terreno de Fundo */}
                  <div className="absolute inset-0">
                    {tile.tileType === 'soil' ? (
                      <SoilTileSprite size={undefined} className="w-full h-full" isHovered={isHovered} isWatered={tile.wateredAt !== null} />
                    ) : (
                      <GrassTileSprite size={undefined} className="w-full h-full" isHovered={isHovered} />
                    )}
                  </div>

                  {/* Conteúdo do Canteiro: Planta / Broto / Maduro */}
                  {tile.cropId && (
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <CropGrowthSprite cropId={tile.cropId} state={tile.state as any} size={48} />
                    </div>
                  )}

                  {/* Indicador de Solo Vazio para Arar */}
                  {tile.tileType === 'grass' && isHovered && (
                    <div className="relative z-10 flex flex-col items-center justify-center bg-black/60 rounded-full p-1.5 backdrop-blur-sm">
                      <Shovel className="w-4 h-4 text-emerald-300" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Timer de Crescimento Flutuante */}
                  {isGrowing && (
                    <div className="absolute bottom-1 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 z-20">
                      <Clock className="w-2.5 h-2.5 text-emerald-400" strokeWidth={1.5} />
                      <span className="text-[10px] font-mono text-zinc-300 font-semibold">
                        {tile.secondsRemaining}s
                      </span>
                    </div>
                  )}

                  {/* Destaque de Colheita Pronta */}
                  {isReady && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-400/40 z-20">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dica de Ação no Rodapé do Tabuleiro */}
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Tempo do Servidor Sincronizado
            </span>
            <span className="text-zinc-500">
              Clique na grama para arar • Clique na colheita madura para colher
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
