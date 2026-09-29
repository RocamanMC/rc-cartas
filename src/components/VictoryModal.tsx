import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface VictoryModalProps {
  isOpen: boolean;
  winnerName: string;
  gameTitle: string;
  subtitle?: string;
  onRestart: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winnerName,
  gameTitle,
  subtitle,
  onRestart,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playVictory();
      // Launch confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#f59e0b', '#10b981', '#ef4444', '#ffffff'],
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    const text = `🏆 ¡${winnerName} ha ganado la partida de ${gameTitle} en El Tantador Español! 🃏`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('¡Resultado copiado al portapapeles!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a2b1b] border-2 border-amber-500 rounded-2xl shadow-2xl p-6 text-center space-y-5 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-radial from-amber-500/20 via-transparent to-transparent pointer-events-none" />

        {/* Trophy icon */}
        <div className="inline-flex p-4 rounded-full bg-amber-400/20 border-2 border-amber-400 shadow-lg text-amber-300">
          <Trophy className="w-12 h-12 animate-bounce" />
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            ¡Victoria en {gameTitle}!
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-100 font-deck">
            {winnerName}
          </h2>
          {subtitle && (
            <p className="text-sm text-emerald-200/80 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg transition-colors shadow-md text-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva Partida
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/50 font-medium rounded-lg transition-colors text-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-emerald-300/60 hover:text-emerald-200 underline pt-1 cursor-pointer"
        >
          Continuar mirando el marcador
        </button>
      </div>
    </div>
  );
};
