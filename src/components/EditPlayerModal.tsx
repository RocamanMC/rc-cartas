import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, User } from 'lucide-react';
import { sounds } from '../utils/sound';

interface EditPlayerModalProps {
  isOpen: boolean;
  playerName: string;
  playerScore?: number;
  allowDelete?: boolean;
  scoreLabel?: string;
  onSave: (newName: string, newScore?: number) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  isOpen,
  playerName,
  playerScore,
  allowDelete,
  scoreLabel = 'Puntuación actual',
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(playerName);
  const [score, setScore] = useState<string>(playerScore !== undefined ? String(playerScore) : '');

  useEffect(() => {
    setName(playerName);
    setScore(playerScore !== undefined ? String(playerScore) : '');
  }, [playerName, playerScore, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playTap();
    const parsedScore = playerScore !== undefined ? (score === '' ? 0 : parseInt(score, 10) || 0) : undefined;
    onSave(name.trim(), parsedScore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#0a2b1b] border-2 border-amber-600/60 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-amber-200 font-deck text-base">
              Editar Jugador
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-950/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-emerald-200 block mb-1 font-semibold">
              Nombre del Jugador / Pareja
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#061e11] border border-amber-900/50 rounded-xl px-3 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
              placeholder="Nombre"
              autoFocus
            />
          </div>

          {playerScore !== undefined && (
            <div>
              <label className="text-emerald-200 block mb-1 font-semibold">
                {scoreLabel}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full bg-[#061e11] border border-amber-900/50 rounded-xl px-3 py-2.5 text-base font-bold text-amber-300 focus:outline-none focus:border-amber-400 tabular-nums"
                  placeholder="0"
                />
              </div>
              <span className="text-[11px] text-emerald-300/60 mt-1 block">
                Puedes ajustar la puntuación directamente si hubo un error.
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-2">
            {allowDelete && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl font-semibold transition-colors border border-red-800/40 cursor-pointer active:scale-95"
                title="Eliminar este jugador de la partida"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar jugador
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-emerald-300/80 hover:text-emerald-100 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow transition-colors"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
