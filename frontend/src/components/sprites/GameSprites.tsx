import React from 'react';

interface SpriteProps {
  className?: string;
  size?: number;
}

// ==========================================
// 1. CANTEIROS & TERRENOS ISOMÉTRICOS 3D (COLHEITA FELIZ REFERENCE)
// ==========================================

export const SoilTileIsometric: React.FC<{
  width?: number;
  height?: number;
  isWatered?: boolean;
  isHovered?: boolean;
  className?: string;
}> = ({ width = 110, height = 75, isWatered = false, isHovered = false, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 110 75"
      className={`transition-all duration-300 filter drop-shadow-md ${className}`}
    >
      <defs>
        {/* Gradiente da Face Superior do Solo */}
        <linearGradient id={isWatered ? "soilTopWet" : "soilTopDry"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isWatered ? "#351e10" : "#634226"} />
          <stop offset="50%" stopColor={isWatered ? "#2b170c" : "#54371e"} />
          <stop offset="100%" stopColor={isWatered ? "#221208" : "#452b16"} />
        </linearGradient>

        {/* Gradiente da Borda Esquerda de Profundidade */}
        <linearGradient id="soilDepthLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isWatered ? "#1f1007" : "#3b2210"} />
          <stop offset="100%" stopColor={isWatered ? "#140a04" : "#281608"} />
        </linearGradient>

        {/* Gradiente da Borda Direita de Profundidade */}
        <linearGradient id="soilDepthRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isWatered ? "#180c05" : "#311c0c"} />
          <stop offset="100%" stopColor={isWatered ? "#0d0502" : "#1f0f05"} />
        </linearGradient>
      </defs>

      {/* 1. Profundidade 3D - Lado Esquerdo */}
      <polygon points="0,28 55,55 55,68 0,41" fill="url(#soilDepthLeft)" />

      {/* 2. Profundidade 3D - Lado Direito */}
      <polygon points="55,55 110,28 110,41 55,68" fill="url(#soilDepthRight)" />

      {/* 3. Face Superior Isométrica (Diamante / Losango) */}
      <polygon
        points="55,2 110,28 55,55 0,28"
        fill={isWatered ? "url(#soilTopWet)" : "url(#soilTopDry)"}
        stroke={isHovered ? "#22c55e" : (isWatered ? "#4a2916" : "#7c5535")}
        strokeWidth={isHovered ? 2.5 : 1}
      />

      {/* 4. Sulcos Arados do Canteiro (Perspectiva clássica da Colheita Feliz) */}
      <path
        d="M 22,20 L 77,47 M 33,14 L 88,41 M 44,8 L 99,35"
        stroke={isWatered ? "#1d0e07" : "#3e2513"}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 22,18 L 77,45 M 33,12 L 88,39 M 44,6 L 99,33"
        stroke={isWatered ? "#472714" : "#70482b"}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* 5. Grumos de Terra & Orvalho */}
      <ellipse cx="40" cy="32" rx="2" ry="1.2" fill={isWatered ? "#452413" : "#734e32"} />
      <ellipse cx="68" cy="22" rx="2.5" ry="1.5" fill={isWatered ? "#452413" : "#734e32"} />
      <ellipse cx="50" cy="40" rx="2" ry="1" fill={isWatered ? "#452413" : "#734e32"} />
      <ellipse cx="80" cy="30" rx="1.8" ry="1" fill={isWatered ? "#452413" : "#734e32"} />

      {isWatered && (
        <>
          <circle cx="35" cy="28" r="1.5" fill="#60a5fa" opacity="0.85" />
          <circle cx="65" cy="38" r="1.8" fill="#93c5fd" opacity="0.9" />
          <circle cx="75" cy="20" r="1.2" fill="#bfdbfe" opacity="0.8" />
        </>
      )}

      {/* Contorno Pulsante quando sob cursor */}
      {isHovered && (
        <polygon
          points="55,2 110,28 55,55 0,28"
          fill="#22c55e"
          fillOpacity="0.12"
          stroke="#4ade80"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}
    </svg>
  );
};

