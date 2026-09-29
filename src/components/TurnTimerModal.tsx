import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Clock, Sun, Share2, Check, ArrowRight, Minimize2 } from 'lucide-react';
import { sounds } from '../utils/sound';

interface TurnTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Timer state shared with parent for floating indicator
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
  gameSummaryText?: string;
}

export const TurnTimerModal: React.FC<TurnTimerModalProps> = ({
  isOpen,
  onClose,
  timeLeft,
  setTimeLeft,
  isRunning,
  setIsRunning,
  duration,
  setDuration,
  wakeLockActive,
  onToggleWakeLock,
  gameSummaryText,
}) => {
  const [copied, setCopied] = useState(false);
  const presets = [30, 45, 60, 90, 120];

  const handleSelectPreset = (secs: number) => {
    sounds.playTap();
    setDuration(secs);
    setTimeLeft(secs);
    setIsRunning(false);
  };

  const handleTogglePlay = () => {
    sounds.playTap();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sounds.playUndo();
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleNextTurn = () => {
    sounds.playCardFlick();
    setTimeLeft(duration);
    setIsRunning(true);
  };

  const handleShare = async () => {
    const textToShare = gameSummaryText || '¡Jugando a las cartas con CartasRC!';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CartasRC - Anotador de Baraja',
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        // Fallback to clipboard
        copyToClipboard(textToShare);
      }
    } else {
      copyToClipboard(textToShare);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      sounds.playPointChime();
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const progressPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;
  const isDanger = timeLeft <= 5 && timeLeft > 0;
  const isTimeOver = timeLeft === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#092b19] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-900/60 bg-[#062113]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-deck text-amber-200">
                Reloj de Mesa y Herramientas
              </h2>
              <p className="text-xs text-emerald-200/70">
                Control de tiempo por turno y pantalla siempre activa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Preset Buttons */}
          <div className="flex items-center justify-between gap-1.5 bg-[#062113] p-1.5 rounded-xl border border-amber-900/60">
            {presets.map((sec) => (
              <button
                key={sec}
                onClick={() => handleSelectPreset(sec)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  duration === sec
                    ? 'bg-amber-400 text-amber-950 font-bold shadow'
                    : 'text-emerald-200/80 hover:text-amber-200 hover:bg-emerald-900/30'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Big Timer Dial */}
          <div className="flex flex-col items-center justify-center py-2">
            <div
              className={`relative w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-colors shadow-2xl ${
                isTimeOver
                  ? 'border-red-500 bg-red-950/40 animate-pulse'
                  : isDanger
                  ? 'border-amber-400 bg-amber-950/40 animate-pulse'
                  : 'border-emerald-500/60 bg-[#062113]'
              }`}
            >
              {/* Circular SVG Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.15)"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke={isTimeOver ? '#ef4444' : isDanger ? '#f59e0b' : 'currentColor'}
                  strokeWidth="5"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-300 text-emerald-500"
                />
              </svg>

              <span
                className={`text-5xl font-black font-deck transition-colors ${
                  isTimeOver ? 'text-red-400' : isDanger ? 'text-amber-300' : 'text-amber-100'
                }`}
              >
                {timeLeft}
                <span className="text-xl font-normal ml-0.5 text-emerald-300/60 font-sans">s</span>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/70 mt-1">
                {isTimeOver ? '¡Tiempo Agotado!' : isRunning ? 'Turno en curso' : 'En pausa'}
              </span>
            </div>
          </div>

          {/* Main Controls: Start/Pause & Next Turn */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleTogglePlay}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
            </button>

            <button
              onClick={handleNextTurn}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer text-sm"
              title="Reiniciar para el siguiente jugador"
            >
              <span>Siguiente Turno</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-[#062113] hover:bg-[#0c3820] text-emerald-200 border border-amber-800/60 rounded-xl transition-colors cursor-pointer"
              title="Reiniciar tiempo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Tools: Wake Lock & Share */}
          <div className="pt-2 border-t border-amber-900/40 space-y-2">
            {/* Screen Wake Lock Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#062113] border border-amber-900/50">
              <div className="flex items-center gap-2.5">
                <Sun className={`w-4 h-4 ${wakeLockActive ? 'text-amber-400 animate-pulse' : 'text-emerald-400/60'}`} />
                <div>
                  <span className="text-xs font-semibold text-amber-100 block">
                    Mantener pantalla encendida
                  </span>
                  <span className="text-[10px] text-emerald-300/60 block">
                    Evita que el móvil se bloquee encima de la mesa
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleWakeLock}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  wakeLockActive ? 'bg-amber-500' : 'bg-emerald-950/80'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    wakeLockActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Share Current Score */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#062113] hover:bg-[#0c3820] border border-amber-900/50 text-xs font-semibold text-emerald-200 hover:text-amber-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Compartir resultado actual por WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#062113] border-t border-amber-900/60 flex items-center justify-between text-xs text-emerald-300/60">
          <span>El reloj continúa activo si cierras esta ventana</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-amber-400 text-amber-950 font-bold rounded-lg transition-colors cursor-pointer hover:bg-amber-300 flex items-center gap-1"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minimizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
