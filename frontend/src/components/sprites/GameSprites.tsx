import React from 'react';

interface SpriteProps {
  className?: string;
  size?: number;
}

// 1. Canteiro de Solo Arado Féretil
export const SoilTileSprite: React.FC<SpriteProps & { isHovered?: boolean; isWatered?: boolean }> = ({
  className = '',
  size = 64,
  isHovered = false,
  isWatered = false
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={`transition-all duration-200 ${className}`}>
    <rect width="64" height="64" rx="8" fill={isWatered ? '#3d2817' : '#543820'} />
    {/* Sulcos do arado */}
    <rect x="6" y="8" width="52" height="6" rx="3" fill={isWatered ? '#2a1a0e' : '#3d2817'} opacity="0.8" />
    <rect x="6" y="18" width="52" height="6" rx="3" fill={isWatered ? '#2a1a0e' : '#3d2817'} opacity="0.8" />
    <rect x="6" y="28" width="52" height="6" rx="3" fill={isWatered ? '#2a1a0e' : '#3d2817'} opacity="0.8" />
    <rect x="6" y="38" width="52" height="6" rx="3" fill={isWatered ? '#2a1a0e' : '#3d2817'} opacity="0.8" />
    <rect x="6" y="48" width="52" height="6" rx="3" fill={isWatered ? '#2a1a0e' : '#3d2817'} opacity="0.8" />
    {/* Partículas de terra e orvalho */}
    <circle cx="14" cy="11" r="1.5" fill="#755030" opacity="0.6" />
    <circle cx="36" cy="21" r="1.5" fill="#755030" opacity="0.6" />
    <circle cx="24" cy="31" r="1.5" fill="#755030" opacity="0.6" />
    <circle cx="48" cy="41" r="1.5" fill="#755030" opacity="0.6" />
    {isWatered && (
      <>
        <circle cx="20" cy="19" r="1.5" fill="#60a5fa" opacity="0.7" />
        <circle cx="44" cy="39" r="1.5" fill="#60a5fa" opacity="0.7" />
      </>
    )}
    {isHovered && (
      <rect x="1" y="1" width="62" height="62" rx="7" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2" />
    )}
  </svg>
);

// 2. Terreno de Grama
export const GrassTileSprite: React.FC<SpriteProps & { isHovered?: boolean }> = ({
  className = '',
  size = 64,
  isHovered = false
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={`transition-all duration-200 ${className}`}>
    <rect width="64" height="64" rx="8" fill="#1b3820" />
    <rect x="2" y="2" width="60" height="60" rx="6" fill="#234729" />
    {/* Pequenos tufos de grama estilizada */}
    <path d="M12 48 L14 40 L16 48 Z" fill="#2e5d36" />
    <path d="M15 48 L18 38 L20 48 Z" fill="#387042" />
    <path d="M42 22 L44 14 L46 22 Z" fill="#2e5d36" />
    <path d="M45 22 L48 12 L50 22 Z" fill="#387042" />
    <path d="M30 38 L32 30 L34 38 Z" fill="#387042" />
    {isHovered && (
      <rect x="1" y="1" width="62" height="62" rx="7" fill="none" stroke="#86efac" strokeWidth="2" strokeDasharray="4 2" />
    )}
  </svg>
);

// 3. Estágios de Plantações
export const CropGrowthSprite: React.FC<{
  cropId: string;
  state: 'planted' | 'growing' | 'ready';
  size?: number;
}> = ({ cropId, state, size = 48 }) => {
  if (state === 'planted') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        {/* Sementes no solo */}
        <circle cx="20" cy="28" r="2.5" fill="#d97706" />
        <circle cx="28" cy="26" r="2.5" fill="#b45309" />
        <circle cx="24" cy="32" r="2.5" fill="#f59e0b" />
      </svg>
    );
  }

  if (state === 'growing') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        {/* Broto verde surgindo */}
        <path d="M24 38 L24 22" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 26 C18 20 16 26 24 22" fill="#22c55e" />
        <path d="M24 24 C30 18 32 24 24 20" fill="#4ade80" />
      </svg>
    );
  }

  // Maduro / Pronto para colheita
  switch (cropId) {
    case 'crop_wheat':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* Trigo Dourado */}
          <path d="M24 42 L24 14" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="21" cy="18" rx="4" ry="7" transform="rotate(-20 21 18)" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <ellipse cx="27" cy="18" rx="4" ry="7" transform="rotate(20 27 18)" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          <ellipse cx="21" cy="26" rx="3.5" ry="6" transform="rotate(-25 21 26)" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <ellipse cx="27" cy="26" rx="3.5" ry="6" transform="rotate(25 27 26)" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          <ellipse cx="24" cy="12" rx="3.5" ry="6" fill="#fde047" stroke="#d97706" strokeWidth="1" />
        </svg>
      );
    case 'crop_carrot':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* Cenoura Doce */}
          <path d="M24 16 L18 8 M24 16 L24 6 M24 16 L30 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 18 C19 16 29 16 29 18 L25 38 C24 40 24 40 23 38 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
          <path d="M21 22 L27 22 M20 28 L26 28 M22 34 L25 34" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'crop_tomato':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* Tomate Carmim */}
          <path d="M24 38 L24 16" stroke="#15803d" strokeWidth="2.5" />
          <path d="M18 20 C18 16 24 14 24 14 C24 14 30 16 30 20" stroke="#16a34a" strokeWidth="2" fill="none" />
          <circle cx="20" cy="26" r="8" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="28" cy="28" r="7" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
          <ellipse cx="18" cy="23" rx="2" ry="3" fill="#f87171" opacity="0.6" />
        </svg>
      );
    case 'crop_corn':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* Milho Solar */}
          <path d="M24 42 L24 12" stroke="#15803d" strokeWidth="3" />
          <path d="M16 24 C20 22 23 14 24 14 C25 14 28 22 32 24 C28 28 20 28 16 24 Z" fill="#16a34a" />
          <rect x="20" y="14" width="8" height="18" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <line x1="24" y1="16" x2="24" y2="30" stroke="#d97706" strokeWidth="1" />
          <line x1="21" y1="20" x2="27" y2="20" stroke="#d97706" strokeWidth="1" />
          <line x1="21" y1="25" x2="27" y2="25" stroke="#d97706" strokeWidth="1" />
        </svg>
      );
    case 'crop_strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* Morango Rubi */}
          <path d="M24 38 L24 20" stroke="#15803d" strokeWidth="2" />
          <path d="M16 22 L24 18 L32 22 L24 14 Z" fill="#22c55e" />
          <path d="M17 24 C17 20 31 20 31 24 C31 32 25 36 24 38 C23 36 17 32 17 24 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1.5" />
          <circle cx="21" cy="24" r="0.75" fill="#fef08a" />
          <circle cx="27" cy="24" r="0.75" fill="#fef08a" />
          <circle cx="24" cy="28" r="0.75" fill="#fef08a" />
          <circle cx="22" cy="32" r="0.75" fill="#fef08a" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="10" fill="#22c55e" />
        </svg>
      );
  }
};