export const GrassTileIsometric: React.FC<{
  width?: number;
  height?: number;
  isHovered?: boolean;
  className?: string;
}> = ({ width = 110, height = 75, isHovered = false, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 110 75"
      className={`transition-all duration-300 filter drop-shadow-sm ${className}`}
    >
      <defs>
        <linearGradient id="grassTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e7d32" />
          <stop offset="50%" stopColor="#256e29" />
          <stop offset="100%" stopColor="#1e5c21" />
        </linearGradient>
        <linearGradient id="grassDepthLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1b4d1e" />
          <stop offset="100%" stopColor="#113313" />
        </linearGradient>
        <linearGradient id="grassDepthRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#164219" />
          <stop offset="100%" stopColor="#0c240d" />
        </linearGradient>
      </defs>

      {/* Profundidade 3D */}
      <polygon points="0,28 55,55 55,64 0,37" fill="url(#grassDepthLeft)" />
      <polygon points="55,55 110,28 110,37 55,64" fill="url(#grassDepthRight)" />

      {/* Face Superior de Gramado */}
      <polygon
        points="55,2 110,28 55,55 0,28"
        fill="url(#grassTopGrad)"
        stroke={isHovered ? "#86efac" : "#388e3c"}
        strokeWidth={isHovered ? 2 : 1}
      />

      {/* Tufinhos de relva campestre */}
      <path d="M 28,26 L 31,19 L 34,27" stroke="#4caf50" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 62,18 L 65,11 L 68,19" stroke="#4caf50" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 78,34 L 81,27 L 84,35" stroke="#4caf50" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 45,40 L 48,33 L 51,41" stroke="#4caf50" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Pequenas flores campestres amarelas e brancas */}
      <circle cx="52" cy="22" r="1.5" fill="#fef08a" />
      <circle cx="88" cy="24" r="1.5" fill="#ffffff" />
      <circle cx="36" cy="38" r="1.5" fill="#fef08a" />

      {isHovered && (
        <polygon
          points="55,2 110,28 55,55 0,28"
          fill="#86efac"
          fillOpacity="0.15"
          stroke="#86efac"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      )}
    </svg>
  );
};


// ==========================================
// 2. PLANTAS EM 4 ESTÁGIOS RICOS (ESTILO COLHEITA FELIZ)
// ==========================================

