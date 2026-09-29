import React from 'react';
import { Volume2, VolumeX, BookOpen, Users } from 'lucide-react';
import { GameType } from '../types';

interface NavbarProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenMoreGames?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentGame,
  onSelectGame,
  soundEnabled,
  onToggleSound,
  onOpenRules,
}) => {
  const games: { id: GameType; label: string }[] = [
    { id: 'escoba', label: 'Escoba' },
    { id: 'mus', label: 'Mus' },
    { id: 'chinchon', label: 'Chinchón' },
    { id: 'tute', label: 'Tute' },
    { id: 'libre', label: 'Libre' },
  ];

  return (
    <header className="border-b border-amber-900/40 bg-[#072415]/95 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectGame('escoba')}
          className="text-base sm:text-xl font-bold tracking-tight text-amber-300 font-deck hover:text-amber-200 transition-colors whitespace-nowrap text-left shrink-0 cursor-pointer"
        >
          El Tantador
        </button>

        {/* Zone 2: Navigation links (desktop) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 py-1">
          {games.map((game) => {
            const isActive = currentGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className={`px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap rounded cursor-pointer ${
                  isActive
                    ? 'text-amber-300 font-semibold bg-amber-950/40 border border-amber-500/30'
                    : 'text-emerald-200/70 hover:text-amber-200'
                }`}
              >
                {game.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Sound, Perfiles, Reglas) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center p-1.5 sm:p-2 text-emerald-200/80 hover:text-amber-300 hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Alternar sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Perfiles arriba a la derecha al lado de Reglas */}
          <button
            onClick={() => onSelectGame('perfiles')}
            className={`min-h-[38px] sm:min-h-[40px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap shadow-sm cursor-pointer ${
              currentGame === 'perfiles'
                ? 'bg-amber-400 text-amber-950 font-bold shadow'
                : 'text-amber-200 bg-[#092b19] hover:bg-[#0f4427] hover:text-amber-100 border border-amber-500/40'
            }`}
            title="Ver y gestionar perfiles de jugadores"
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Perfiles</span>
          </button>

          {/* Botón de Reglas */}
          <button
            onClick={onOpenRules}
            className="min-h-[38px] sm:min-h-[40px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            title="Ver reglamento oficial"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Reglas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