// 4. Sprites dos Itens do Inventário
export const ItemSprite: React.FC<{ spriteId: string; size?: number; className?: string }> = ({
  spriteId,
  size = 40,
  className = ''
}) => {
  switch (spriteId) {
    // Sementes
    case 'seed_wheat':
    case 'seed_carrot':
    case 'seed_tomato':
    case 'seed_corn':
    case 'seed_strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <rect x="8" y="10" width="24" height="24" rx="6" fill="#78350f" stroke="#92400e" strokeWidth="1.5" />
          <path d="M8 16 L32 16" stroke="#92400e" strokeWidth="1" />
          <circle cx="20" cy="24" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <path d="M20 20 L20 24" stroke="#22c55e" strokeWidth="1.5" />
        </svg>
      );

    // Colheitas
    case 'crop_wheat':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <path d="M12 28 C16 16 24 10 28 8 C28 14 26 22 20 28" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <line x1="12" y1="32" x2="28" y2="12" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'crop_carrot':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <path d="M26 8 L32 4 M28 10 L34 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 30 L26 10 C28 8 30 10 28 12 L16 32 C14 34 10 32 12 30 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
        </svg>
      );
    case 'crop_tomato':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <circle cx="20" cy="22" r="12" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
          <path d="M16 10 L20 13 L24 10" stroke="#15803d" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="16" cy="18" rx="2" ry="4" fill="#fca5a5" opacity="0.6" />
        </svg>
      );
    case 'crop_corn':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <rect x="14" y="10" width="12" height="22" rx="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <path d="M10 20 C10 26 14 32 20 34" stroke="#16a34a" strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'crop_strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <path d="M12 16 C12 10 28 10 28 16 C28 26 21 32 20 34 C19 32 12 26 12 16 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1.5" />
          <path d="M16 12 L20 16 L24 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // Produtos Animais
    case 'product_egg':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <ellipse cx="20" cy="21" rx="10" ry="13" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="17" cy="17" rx="3" ry="5" fill="#fef9c3" opacity="0.8" />
        </svg>
      );
    case 'product_milk':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <rect x="14" y="14" width="12" height="18" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="16" y="8" width="8" height="6" rx="2" fill="#38bdf8" />
          <rect x="16" y="20" width="8" height="6" fill="#38bdf8" opacity="0.3" />
        </svg>
      );
    case 'product_wool':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <circle cx="20" cy="20" r="12" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M12 20 C12 14 28 14 28 20 C28 26 12 26 12 20" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
        </svg>
      );

    // Rações
    case 'feed_chicken':
    case 'feed_cattle':
    case 'feed_sheep':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <path d="M10 12 L30 12 L28 32 L12 32 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
          <path d="M10 12 L20 6 L30 12" stroke="#b45309" strokeWidth="1.5" fill="#78350f" />
          <circle cx="20" cy="22" r="3" fill="#fef08a" />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <rect width="40" height="40" rx="8" fill="#27272a" />
        </svg>
      );
  }
};