export const CropStageIsometric: React.FC<{
  cropId: string;
  state: 'planted' | 'growing' | 'ready';
  secondsRemaining?: number;
  size?: number;
}> = ({ cropId, state, size = 64 }) => {

  // Estágio 1: Recém-plantado (Sementes brotando na terra)
  if (state === 'planted') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="filter drop-shadow-md">
        {/* Sementes douradas enterradas */}
        <ellipse cx="26" cy="38" rx="2.5" ry="1.5" fill="#f59e0b" />
        <ellipse cx="36" cy="36" rx="2.5" ry="1.5" fill="#d97706" />
        <ellipse cx="31" cy="43" rx="2" ry="1.2" fill="#fbbf24" />
        {/* Primeiros brotinhos verdes despontando */}
        <path d="M 26,38 C 24,32 20,33 19,30" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 36,36 C 38,30 42,31 43,28" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="19" cy="30" r="1.8" fill="#22c55e" />
        <circle cx="43" cy="28" r="1.8" fill="#22c55e" />
      </svg>
    );
  }

  // Estágio 2: Em pleno crescimento (Folhagem verde exuberante e caules)
  if (state === 'growing') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="filter drop-shadow-lg">
        {/* Caule principal tenro */}
        <path d="M 32,50 Q 32,32 30,22" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        
        {/* Folhas tenras da esquerda */}
        <path
          d="M 31,38 C 20,38 14,28 12,24 C 18,26 26,32 31,36"
          fill="#22c55e"
          stroke="#15803d"
          strokeWidth="1.2"
        />
        {/* Folhas da direita */}
        <path
          d="M 31,32 C 42,32 48,22 50,18 C 44,20 36,26 31,30"
          fill="#4ade80"
          stroke="#15803d"
          strokeWidth="1.2"
        />
        {/* Folha brotante do topo */}
        <path
          d="M 30,22 C 26,14 34,10 32,6 C 30,10 36,14 30,22"
          fill="#86efac"
          stroke="#16a34a"
          strokeWidth="1"
        />
        {/* Botão floral / indício de fruto */}
        <circle cx="31" cy="22" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </svg>
    );
  }

  // Estágio 3: Maduro radiante (Colheita apetitosa clássica do Colheita Feliz)
  switch (cropId) {
    case 'crop_wheat':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="filter drop-shadow-xl animate-bounce-gentle">
          {/* Feixe de Trigo Dourado Reluzente */}
          <path d="M 32,56 Q 30,35 24,18 M 32,56 Q 33,35 38,16 M 32,56 L 31,12" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          
          {/* Espiga Central */}
          <ellipse cx="31" cy="16" rx="5" ry="9" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="31" cy="14" rx="3" ry="6" fill="#fde047" />

          {/* Espiga Esquerda */}
          <ellipse cx="23" cy="22" rx="4.5" ry="8" transform="rotate(-20 23 22)" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="23" cy="21" rx="2.5" ry="5" transform="rotate(-20 23 21)" fill="#fef08a" />

          {/* Espiga Direita */}
          <ellipse cx="39" cy="21" rx="4.5" ry="8" transform="rotate(20 39 21)" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="39" cy="20" rx="2.5" ry="5" transform="rotate(20 39 20)" fill="#fef08a" />

          {/* Brilho Solar Cintilante */}
          <circle cx="28" cy="10" r="1.5" fill="#ffffff" />
          <circle cx="42" cy="15" r="1" fill="#ffffff" />
        </svg>
      );

    case 'crop_carrot':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="filter drop-shadow-xl animate-bounce-gentle">
          {/* Folhagem Verde Rendada */}
          <path d="M 32,32 L 20,12 M 32,32 L 32,8 M 32,32 L 44,12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="19" cy="11" rx="4" ry="7" transform="rotate(-30 19 11)" fill="#22c55e" />
          <ellipse cx="32" cy="7" rx="4" ry="7" fill="#4ade80" />
          <ellipse cx="45" cy="11" rx="4" ry="7" transform="rotate(30 45 11)" fill="#22c55e" />

          {/* Cenoura Carnuda e Graúda saindo da Terra */}
          <path
            d="M 23,32 C 23,28 41,28 41,32 C 41,40 35,54 32,58 C 29,54 23,40 23,32 Z"
            fill="#ea580c"
            stroke="#9a3412"
            strokeWidth="2"
          />
          {/* Ranhuras horizontais típicas da cenoura */}
          <line x1="26" y1="36" x2="38" y2="36" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" />
          <line x1="27" y1="43" x2="37" y2="43" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="50" x2="35" y2="50" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Brilho de frescor */}
          <ellipse cx="27" cy="34" rx="2" ry="4" fill="#fb923c" opacity="0.8" />
        </svg>
      );

    case 'crop_tomato':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="filter drop-shadow-xl animate-bounce-gentle">
          {/* Haste do Tomateiro */}
          <path d="M 32,54 Q 30,36 32,24" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
          
          {/* Cacho de Tomates Carmim Redondos e Reluzentes */}
          {/* Tomate 1 (Esquerda) */}
          <circle cx="23" cy="38" r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="1.8" />
          <ellipse cx="19" cy="34" rx="3" ry="5" fill="#f87171" opacity="0.7" />
          <path d="M 23,28 L 21,24 L 25,24 Z" fill="#16a34a" />

          {/* Tomate 2 (Direita) */}
          <circle cx="41" cy="40" r="9" fill="#ef4444" stroke="#991b1b" strokeWidth="1.8" />
          <ellipse cx="38" cy="36" rx="2.5" ry="4" fill="#fca5a5" opacity="0.7" />
          <path d="M 41,31 L 39,27 L 43,27 Z" fill="#16a34a" />

          {/* Tomate Rei (Centro / Frente) */}
          <circle cx="32" cy="32" r="11" fill="#e11d48" stroke="#881337" strokeWidth="2" />
          <ellipse cx="28" cy="27" rx="3.5" ry="6" fill="#fda4af" opacity="0.8" />
          {/* Coroa de folhas do topo do tomate */}
          <polygon points="32,21 34,24 37,22 35,26 38,28 34,28 32,31 30,28 26,28 29,26 27,22 30,24" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        </svg>
      );

    case 'crop_corn':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="filter drop-shadow-xl animate-bounce-gentle">
          {/* Pé de Milho Alto e Robusto */}
          <path d="M 32,58 L 32,10" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
          
          {/* Folhas Longas Arqueadas */}
          <path d="M 32,45 C 16,42 8,28 6,18 C 14,24 24,36 32,40" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
          <path d="M 32,38 C 48,34 56,22 58,14 C 50,20 40,30 32,34" fill="#16a34a" stroke="#15803d" strokeWidth="1.5" />

          {/* Espiga de Milho Dourada Farta */}
          <rect x="25" y="16" width="14" height="26" rx="7" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          {/* Grãos de milho em relevo */}
          <line x1="28" y1="20" x2="36" y2="20" stroke="#f59e0b" strokeWidth="2" />
          <line x1="27" y1="25" x2="37" y2="25" stroke="#f59e0b" strokeWidth="2" />
          <line x1="27" y1="30" x2="37" y2="30" stroke="#f59e0b" strokeWidth="2" />
          <line x1="28" y1="35" x2="36" y2="35" stroke="#f59e0b" strokeWidth="2" />
          
          {/* Cabelo do milho no topo */}
          <path d="M 30,16 Q 28,10 26,8 M 32,16 L 32,6 M 34,16 Q 36,10 38,8" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" />
          
          {/* Brilho reluzente */}
          <circle cx="28" cy="22" r="1.5" fill="#fef08a" />
        </svg>
      );

    case 'crop_strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className="filter drop-shadow-xl animate-bounce-gentle">
          {/* Rama do Morangueiro */}
          <path d="M 32,56 Q 32,42 32,30" stroke="#15803d" strokeWidth="3" />
          <ellipse cx="20" cy="28" rx="7" ry="5" fill="#22c55e" />
          <ellipse cx="44" cy="28" rx="7" ry="5" fill="#16a34a" />

          {/* Morango Rubi Nobre */}
          <path
            d="M 22,28 C 22,22 42,22 42,28 C 42,40 34,50 32,54 C 30,50 22,40 22,28 Z"
            fill="#e11d48"
            stroke="#9f1239"
            strokeWidth="2"
          />
          {/* Sementinhas Douradas com Brilho */}
          <circle cx="27" cy="28" r="1" fill="#fef08a" />
          <circle cx="37" cy="28" r="1" fill="#fef08a" />
          <circle cx="32" cy="34" r="1.2" fill="#fef08a" />
          <circle cx="27" cy="40" r="1" fill="#fef08a" />
          <circle cx="37" cy="40" r="1" fill="#fef08a" />
          <circle cx="32" cy="46" r="1" fill="#fef08a" />

          {/* Coroa de folhas no topo */}
          <polygon points="32,23 35,26 39,24 37,28 41,30 36,30 32,33 28,30 23,30 27,28 25,24 29,26" fill="#4ade80" />
          {/* Brilho no topo */}
          <ellipse cx="28" cy="30" rx="2" ry="4" fill="#fda4af" opacity="0.75" />
        </svg>
      );

    default:
      return null;
  }
};


