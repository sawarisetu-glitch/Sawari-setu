import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  inline?: boolean;
  imageOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  inline = false,
  imageOnly = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base sm:text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const iconContainer = (
    <div
      className={`relative ${iconSizes[size]} shrink-0 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-lg shadow-amber-500/20 overflow-hidden flex items-center justify-center p-0.5 group`}
    >
      {!imgError ? (
        <img
          src="/sawari_setu_logo.jpg"
          alt="सवारी सेतु (Sawari Setu)"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow p-1"
        >
          <path
            d="M 10 75 Q 50 25 90 75"
            stroke="#FF8C00"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 6 80 L 94 80"
            stroke="#404040"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <line x1="12" y1="80" x2="88" y2="80" stroke="#FFD54F" strokeWidth="2" strokeDasharray="6 4" />
          <g transform="translate(42, 8)">
            <path
              d="M 8 0 C 3.6 0 0 3.6 0 8 C 0 14 8 22 8 22 C 8 22 16 14 16 8 C 16 3.6 12.4 0 8 0 Z"
              fill="#FF8C00"
            />
            <circle cx="8" cy="8" r="3" fill="#121212" />
          </g>
        </svg>
      )}

      {/* Pulsing online service status indicator dot */}
      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
    </div>
  );

  if (imageOnly) {
    return iconContainer;
  }

  return (
    <div className={`flex ${inline ? 'flex-row items-center gap-2.5' : 'flex-row items-center gap-3'} ${className}`}>
      {iconContainer}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-white ${titleSizes[size]} drop-shadow-sm`}>
            सवारी <span className="text-[#FF8C00]">सेतु</span>
          </span>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60 hidden sm:inline-block">
            Sawari Setu
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-medium text-amber-400/90 tracking-wide mt-0.5 ${
              size === 'xs'
                ? 'text-[8.5px]'
                : size === 'sm'
                ? 'text-[9.5px] sm:text-[10.5px]'
                : 'text-[11px] sm:text-xs'
            }`}
          >
            सफर आसान • साथ सबका
          </span>
        )}
      </div>
    </div>
  );
};
