import React from 'react';
import { X, Palette, Smartphone, Volume2, Check, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';

export type TapeteTheme = 'verde' | 'rojo' | 'azul' | 'negro';

interface TableSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: TapeteTheme;
  onChangeTheme: (theme: TapeteTheme) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
}

export const TableSettingsModal: React.FC<TableSettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onChangeTheme,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
  onToggleHaptics,
}) => {
  if (!isOpen) return null;

  const themes: {
    id: TapeteTheme;
    name: string;
    subtitle: string;
    previewBg: string;
    accentBorder: string;
  }[] = [
    {
      id: 'verde',
      name: 'Verde Taberna',
      subtitle: 'El tapete clásico de la baraja española y mesón',
      previewBg: 'bg-[#0d3822] border-emerald-500/60',
      accentBorder: 'border-emerald-400',
    },
    {
      id: 'rojo',
      name: 'Rojo Borgoña',
      subtitle: 'Terciopelo casino y elegancia real',
      previewBg: 'bg-[#2b0b14] border-rose-500/60',
      accentBorder: 'border-rose-400',
    },
    {
      id: 'azul',
      name: 'Azul Cantábrico',
      subtitle: 'Zafiro imperial y gran contraste dorado',
      previewBg: 'bg-[#0d1e38] border-blue-500/60',
      accentBorder: 'border-blue-400',
    },
    {
      id: 'negro',
      name: 'Negro Azabache',
      subtitle: 'Edición nocturna premium con destellos oro',
      previewBg: 'bg-[#121417] border-zinc-500/60',
      accentBorder: 'border-amber-400',
    },
  ];

  const handleSelectTheme = (theme: TapeteTheme) => {
    sounds.playCardFlick();
    haptics.point();
    onChangeTheme(theme);
  };

  const handleTestVibration = () => {
    haptics.victory();
    sounds.playStoneClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#092b19] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-900/60 bg-[#062113]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-deck text-amber-200">
                Ajustes de la Mesa
              </h2>
              <p className="text-xs text-emerald-200/70">
                Personaliza el tapete y la respuesta táctil
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

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Section 1: Themes */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Color de Fieltro / Tapete
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {themes.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      isSelected
                        ? `${t.previewBg} ring-2 ring-amber-400 shadow-lg scale-[1.02]`
                        : `${t.previewBg} opacity-80 hover:opacity-100 hover:scale-[1.01]`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-deck">
                        {t.name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-300 leading-tight">
                      {t.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Haptics & Vibration */}
          <div className="pt-2 border-t border-amber-900/40 space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Sensación Táctil y Sonido
            </span>

            {/* Haptic Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#062113] border border-amber-900/50">
              <div className="flex items-center gap-2.5">
                <Smartphone className={`w-4 h-4 ${hapticsEnabled ? 'text-amber-400 animate-pulse' : 'text-emerald-400/60'}`} />
                <div>
                  <span className="text-xs font-semibold text-amber-100 block">
                    Vibración Háptica en Móvil
                  </span>
                  <span className="text-[10px] text-emerald-300/60 block">
                    Respuesta táctil al pulsar botones y amarracos
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleHaptics}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  hapticsEnabled ? 'bg-amber-500' : 'bg-emerald-950/80'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test vibration button */}
            {hapticsEnabled && (
              <div className="flex justify-end">
                <button
                  onClick={handleTestVibration}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Probar vibración táctil</span>
                </button>
              </div>
            )}

            {/* Sound Effects Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#062113] border border-amber-900/50">
              <div className="flex items-center gap-2.5">
                <Volume2 className={`w-4 h-4 ${soundEnabled ? 'text-amber-400' : 'text-emerald-400/60'}`} />
                <div>
                  <span className="text-xs font-semibold text-amber-100 block">
                    Efectos de Sonido
                  </span>
                  <span className="text-[10px] text-emerald-300/60 block">
                    Sonido de naipes, garbanzos, chinillas y victorias
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  soundEnabled ? 'bg-amber-500' : 'bg-emerald-950/80'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#062113] border-t border-amber-900/60 flex items-center justify-between text-xs text-emerald-300/60">
          <span>Tus preferencias se guardan en el móvil</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-400 text-amber-950 font-bold rounded-lg transition-colors cursor-pointer hover:bg-amber-300"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