// ==========================================
// 3. CENÁRIO VIVO DO COLHEITA FELIZ (BACKGROUND ASSETS)
// ==========================================

// Moinho de Vento Campestre com pás giratórias
export const WindmillSprite: React.FC<{ size?: number; className?: string }> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={`filter drop-shadow-xl ${className}`}>
    {/* Base da torre do moinho */}
    <polygon points="36,92 60,92 54,42 42,42" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
    {/* Telhado cônico de madeira */}
    <polygon points="38,42 58,42 48,22" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
    {/* Janelas */}
    <rect x="45" y="52" width="6" height="8" rx="2" fill="#0284c7" stroke="#334155" strokeWidth="1" />
    <rect x="45" y="70" width="6" height="10" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
    {/* Eixo central */}
    <circle cx="48" cy="34" r="4" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
    
    {/* 4 Pás do Moinho (com animação de rotação contínua e suave) */}
    <g className="origin-[48px_34px] animate-spin-slow">
      {/* Pá 1 */}
      <line x1="48" y1="34" x2="48" y2="4" stroke="#78350f" strokeWidth="2" />
      <rect x="49" y="8" width="8" height="20" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.9" />
      {/* Pá 2 */}
      <line x1="48" y1="34" x2="78" y2="34" stroke="#78350f" strokeWidth="2" />
      <rect x="52" y="35" width="20" height="8" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.9" />
      {/* Pá 3 */}
      <line x1="48" y1="34" x2="48" y2="64" stroke="#78350f" strokeWidth="2" />
      <rect x="39" y="38" width="8" height="20" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.9" />
      {/* Pá 4 */}
      <line x1="48" y1="34" x2="18" y2="34" stroke="#78350f" strokeWidth="2" />
      <rect x="22" y="25" width="20" height="8" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.9" />
    </g>
  </svg>
);

