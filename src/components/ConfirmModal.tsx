import React from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';
import { sounds } from '../utils/sound';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    sounds.playCardFlick();
    onConfirm();
    onClose();
  };

  const handleClose = () => {
    sounds.playTap();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#082817] border-2 border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
        {/* Header Icon + Title */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isDangerous
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isDangerous ? (
              <Trash2 className="w-5 h-5 text-red-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-bold text-amber-200 font-deck leading-snug">
              {title}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-emerald-400/60 hover:text-amber-200 rounded-lg -mt-1 -mr-1 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-amber-950/80">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 min-h-[44px] px-3 py-2 bg-[#051c0f] hover:bg-[#072614] text-emerald-200/80 text-xs font-semibold rounded-xl border border-amber-950/80 active:scale-95 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 min-h-[44px] px-3 py-2 text-xs font-bold font-deck rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-amber-950'
            }`}
          >
            {isDangerous ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
