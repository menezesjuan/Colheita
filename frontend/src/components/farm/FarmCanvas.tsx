import React, { useState, useEffect } from 'react';
import { Shovel, Sparkles, Clock, Droplets, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  SoilTileIsometric, 
  GrassTileIsometric, 
  CropStageIsometric,
  WindmillSprite,
  FarmhouseSprite,
  BarnSprite,
  GuardDogSprite,
  ScarecrowSprite
} from '../sprites/GameSprites.js';
import { sounds } from '../../utils/sound.js';

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
  const [localTiles, setLocalTiles] = useState<TileData[]>(tiles);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sincronizar tiles externos
  useEffect(() => {
    setLocalTiles(tiles);
  }, [tiles]);

  // Contagem regressiva suave no cliente a cada segundo
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

      if (tile.tileType === 'grass') {
        sounds.playTill();
        await onTill(tile.x, tile.y);
        return;
      }

      if (tile.tileType === 'soil') {
        if (tile.state === 'ready') {
          sounds.playHarvest();
          confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.65 }
          });
          await onHarvest(tile.x, tile.y);
          return;
        }

        if (tile.state === 'empty') {
          if (!selectedSeedId) {
            sounds.playClick();
            alert('Selecione uma semente na barra inferior antes de plantar!');
            return;
          }
          sounds.playPlant();
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

  // Parâmetros da Grade Isométrica 2.5D
  const tileWidth = 104;
  const tileHeight = 52;
  const originX = 350; // centro do campo
  const originY = 110;

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
      
      {/* Botão de Controle de Efeitos Sonoros */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Fazenda Viva em 2.5D</span>
          <span className="text-zinc-500">• Estilo Colheita Feliz</span>
        </div>

        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sounds.enabled = next;
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 transition-all active:scale-[0.96]"
          title="Alternar Áudio Orgânico do Jogo"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sons Ativos</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              <span>Sons Mudos</span>
            </>
          )}
        </button>
      </div>

      {/* Caixa do Cenário Rural com Double Bezel de Luxo */}
      <div className="w-full relative p-2.5 rounded-3xl bg-white/[0.02] ring-1 ring-white/10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Camada Interna do Cenário (Colinas, Céu e Luz Solar) */}
        <div className="relative w-full rounded-[calc(1.5rem-0.25rem)] bg-gradient-to-b from-[#0c1e13] via-[#09150d] to-[#060e09] border border-white/5 overflow-hidden min-h-[580px] sm:min-h-[640px] flex items-center justify-center">
          
          {/* Sol Dourado e Raios Volumétricos de Fundo */}
          <div className="absolute top-6 right-16 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
          <div className="absolute top-10 right-20 w-16 h-16 rounded-full bg-amber-300/40 blur-md pointer-events-none" />

          {/* Colinas Onduladas do Horizonte */}
          <svg className="absolute bottom-0 left-0 w-full h-48 opacity-30 pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path d="M 0,200 L 0,80 Q 250,20 500,80 T 1000,60 L 1000,200 Z" fill="#1b4d24" />
            <path d="M 0,200 L 0,110 Q 300,50 650,110 T 1000,100 L 1000,200 Z" fill="#143b1c" />
          </svg>

          {/* Construções da Fazenda ao Fundo */}
          {/* Moinho de Vento (Lado Esquerdo Superior) */}
          <div className="absolute top-6 left-8 z-10 hidden sm:block opacity-90 hover:opacity-100 transition-opacity">
            <WindmillSprite size={110} />
            <span className="block text-center text-[10px] font-semibold text-zinc-400 mt-1">Moinho Solar</span>
          </div>

          {/* Casinha Colonial & Celeiro (Lado Direito Superior) */}
          <div className="absolute top-6 right-8 z-10 hidden sm:flex items-end gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <div className="text-center">
              <FarmhouseSprite size={100} />
              <span className="block text-[10px] font-semibold text-zinc-400">Sede</span>
            </div>
            <div className="text-center">
              <BarnSprite size={105} />
              <span className="block text-[10px] font-semibold text-zinc-400">Celeiro</span>
            </div>
          </div>

          {/* Espantalho no Canto da Horta */}
          <div className="absolute bottom-12 left-10 z-20 hidden md:block">
            <ScarecrowSprite size={70} />
            <span className="block text-center text-[10px] font-semibold text-amber-300">Zé Espantalho</span>
          </div>

          {/* Cão de Guarda da Fazenda (O clássico cãozinho da Colheita Feliz) */}
          <div className="absolute bottom-12 right-12 z-20 hidden md:block">
            <GuardDogSprite size={60} />
            <span className="block text-center text-[10px] font-semibold text-amber-400">Rex Guardião</span>
          </div>

          {/* TABULEIRO ISOMÉTRICO 2.5D DOS CANTEIROS */}
          <div className="relative z-10 w-[720px] h-[480px] my-auto">
            {localTiles.map(tile => {
              // Projeção Isométrica Clássica
              const xPos = (tile.x - tile.y) * (tileWidth / 2) + originX;
              const yPos = (tile.x + tile.y) * (tileHeight / 2) + originY;
              
              // Z-Index calculado pela soma (x + y) para sobreposição correta
              const zIndex = (tile.x + tile.y) * 10 + 10;
              const isHovered = hoveredTile?.x === tile.x && hoveredTile?.y === tile.y;
              const isReady = tile.state === 'ready';
              const isGrowing = tile.state === 'growing';
              const isLoading = actionLoading === `${tile.x}-${tile.y}`;

              return (
                <div
                  key={tile.id}
                  style={{
                    position: 'absolute',
                    left: `${xPos}px`,
                    top: `${yPos}px`,
                    zIndex: zIndex + (isHovered ? 50 : 0),
                    width: `${tileWidth}px`,
                    height: `${tileHeight + 20}px`
                  }}
                  onMouseEnter={() => setHoveredTile({ x: tile.x, y: tile.y })}
                  onMouseLeave={() => setHoveredTile(null)}
                  onClick={() => handleTileClick(tile)}
                  className={`cursor-pointer select-none transition-transform duration-200 group ${
                    isHovered ? '-translate-y-1' : ''
                  } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {/* Canteiro Isométrico Base */}
                  <div className="absolute top-0 left-0">
                    {tile.tileType === 'soil' ? (
                      <SoilTileIsometric
                        width={tileWidth}
                        height={tileHeight + 20}
                        isWatered={tile.wateredAt !== null}
                        isHovered={isHovered}
                      />
                    ) : (
                      <GrassTileIsometric
                        width={tileWidth}
                        height={tileHeight + 20}
                        isHovered={isHovered}
                      />
                    )}
                  </div>

                  {/* Planta Isométrica em Relevo (saindo do solo para cima) */}
                  {tile.cropId && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                      <CropStageIsometric
                        cropId={tile.cropId}
                        state={tile.state as any}
                        size={64}
                        secondsRemaining={tile.secondsRemaining}
                      />
                    </div>
                  )}

                  {/* Ícone de Arar quando passa o mouse na Grama */}
                  {tile.tileType === 'grass' && isHovered && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1 z-30 shadow-lg">
                      <Shovel className="w-3 h-3" />
                      Arar Terra
                    </div>
                  )}

                  {/* Plaquinha de Madeira com Timer Flutuante (Estilo Colheita Feliz) */}
                  {isGrowing && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-white/10 flex items-center gap-1 z-30 shadow-xl pointer-events-none">
                      <Clock className="w-2.5 h-2.5 text-emerald-400 animate-spin-slow" />
                      <span className="text-[10px] font-mono text-zinc-200 font-bold whitespace-nowrap">
                        {tile.secondsRemaining}s
                      </span>
                    </div>
                  )}

                  {/* Destaque Radiante "COLHER!" (Pulsante e Convidativo) */}
                  {isReady && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-[10px] font-extrabold flex items-center gap-1 z-40 shadow-lg shadow-amber-400/50 animate-bounce cursor-pointer">
                      <Sparkles className="w-3 h-3" />
                      COLHER
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dica de Ação no Rodapé do Tabuleiro */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-zinc-400 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
            <span className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Solo enriquecido com irrigação persistente
            </span>
            <span className="hidden sm:inline text-zinc-400">
              Clique para arar, semear e colher • Perspectiva Isométrica 2.5D
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
