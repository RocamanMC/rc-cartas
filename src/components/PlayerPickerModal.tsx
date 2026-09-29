import React, { useState } from 'react';
import { X, Check, Users, UserPlus } from 'lucide-react';
import { PlayerProfile, AvatarSuit } from '../types';
import { SpanishSuitIcon, AVATAR_SUIT_OPTIONS } from './SpanishDeckIcons';
import { sounds } from '../utils/sound';

interface PlayerPickerModalProps {
  isOpen: boolean;
  profiles: PlayerProfile[];
  currentSelectedNames: string[];
  title?: string;
  minPlayers?: number;
  maxPlayers?: number;
  onConfirm: (selectedProfiles: PlayerProfile[]) => void;
  onAddNewProfile: (name: string, suit: AvatarSuit) => PlayerProfile;
  onClose: () => void;
}

export const PlayerPickerModal: React.FC<PlayerPickerModalProps> = ({
  isOpen,
  profiles,
  currentSelectedNames,
  title = 'Elegir Jugadores para la Partida',
  minPlayers = 2,
  maxPlayers = 8,
  onConfirm,
  onAddNewProfile,
  onClose,
}) => {
  // Pre-select profiles that match currently active names
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const matched = profiles
      .filter((p) => currentSelectedNames.some((name) => name.toLowerCase() === p.name.toLowerCase()))
      .map((p) => p.id);
    return matched.length > 0 ? matched : profiles.slice(0, 2).map((p) => p.id);
  });

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickSuit, setQuickSuit] = useState<AvatarSuit>('oros');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleProfile = (id: string) => {
    sounds.playTap();
    setWarningMessage(null);
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= minPlayers) {
        setWarningMessage(`Debes seleccionar al menos ${minPlayers} jugadores.`);
        return;
      }
      setSelectedIds(selectedIds.filter((pId) => pId !== id));
    } else {
      if (selectedIds.length >= maxPlayers) {
        setWarningMessage(`El máximo para esta partida es de ${maxPlayers} jugadores.`);
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleQuickAdd = () => {
    if (!quickName.trim()) return;
    const newProf = onAddNewProfile(quickName.trim(), quickSuit);
    setSelectedIds([...selectedIds, newProf.id]);
    setQuickName('');
    setShowQuickAdd(false);
  };

  const handleConfirm = () => {
    if (selectedIds.length < minPlayers) {
      alert(`Selecciona al menos ${minPlayers} jugadores.`);
      return;
    }
    sounds.playPointChime();
    const chosen = selectedIds
      .map((id) => profiles.find((p) => p.id === id))
      .filter(Boolean) as PlayerProfile[];

    onConfirm(chosen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0a2b1b] border-2 border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-900/40 bg-[#072013]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-amber-200 font-deck text-base">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-emerald-300/70 hover:text-amber-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {warningMessage && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between">
              <span>{warningMessage}</span>
              <button
                type="button"
                onClick={() => setWarningMessage(null)}
                className="text-red-400 hover:text-red-200 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          <div className="text-xs text-emerald-200/80 flex items-center justify-between">
            <span>Toca para seleccionar quién juega esta partida:</span>
            <span className="font-bold text-amber-300">
              {selectedIds.length} seleccionados
            </span>
          </div>

          {/* Profiles list */}
          <div className="space-y-2">
            {profiles.map((profile) => {
              const isSelected = selectedIds.includes(profile.id);
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => toggleProfile(profile.id)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#0f4427] border-amber-400 shadow ring-1 ring-amber-400/40'
                      : 'bg-[#061e11] border-amber-950/70 hover:bg-[#092918]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#04190e] border border-amber-800/40 shrink-0">
                      <SpanishSuitIcon suit={profile.avatarSuit} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-amber-100 font-deck">
                        {profile.name}
                      </div>
                      {profile.nickname && (
                        <div className="text-[11px] text-emerald-300/60">
                          {profile.nickname}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-amber-950'
                        : 'border-emerald-700/60 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick add new profile button / form */}
          {!showQuickAdd ? (
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="w-full py-2.5 px-3 border border-dashed border-amber-700/60 hover:border-amber-400 rounded-xl text-xs font-semibold text-amber-300/90 hover:text-amber-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              + Crear nuevo perfil de jugador
            </button>
          ) : (
            <div className="p-3 bg-[#061e11] rounded-xl border border-amber-700/60 space-y-3 animate-in fade-in text-xs">
              <span className="font-bold text-amber-200 block">Nuevo Jugador para Guardar:</span>
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Nombre del jugador..."
                className="w-full bg-[#0b331e] border border-amber-900/60 rounded-lg p-2 text-amber-100 focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <div className="space-y-1.5">
                <span className="text-emerald-300/80 text-[11px] block">Icono de Avatar:</span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#041a0e] rounded-lg border border-amber-950/60">
                  {AVATAR_SUIT_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setQuickSuit(item.id)}
                      className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        quickSuit === item.id
                          ? 'border-amber-400 bg-amber-950/70 shadow'
                          : 'border-transparent hover:bg-emerald-950/50 opacity-70 hover:opacity-100'
                      }`}
                      title={item.label}
                    >
                      <SpanishSuitIcon suit={item.id} className="w-5 h-5" />
                      <span className="text-[9px] text-amber-200/90 truncate w-full text-center leading-none">
                        {item.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-3 py-1.5 text-emerald-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={!quickName.trim()}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg disabled:opacity-40"
                >
                  Guardar y Seleccionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-amber-900/40 bg-[#072013] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-emerald-300/80 hover:text-emerald-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs font-deck shadow transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Cargar en la Partida
          </button>
        </div>
      </div>
    </div>
  );
};