// Casinha Colonial da Fazenda
export const FarmhouseSprite: React.FC<{ size?: number; className?: string }> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={`filter drop-shadow-xl ${className}`}>
    {/* Chaminé */}
    <rect x="66" y="24" width="8" height="18" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.5" />
    {/* Fumaça sutil */}
    <circle cx="70" cy="18" r="3" fill="#cbd5e1" opacity="0.6" />
    <circle cx="72" cy="11" r="4" fill="#cbd5e1" opacity="0.4" />
    {/* Paredes */}
    <polygon points="20,52 76,52 76,86 20,86" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
    {/* Telhado de Madeira Colonial */}
    <polygon points="12,52 84,52 48,26" fill="#c2410c" stroke="#7c2d12" strokeWidth="2.5" />
    {/* Porta de Madeira com trinco */}
    <rect x="42" y="62" width="12" height="24" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
    <circle cx="51" cy="74" r="1.5" fill="#f59e0b" />
    {/* Janelas com vidros azuis */}
    <rect x="26" y="60" width="10" height="12" rx="2" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
    <line x1="31" y1="60" x2="31" y2="72" stroke="#ffffff" strokeWidth="1" />
    <line x1="26" y1="66" x2="36" y2="66" stroke="#ffffff" strokeWidth="1" />
    <rect x="60" y="60" width="10" height="12" rx="2" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
    <line x1="65" y1="60" x2="65" y2="72" stroke="#ffffff" strokeWidth="1" />
    <line x1="60" y1="66" x2="70" y2="66" stroke="#ffffff" strokeWidth="1" />
  </svg>
);

// Celeiro Rústico
export const BarnSprite: React.FC<{ size?: number; className?: string }> = ({ size = 96, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" className={`filter drop-shadow-xl ${className}`}>
    {/* Parede Vermelha Clássica */}
    <polygon points="20,44 76,44 76,86 20,86" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
    {/* Telhado Mansarda do Celeiro */}
    <polygon points="14,44 48,22 82,44" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
    {/* Portão Duplo com Traves em X */}
    <rect x="36" y="56" width="24" height="30" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
    <line x1="36" y1="56" x2="60" y2="86" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
    <line x1="60" y1="56" x2="36" y2="86" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
    {/* Janela de Feno no sótão */}
    <polygon points="48,32 40,40 56,40" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
  </svg>
);

// Mascote Cãozinho de Guarda (O clássico cão de guarda da Colheita Feliz)
export const GuardDogSprite: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={`filter drop-shadow-md ${className}`}>
    {/* Corpo */}
    <ellipse cx="22" cy="32" rx="10" ry="7" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
    {/* Rabo abanando */}
    <path d="M 12,31 Q 8,26 10,22" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
    {/* Patas */}
    <line x1="16" y1="36" x2="16" y2="44" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="36" x2="22" y2="44" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="26" y1="36" x2="26" y2="44" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
    {/* Cabeça carismática */}
    <circle cx="32" cy="24" r="7" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
    {/* Orelhas caídas */}
    <ellipse cx="28" cy="21" rx="2.5" ry="5" transform="rotate(20 28 21)" fill="#78350f" />
    <ellipse cx="36" cy="21" rx="2.5" ry="5" transform="rotate(-20 36 21)" fill="#78350f" />
    {/* Focinho */}
    <circle cx="37" cy="25" r="2.5" fill="#fef3c7" />
    <circle cx="38" cy="24" r="1.2" fill="#18181b" />
    {/* Olhinho feliz */}
    <circle cx="32" cy="22" r="1.2" fill="#18181b" />
    {/* Coleira Vermelha com Medalhinha Dourada */}
    <rect x="27" y="28" width="7" height="3" rx="1" fill="#dc2626" />
    <circle cx="30" cy="32" r="1.5" fill="#facc15" />
  </svg>
);

