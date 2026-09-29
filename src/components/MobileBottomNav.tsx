import React from 'react';
import { GameType } from '../types';
import { OrosIcon, CopasIcon, EspadasIcon, BastosIcon } from './SpanishDeckIcons';
import { LayoutGrid } from 'lucide-react';
import { sounds } from '../utils/sound';

interface MobileBottomNavProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentGame, onSelectGame }) => {
  // Exactly 5 buttons in mobile navigation following IPC guidelines
  const navItems: { id: GameType; label: string; icon: React.ReactNode }[] = [
    { id: 'escoba', label: 'Escoba', icon: <OrosIcon className="w-5 h-5" /> },
    { id: 'mus', label: 'Mus', icon: <CopasIcon className="w-5 h-5" /> },
    { id: 'chinchon', label: 'Chinchón', icon: <EspadasIcon className="w-5 h-5" /> },
    { id: 'tute', label: 'Tute', icon: <BastosIcon className="w-5 h-5" /> },
    { id: 'libre', label: 'Libre', icon: <LayoutGrid className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#072415]/95 backdrop-blur-md border-t border-amber-900/60 shadow-2xl px-2 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom,0px))]"
      aria-label="Navegación móvil de juegos"
    >
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentGame === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playCardFlick();
                onSelectGame(item.id);
              }}
              className={`min-h-[46px] py-1 flex flex-col items-center justify-center transition-all duration-150 rounded-xl cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-amber-300 font-bold bg-amber-950/70 ring-1 ring-amber-500/40 shadow-inner'
                  : 'text-emerald-200/60 hover:text-emerald-100 hover:bg-emerald-950/30'
              }`}
            >
              <div className={`transition-transform ${isActive ? 'scale-105 drop-shadow' : 'opacity-80'}`}>
                {item.icon}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap leading-none font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
