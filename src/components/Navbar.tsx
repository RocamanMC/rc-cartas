import React from 'react';
import { Volume2, VolumeX, BookOpen, Users, Shuffle, Clock } from 'lucide-react';
import { GameType } from '../types';
import { OrosIcon } from './SpanishDeckIcons';

interface NavbarProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenSorteo: () => void;
  onOpenTimer: () => void;
  timerRunning?: boolean;
  timeLeft?: number;
  onOpenMoreGames?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentGame,
  onSelectGame,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onOpenSorteo,
  onOpenTimer,
  timerRunning,
  timeLeft,
}) => {
  const games: { id: GameType; label: string }[] = [
    { id: 'escoba', label: 'Escoba' },
    { id: 'mus', label: 'Mus' },
    { id: 'chinchon', label: 'Chinchón' },
    { id: 'tute', label: 'Tute' },
    { id: 'libre', label: 'Libre' },
  ];

  return (
    <header className="border-b border-amber-900/40 bg-[#072415]/95 backdrop-blur-md px-2.5 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Brand wordmark CartasRC */}
        <button
          onClick={() => onSelectGame('escoba')}
          className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-xl font-bold tracking-tight text-amber-300 font-deck hover:text-amber-200 transition-colors whitespace-nowrap text-left shrink-0 cursor-pointer"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center p-0.5 shadow-inner">
            <OrosIcon className="w-full h-full" />
          </div>
          <span className="font-extrabold tracking-wide bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent">
            CartasRC
          </span>
        </button>

        {/* Zone 2: Navigation links (desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 py-1">
          {games.map((game) => {
            const isActive = currentGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className={`px-2.5 lg:px-3 py-1 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap rounded cursor-pointer ${
                  isActive
                    ? 'text-amber-300 font-semibold bg-amber-950/50 border border-amber-500/30'
                    : 'text-emerald-200/70 hover:text-amber-200'
                }`}
              >
                {game.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Sound, Sorteo, Reloj, Perfiles, Reglas) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center p-1.5 text-emerald-200/80 hover:text-amber-300 hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Alternar sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Reloj de Turno / Mesa */}
          <button
            onClick={onOpenTimer}
            className={`min-h-[36px] sm:min-h-[38px] flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              timerRunning
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/60 shadow animate-pulse'
                : 'text-emerald-200 bg-[#092b19] hover:bg-[#0f4427] hover:text-amber-100 border border-amber-500/30'
            }`}
            title="Reloj de mesa y temporizador de turno"
          >
            <Clock className={`w-3.5 h-3.5 ${timerRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline">Reloj</span>
            {timerRunning && typeof timeLeft === 'number' && (
              <span className="text-[10px] font-bold text-amber-400 font-mono">({timeLeft}s)</span>
            )}
          </button>

          {/* Sorteo de Mesa */}
          <button
            onClick={onOpenSorteo}
            className="min-h-[36px] sm:min-h-[38px] flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer text-amber-200 bg-[#092b19] hover:bg-[#0f4427] hover:text-amber-100 border border-amber-500/40"
            title="Sorteo de mano, cartas, moneda y dados"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline">Sorteo</span>
          </button>

          {/* Perfiles */}
          <button
            onClick={() => onSelectGame('perfiles')}
            className={`min-h-[36px] sm:min-h-[38px] flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap shadow-sm cursor-pointer ${
              currentGame === 'perfiles'
                ? 'bg-amber-400 text-amber-950 font-bold shadow'
                : 'text-amber-200 bg-[#092b19] hover:bg-[#0f4427] hover:text-amber-100 border border-amber-500/40'
            }`}
            title="Ver y gestionar perfiles de jugadores"
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Perfiles</span>
          </button>

          {/* Botón de Reglas */}
          <button
            onClick={onOpenRules}
            className="min-h-[36px] sm:min-h-[38px] flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
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
