import React from 'react';
import { OrosIcon, CopasIcon, EspadasIcon, BastosIcon } from './SpanishDeckIcons';
import { Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface TableBannerProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
  onOpenMoreGames?: () => void;
}

export const TableBanner: React.FC<TableBannerProps> = ({ currentGame, onSelectGame, onOpenMoreGames }) => {
  const gameLabels: Record<GameType, { title: string; subtitle: string; suit: 'oros' | 'copas' | 'espadas' | 'bastos' }> = {
    escoba: {
      title: 'La Escoba del 15',
      subtitle: 'Anota escobas, cartas, oros, la setenta y el 7 de Oros',
      suit: 'oros',
    },
    mus: {
      title: 'El Mus Tradicional',
      subtitle: 'Amarracos y piedras, vacas, lances y órdagos al tapete',
      suit: 'copas',
    },
    chinchon: {
      title: 'El Chinchón',
      subtitle: 'Control de rondas, cierres a cero, -10 y reenganches',
      suit: 'espadas',
    },
    tute: {
      title: 'El Tute',
      subtitle: 'Las cuarenta, las veinte, diez de últimas y bazas',
      suit: 'bastos',
    },
    libre: {
      title: 'Mesa Libre y Rápida',
      subtitle: 'Anotador ágil para cualquier juego de cartas o fichas',
      suit: 'oros',
    },
    perfiles: {
      title: 'Perfiles de Jugadores',
      subtitle: 'Guarda y organiza a tus jugadores habituales para partidas rápidas',
      suit: 'copas',
    },
  };

  const activeInfo = gameLabels[currentGame];

  return (
    <div className="hidden md:block relative overflow-hidden rounded-2xl bg-[#062113] border-2 border-amber-600/40 p-4 sm:p-6 shadow-2xl">
      {/* Decorative filigree corner ornaments */}
      <div className="absolute top-2 left-2 text-amber-500/20 text-xs font-serif select-none pointer-events-none">
        ♠ ♣ ♥ ♦
      </div>
      <div className="absolute top-2 right-2 text-amber-500/20 text-xs font-serif select-none pointer-events-none">
        ♦ ♥ ♣ ♠
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: 4 Suits cluster and current title */}
        <div className="flex items-center gap-3 sm:gap-4 text-center md:text-left">
          <div className="p-2 sm:p-2.5 bg-[#0a2f1b] border border-amber-600/50 rounded-xl shadow-inner flex items-center justify-center shrink-0">
            {activeInfo.suit === 'oros' && <OrosIcon className="w-9 h-9 sm:w-11 sm:h-11" />}
            {activeInfo.suit === 'copas' && <CopasIcon className="w-9 h-9 sm:w-11 sm:h-11" />}
            {activeInfo.suit === 'espadas' && <EspadasIcon className="w-9 h-9 sm:w-11 sm:h-11" />}
            {activeInfo.suit === 'bastos' && <BastosIcon className="w-9 h-9 sm:w-11 sm:h-11" />}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-deck text-amber-100 tracking-wide">
              {activeInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-0.5">
              {activeInfo.subtitle}
            </p>
            {onOpenMoreGames && currentGame === 'libre' && (
              <button
                onClick={onOpenMoreGames}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/15 hover:bg-amber-400/30 border border-amber-400/40 rounded-lg text-xs font-semibold text-amber-200 transition-colors cursor-pointer mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Ver más juegos y sus normas</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Four Spanish suits heraldic badge bar */}
        <div className="flex items-center gap-1 sm:gap-2 bg-[#041a0e]/80 p-1 sm:px-3 sm:py-1.5 rounded-full border border-amber-800/50 shadow-inner">
          <button
            onClick={() => onSelectGame('escoba')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-transform hover:scale-110 cursor-pointer ${
              currentGame === 'escoba' ? 'bg-amber-400/25 ring-1 ring-amber-400' : 'opacity-70 hover:opacity-100'
            }`}
            title="Escoba (Oros)"
          >
            <OrosIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => onSelectGame('mus')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-transform hover:scale-110 cursor-pointer ${
              currentGame === 'mus' ? 'bg-amber-400/25 ring-1 ring-amber-400' : 'opacity-70 hover:opacity-100'
            }`}
            title="Mus (Copas)"
          >
            <CopasIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => onSelectGame('chinchon')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-transform hover:scale-110 cursor-pointer ${
              currentGame === 'chinchon' ? 'bg-amber-400/25 ring-1 ring-amber-400' : 'opacity-70 hover:opacity-100'
            }`}
            title="Chinchón (Espadas)"
          >
            <EspadasIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => onSelectGame('tute')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-transform hover:scale-110 cursor-pointer ${
              currentGame === 'tute' ? 'bg-amber-400/25 ring-1 ring-amber-400' : 'opacity-70 hover:opacity-100'
            }`}
            title="Tute (Bastos)"
          >
            <BastosIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