// Espantalho Carismático
export const ScarecrowSprite: React.FC<{ size?: number; className?: string }> = ({ size = 56, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" className={`filter drop-shadow-md ${className}`}>
    {/* Vara de suporte */}
    <line x1="28" y1="12" x2="28" y2="52" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    <line x1="14" y1="28" x2="42" y2="28" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
    {/* Camisa Xadrez Azul */}
    <polygon points="20,24 36,24 38,40 18,40" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
    <line x1="28" y1="24" x2="28" y2="40" stroke="#f8fafc" strokeWidth="1" />
    {/* Cabeça de Saco com Palha */}
    <circle cx="28" cy="18" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    <circle cx="26" cy="17" r="0.8" fill="#18181b" />
    <circle cx="30" cy="17" r="0.8" fill="#18181b" />
    <path d="M 26,20 Q 28,22 30,20" stroke="#78350f" strokeWidth="0.8" fill="none" />
    {/* Chapéu de Palha Rústico */}
    <ellipse cx="28" cy="14" rx="10" ry="3" fill="#d97706" />
    <polygon points="23,14 33,14 30,7 26,7" fill="#b45309" stroke="#78350f" strokeWidth="1" />
    {/* Tufos de palha nos punhos */}
    <line x1="14" y1="28" x2="10" y2="26" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="28" x2="10" y2="30" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="28" x2="46" y2="26" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="28" x2="46" y2="30" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
  </svg>
);


// ==========================================
// 4. ITENS DO INVENTÁRIO & PRODUTOS AGRÍCOLAS
// ==========================================

export const ItemSprite: React.FC<{ spriteId: string; size?: number; className?: string }> = ({
  spriteId,
  size = 40,
  className = ''
}) => {
  switch (spriteId) {
    // Sementes (Sacos de juta com etiqueta)
    case 'seed_wheat':
    case 'seed_carrot':
    case 'seed_tomato':
    case 'seed_corn':
    case 'seed_strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          {/* Saco de linhagem/juta */}
          <path d="M 10,14 C 10,10 30,10 30,14 L 33,34 C 33,37 7,37 7,34 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
          <path d="M 12,14 Q 20,11 28,14" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
          {/* Selo com ícone do vegetal */}
          <circle cx="20" cy="25" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <path d="M 20,22 L 20,28 M 17,25 L 23,25" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // Feixe de Trigo
    case 'crop_wheat':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <line x1="12" y1="34" x2="28" y2="8" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="36" x2="24" y2="6" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="34" x2="16" y2="8" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="27" cy="11" rx="4" ry="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
          <ellipse cx="23" cy="9" rx="3.5" ry="6" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
          <ellipse cx="17" cy="11" rx="4" ry="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
          {/* Fita vermelha prendendo o feixe */}
          <rect x="16" y="23" width="10" height="4" rx="1" fill="#dc2626" />
        </svg>
      );

    // Cenoura Doce
    case 'crop_carrot':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <path d="M 26,12 L 34,4 M 28,14 L 36,8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M 12,32 L 28,10 C 30,8 33,10 30,13 L 17,35 C 14,37 10,35 12,32 Z"
            fill="#ea580c"
            stroke="#9a3412"
            strokeWidth="1.5"
          />
          <line x1="21" y1="18" x2="26" y2="18" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="24" x2="22" y2="24" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // Tomate Carmim
    case 'crop_tomato':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <circle cx="20" cy="22" r="13" fill="#dc2626" stroke="#991b1b" strokeWidth="1.8" />
          <ellipse cx="16" cy="17" rx="3" ry="5" fill="#fca5a5" opacity="0.75" />
          <polygon points="20,10 22,13 25,11 23,14 26,16 22,16 20,18 18,16 14,16 17,14 15,11 18,13" fill="#16a34a" />
        </svg>
      );

    // Milho Dourado
    case 'crop_corn':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <path d="M 10,22 C 10,32 16,36 20,38" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="15" y="8" width="12" height="24" rx="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.8" />
          <line x1="17" y1="14" x2="25" y2="14" stroke="#eab308" strokeWidth="1.5" />
          <line x1="17" y1="19" x2="25" y2="19" stroke="#eab308" strokeWidth="1.5" />
          <line x1="17" y1="24" x2="25" y2="24" stroke="#eab308" strokeWidth="1.5" />
        </svg>
      );

    // Morango Rubi
    case 'crop_strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <path
            d="M 12,18 C 12,12 28,12 28,18 C 28,28 21,34 20,36 C 19,34 12,28 12,18 Z"
            fill="#e11d48"
            stroke="#9f1239"
            strokeWidth="1.5"
          />
          <circle cx="17" cy="20" r="0.9" fill="#fef08a" />
          <circle cx="23" cy="20" r="0.9" fill="#fef08a" />
          <circle cx="20" cy="26" r="0.9" fill="#fef08a" />
          <circle cx="18" cy="30" r="0.8" fill="#fef08a" />
          <circle cx="22" cy="30" r="0.8" fill="#fef08a" />
          <polygon points="20,13 22,16 26,14 24,18 27,20 22,20 20,22 18,20 13,20 16,18 14,14 18,16" fill="#4ade80" />
        </svg>
      );

    // Ovo Caipira
    case 'product_egg':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <ellipse cx="20" cy="22" rx="11" ry="14" fill="#fef3c7" stroke="#d97706" strokeWidth="1.8" />
          <ellipse cx="16" cy="18" rx="3.5" ry="6" fill="#ffffff" opacity="0.85" />
        </svg>
      );

    // Garrafa de Leite Integral Fresco
    case 'product_milk':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <rect x="13" y="14" width="14" height="20" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.8" />
          {/* Gargalo */}
          <rect x="16" y="8" width="8" height="6" rx="2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
          {/* Rótulo de fazenda */}
          <rect x="13" y="20" width="14" height="8" fill="#0284c7" opacity="0.2" />
          <path d="M 17,24 Q 20,22 23,24" stroke="#0284c7" strokeWidth="1.5" fill="none" />
        </svg>
      );

    // Novelo de Lã Macia
    case 'product_wool':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          <circle cx="20" cy="20" r="13" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M 11,20 Q 20,12 29,20 Q 20,28 11,20" stroke="#94a3b8" strokeWidth="2" fill="none" />
          <path d="M 15,14 Q 25,20 15,26" stroke="#94a3b8" strokeWidth="1.8" fill="none" />
          <circle cx="26" cy="24" r="2" fill="#38bdf8" />
        </svg>
      );

    // Rações Balanceadas
    case 'feed_chicken':
    case 'feed_cattle':
    case 'feed_sheep':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
          {/* Caixote ou comedouro de madeira */}
          <polygon points="6,16 34,16 30,34 10,34" fill="#78350f" stroke="#451a03" strokeWidth="1.8" />
          <ellipse cx="20" cy="16" rx="14" ry="4" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="1.5" fill="#ca8a04" />
          <circle cx="24" cy="16" r="1.5" fill="#ca8a04" />
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


