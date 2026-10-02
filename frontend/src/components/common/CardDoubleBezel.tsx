import React from 'react';

interface CardDoubleBezelProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
}

export const CardDoubleBezel: React.FC<CardDoubleBezelProps> = ({
  children,
  className = '',
  innerClassName = '',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-1.5 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:bg-white/[0.05] hover:ring-white/20 active:scale-[0.98]' : ''
      } ${className}`}
    >
      <div
        className={`w-full h-full rounded-[calc(1rem-0.125rem)] bg-zinc-950/80 backdrop-blur-xl p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