// 5. Sprites dos Animais
export const AnimalSprite: React.FC<{ animalId: string; size?: number; className?: string }> = ({
  animalId,
  size = 56,
  className = ''
}) => {
  switch (animalId) {
    case 'animal_chicken':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" className={className}>
          {/* Galinha Carijó */}
          <ellipse cx="28" cy="34" rx="14" ry="11" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="38" cy="24" r="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Crista vermelha */}
          <path d="M36 16 C38 12 42 14 40 18" fill="#ef4444" />
          {/* Bico */}
          <polygon points="44,24 50,26 44,28" fill="#f59e0b" />
          {/* Olho */}
          <circle cx="41" cy="22" r="1.5" fill="#0f172a" />
          {/* Asa */}
          <ellipse cx="26" cy="34" rx="7" ry="5" fill="#e2e8f0" />
          {/* Patas */}
          <line x1="24" y1="45" x2="24" y2="50" stroke="#f59e0b" strokeWidth="2" />
          <line x1="30" y1="45" x2="30" y2="50" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      );
    case 'animal_cow':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" className={className}>
          {/* Vaca Holandesa */}
          <rect x="12" y="24" width="30" height="20" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Manchas pretas */}
          <ellipse cx="20" cy="30" rx="4" ry="5" fill="#1e293b" />
          <ellipse cx="32" cy="34" rx="5" ry="4" fill="#1e293b" />
          {/* Cabeça */}
          <rect x="36" y="16" width="14" height="18" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Focinho rosa */}
          <rect x="42" y="24" width="10" height="9" rx="3" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1" />
          <circle cx="45" cy="28" r="1" fill="#475569" />
          <circle cx="49" cy="28" r="1" fill="#475569" />
          {/* Chifres */}
          <path d="M38 16 L36 12 M46 16 L48 12" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
          {/* Pernas */}
          <line x1="16" y1="44" x2="16" y2="52" stroke="#1e293b" strokeWidth="3" />
          <line x1="24" y1="44" x2="24" y2="52" stroke="#1e293b" strokeWidth="3" />
          <line x1="32" y1="44" x2="32" y2="52" stroke="#1e293b" strokeWidth="3" />
          <line x1="38" y1="44" x2="38" y2="52" stroke="#1e293b" strokeWidth="3" />
        </svg>
      );
    case 'animal_sheep':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" className={className}>
          {/* Ovelha Merino */}
          <ellipse cx="26" cy="32" rx="16" ry="12" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="16" cy="26" r="6" fill="#f1f5f9" />
          <circle cx="36" cy="26" r="6" fill="#f1f5f9" />
          <circle cx="26" cy="22" r="7" fill="#f1f5f9" />
          {/* Cabeça escura */}
          <ellipse cx="38" cy="30" rx="6" ry="7" fill="#334155" />
          <circle cx="40" cy="28" r="1.5" fill="#f8fafc" />
          {/* Orelha */}
          <ellipse cx="34" cy="28" rx="2" ry="4" transform="rotate(-30 34 28)" fill="#1e293b" />
          {/* Patas */}
          <line x1="18" y1="44" x2="18" y2="50" stroke="#334155" strokeWidth="2.5" />
          <line x1="24" y1="44" x2="24" y2="50" stroke="#334155" strokeWidth="2.5" />
          <line x1="30" y1="44" x2="30" y2="50" stroke="#334155" strokeWidth="2.5" />
          <line x1="36" y1="44" x2="36" y2="50" stroke="#334155" strokeWidth="2.5" />
        </svg>
      );
    default:
      return null;
  }
};