// ==========================================
// 5. ANIMAIS DA FAZENDA COM EXPRESSÃO E SOMBRA
// ==========================================

export const AnimalSprite: React.FC<{ animalId: string; size?: number; className?: string }> = ({
  animalId,
  size = 64,
  className = ''
}) => {
  switch (animalId) {
    case 'animal_chicken':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`filter drop-shadow-md ${className}`}>
          {/* Ninho de Palha */}
          <ellipse cx="32" cy="50" rx="20" ry="6" fill="#d97706" opacity="0.8" />
          <ellipse cx="32" cy="48" rx="17" ry="5" fill="#fde047" opacity="0.6" />
          {/* Corpo Branco e Fofo */}
          <ellipse cx="30" cy="38" rx="16" ry="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="26" cy="38" rx="8" ry="6" fill="#f1f5f9" />
          {/* Cabeça */}
          <circle cx="42" cy="28" r="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          {/* Crista Vermelha Vívida */}
          <path d="M 40,19 C 42,14 46,16 44,20 C 46,15 50,17 48,22" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
          {/* Bico Amarelo */}
          <polygon points="49,28 56,31 49,34" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          {/* Papo Vermelho */}
          <ellipse cx="48" cy="35" rx="2" ry="3" fill="#ef4444" />
          {/* Olho Atento */}
          <circle cx="44" cy="26" r="1.8" fill="#0f172a" />
          <circle cx="45" cy="25" r="0.7" fill="#ffffff" />
        </svg>
      );

    case 'animal_cow':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`filter drop-shadow-md ${className}`}>
          {/* Sombra no chão */}
          <ellipse cx="32" cy="56" rx="24" ry="5" fill="#000000" opacity="0.25" />
          {/* Corpo Branco Malhado */}
          <rect x="14" y="26" width="36" height="24" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
          {/* Manchas Pretas */}
          <ellipse cx="24" cy="34" rx="6" ry="7" fill="#1e293b" />
          <ellipse cx="38" cy="40" rx="7" ry="5" fill="#1e293b" />
          {/* Pernas */}
          <line x1="20" y1="50" x2="20" y2="58" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="28" y1="50" x2="28" y2="58" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="38" y1="50" x2="38" y2="58" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="44" y1="50" x2="44" y2="58" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          {/* Cabeça */}
          <rect x="42" y="18" width="16" height="20" rx="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
          {/* Chifres */}
          <path d="M 44,18 L 42,12 M 54,18 L 56,12" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          {/* Focinho Rosa Amigável */}
          <rect x="46" y="27" width="13" height="11" rx="4" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1.2" />
          <circle cx="50" cy="32" r="1.5" fill="#475569" />
          <circle cx="55" cy="32" r="1.5" fill="#475569" />
          {/* Olhos meigos */}
          <circle cx="48" cy="23" r="1.5" fill="#1e293b" />
          {/* Sino de Cobre pendurado no pescoço */}
          <polygon points="41,40 45,40 46,45 40,45" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        </svg>
      );

    case 'animal_sheep':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`filter drop-shadow-md ${className}`}>
          {/* Sombra */}
          <ellipse cx="32" cy="54" rx="20" ry="5" fill="#000000" opacity="0.25" />
          {/* Corpo de Lã Fofa e Volumosa */}
          <ellipse cx="30" cy="36" rx="18" ry="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="18" cy="30" r="7" fill="#f8fafc" />
          <circle cx="40" cy="30" r="7" fill="#f8fafc" />
          <circle cx="30" cy="25" r="8" fill="#f8fafc" />
          <circle cx="22" cy="42" r="6" fill="#f8fafc" />
          <circle cx="38" cy="42" r="6" fill="#f8fafc" />
          {/* Perninhas escuras */}
          <line x1="22" y1="48" x2="22" y2="56" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <line x1="36" y1="48" x2="36" y2="56" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          {/* Cabeça Negra / Escura Dócil */}
          <ellipse cx="44" cy="34" rx="7" ry="8" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
          <ellipse cx="39" cy="32" rx="2" ry="4" transform="rotate(-30 39 32)" fill="#1e293b" />
          {/* Olhinho brilhante */}
          <circle cx="46" cy="32" r="1.5" fill="#ffffff" />
          <circle cx="47" cy="32" r="0.8" fill="#0f172a" />
        </svg>
      );

    default:
      return null;
  }
};
