import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  withText = false,
  className = '',
}) => {
  const dimensions = {
    sm: { box: 'w-7 h-7', icon: 16, text: 'text-sm' },
    md: { box: 'w-9 h-9', icon: 20, text: 'text-base font-bold' },
    lg: { box: 'w-11 h-11', icon: 26, text: 'text-lg font-extrabold' },
    xl: { box: 'w-14 h-14', icon: 34, text: 'text-2xl font-extrabold' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Premium Geometric Fintech Logo Mark */}
      <div
        className={`relative ${dimensions.box} rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0 group transition-transform hover:scale-105`}
      >
        <div className="w-full h-full rounded-[10px] bg-slate-950/20 backdrop-blur-xs flex items-center justify-center relative overflow-hidden">
          {/* Subtle glow effect in the corner */}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-teal-400/40 rounded-full blur-xs pointer-events-none" />

          {/* Stylized Modern Rupee + Growth Trajectory Vector */}
          <svg
            width={dimensions.icon}
            height={dimensions.icon}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white drop-shadow-xs"
          >
            {/* Shield / Growth facets */}
            <path
              d="M7 6H23"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M7 11H20"
              stroke="#6EE7B7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M7 16H14.5C18 16 19.5 13.5 19.5 11C19.5 8 17.5 6 13.5 6H7V26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 16L24.5 26"
              stroke="#A7F3D0"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dynamic upward arrow accent on the right */}
            <path
              d="M21 7L25 7L25 11"
              stroke="#34D399"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25 7L18.5 13.5"
              stroke="#34D399"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {withText && (
        <div className="flex flex-col">
          <span className={`tracking-tight text-slate-900 dark:text-white font-extrabold ${dimensions.text}`}>
            Personal Finance Manager
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase -mt-0.5">
            Fintech Platform
          </span>
        </div>
      )}
    </div>
  );
};
