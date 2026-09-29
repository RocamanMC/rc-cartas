import React from 'react';
import { Clock, Play, Pause, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface FloatingTimerWidgetProps {
  timeLeft: number;
  duration: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onNextTurn: () => void;
  onOpenModal: () => void;
}

export const FloatingTimerWidget: React.FC<FloatingTimerWidgetProps> = ({
  timeLeft,
  duration,
  isRunning,
  onTogglePlay,
  onNextTurn,
  onOpenModal,
}) => {
  const isDanger = timeLeft <= 5 && timeLeft > 0;
  const isOver = timeLeft === 0;

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border-2 shadow-2xl backdrop-blur-md transition-all ${
          isOver
            ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
            : isDanger
            ? 'bg-amber-950/90 border-amber-400 text-amber-200 animate-pulse'
            : 'bg-[#062113]/90 border-amber-500/50 text-emerald-100 hover:border-amber-400'
        }`}
      >
        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 font-deck text-xs sm:text-sm font-bold cursor-pointer"
          title="Abrir reloj de mesa"
        >
          <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          <span>{timeLeft}s</span>
        </button>

        <div className="w-[1px] h-3.5 bg-amber-500/30 mx-0.5" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className="p-1 hover:text-amber-300 rounded cursor-pointer"
          title={isRunning ? 'Pausar' : 'Reanudar'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNextTurn();
          }}
          className="p-1 text-amber-300 hover:text-amber-100 rounded cursor-pointer"
          title="Siguiente turno"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
