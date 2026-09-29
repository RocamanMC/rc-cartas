import React, { useState } from 'react';
import { PlayerProfile, GameType, AvatarSuit } from '../types';
import { SpanishSuitIcon, AVATAR_SUIT_OPTIONS } from './SpanishDeckIcons';
import { UserPlus, Edit2, Trash2, Trophy, Users, Search, Play, Check, Palette, Smartphone, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { ConfirmModal } from './ConfirmModal';
import { TapeteTheme } from './TableSettingsModal';

interface ProfilesViewProps {
  profiles: PlayerProfile[];
  onSaveProfiles: (profiles: PlayerProfile[]) => void;
  onSelectGameWithPlayers: (game: GameType, players: PlayerProfile[]) => void;
  currentTheme?: TapeteTheme;
  onChangeTheme?: (theme: TapeteTheme) => void;
  hapticsEnabled?: boolean;
  onToggleHaptics?: () => void;
}

export const ProfilesView: React.FC<ProfilesViewProps> = ({
  profiles,
  onSaveProfiles,
  onSelectGameWithPlayers,
  currentTheme = 'verde',
  onChangeTheme,
  hapticsEnabled = true,
  onToggleHaptics,
}) => {
  // Confirm modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    profileId: string | null;
    profileName: string;
  }>({
    isOpen: false,
    profileId: null,
    profileName: '',
  });

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarSuit, setAvatarSuit] = useState<AvatarSuit>('oros');

  // Multi-selection to launch a game
  const [selectedForGame, setSelectedForGame] = useState<string[]>([]);

  const filteredProfiles = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStartAdd = () => {
    setName('');
    setNickname('');
    setAvatarSuit('oros');
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleStartEdit = (profile: PlayerProfile) => {
    setName(profile.name);
    setNickname(profile.nickname || '');
    setAvatarSuit(profile.avatarSuit);
    setEditingId(profile.id);
    setShowAddForm(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playTap();

    if (editingId) {
      const updated = profiles.map((p) => {
        if (p.id !== editingId) return p;
        return {
          ...p,
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          avatarSuit,
        };
      });
      onSaveProfiles(updated);
    } else {
      const newProf: PlayerProfile = {
        id: `prof-${Date.now()}`,
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        avatarSuit,
        gamesPlayed: 0,
        gamesWon: 0,
        createdAt: Date.now(),
      };
      onSaveProfiles([...profiles, newProf]);
    }

    setShowAddForm(false);
    setEditingId(null);
    setName('');
    setNickname('');
  };

  const handleDeleteProfile = (id: string) => {
    const prof = profiles.find((p) => p.id === id);
    setDeleteConfirm({
      isOpen: true,
      profileId: id,
      profileName: prof?.name || 'este perfil',
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm.profileId) return;
    sounds.playUndo();
    onSaveProfiles(profiles.filter((p) => p.id !== deleteConfirm.profileId));
    setSelectedForGame(selectedForGame.filter((sId) => sId !== deleteConfirm.profileId));
    setDeleteConfirm({ isOpen: false, profileId: null, profileName: '' });
  };

  const toggleSelectForGame = (id: string) => {
    sounds.playTap();
    if (selectedForGame.includes(id)) {
      setSelectedForGame(selectedForGame.filter((sId) => sId !== id));
    } else {
      setSelectedForGame([...selectedForGame, id]);
    }
  };

  const handleLaunchGame = (game: GameType) => {
    sounds.playCardFlick();
    const chosen = selectedForGame
      .map((id) => profiles.find((p) => p.id === id))
      .filter(Boolean) as PlayerProfile[];

    if (chosen.length === 0) {
      onSelectGameWithPlayers(game, profiles.slice(0, 2));
    } else {
      onSelectGameWithPlayers(game, chosen);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#082817] p-4 sm:p-5 rounded-2xl border border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#041a0e] rounded-xl border border-amber-700/50 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-amber-200 font-deck leading-tight">
              Perfiles de Jugadores Guardados
            </h2>
            <p className="text-xs text-emerald-300/70 mt-0.5">
              Guarda a tus amigos y familiares para usarlos en cualquier juego sin volver a escribir sus nombres.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs font-deck shadow transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          + Nuevo Jugador
        </button>
      </div>

      {/* Theme & Felt Color Customization Card */}
      {onChangeTheme && (
        <div className="p-4 sm:p-5 bg-[#082817] rounded-2xl border border-amber-800/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-deck text-amber-200">
                  Personalización del Tapete
                </h3>
                <p className="text-xs text-emerald-300/70">
                  Cambia el color de toda la aplicación y la sensación táctil
                </p>
              </div>
            </div>

            {onToggleHaptics && (
              <div className="flex items-center gap-2 bg-[#041a0e] px-2.5 py-1.5 rounded-xl border border-amber-900/50">
                <Smartphone className={`w-3.5 h-3.5 ${hapticsEnabled ? 'text-amber-400 animate-pulse' : 'text-emerald-400/50'}`} />
                <span className="text-xs font-medium text-emerald-200 hidden sm:inline">Vibración:</span>
                <button
                  type="button"
                  onClick={onToggleHaptics}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    hapticsEnabled ? 'bg-amber-500' : 'bg-emerald-950'
                  }`}
                  title="Alternar vibración háptica"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hapticsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Theme Palette Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {
                id: 'verde' as TapeteTheme,
                name: 'Verde Taberna',
                desc: 'Tapete clásico español',
                swatch: 'bg-[#0d3822] border-emerald-400',
              },
              {
                id: 'rojo' as TapeteTheme,
                name: 'Rojo Borgoña',
                desc: 'Terciopelo casino',
                swatch: 'bg-[#2b0b14] border-rose-400',
              },
              {
                id: 'azul' as TapeteTheme,
                name: 'Azul Cantábrico',
                desc: 'Zafiro real',
                swatch: 'bg-[#0d1e38] border-blue-400',
              },
              {
                id: 'negro' as TapeteTheme,
                name: 'Negro Azabache',
                desc: 'Edición nocturna',
                swatch: 'bg-[#121417] border-amber-400',
              },
            ].map((th) => {
              const isSelected = currentTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    sounds.playCardFlick();
                    haptics.point();
                    onChangeTheme(th.id);
                  }}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    isSelected
                      ? `${th.swatch} ring-2 ring-amber-400 shadow-lg scale-[1.02]`
                      : `${th.swatch} opacity-75 hover:opacity-100 hover:scale-[1.01]`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-deck truncate">
                      {th.name}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-300 truncate">
                    {th.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {hapticsEnabled && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  haptics.victory();
                  sounds.playStoneClick();
                }}
                className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Probar vibración táctil</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form to Add / Edit Profile */}
      {showAddForm && (
        <form
          onSubmit={handleSaveForm}
          className="p-5 bg-[#061e11] rounded-2xl border-2 border-amber-600/60 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
            <h3 className="font-bold text-amber-200 font-deck text-base">
              {editingId ? 'Editar Perfil de Jugador' : 'Guardar Nuevo Jugador'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-emerald-300/70 hover:text-amber-200"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-emerald-200 font-semibold block mb-1">
                Nombre del Jugador *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Rodrigo, Mamá, Carlos..."
                className="w-full bg-[#0b331e] border border-amber-900/60 rounded-xl px-3 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-emerald-200 font-semibold block mb-1">
                Apodo o Título (opcional)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej. El As, Campeón, El Cuñao..."
                className="w-full bg-[#0b331e] border border-amber-900/60 rounded-xl px-3 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Icono de Avatar / Palo favorito */}
          <div className="space-y-2 text-xs">
            <label className="text-emerald-200 font-semibold block">
              Icono de Perfil (Baraja Española, Francesa/Póker y Figuras):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVATAR_SUIT_OPTIONS.map((suitItem) => (
                <button
                  key={suitItem.id}
                  type="button"
                  onClick={() => setAvatarSuit(suitItem.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    avatarSuit === suitItem.id
                      ? 'bg-amber-400 text-amber-950 font-bold border-amber-300 shadow ring-1 ring-amber-400'
                      : 'bg-[#0a2f1b] text-emerald-200 border-amber-900/40 hover:bg-[#0e4024]'
                  }`}
                >
                  <SpanishSuitIcon suit={suitItem.id} className="w-5 h-5 shrink-0" />
                  <span className="truncate">{suitItem.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-emerald-300 hover:text-emerald-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs font-deck shadow transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {editingId ? 'Guardar Cambios' : 'Crear Perfil'}
            </button>
          </div>
        </form>
      )}

      {/* Quick Launch Bar with selected players */}
      {selectedForGame.length > 0 && (
        <div className="p-3 sm:p-4 bg-[#0a311c] border-2 border-amber-500/80 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-300">
              {selectedForGame.length} jugadores seleccionados:
            </span>
            <span className="text-emerald-200/90 truncate max-w-[280px]">
              {selectedForGame.map((id) => profiles.find((p) => p.id === id)?.name).filter(Boolean).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-emerald-300/80 mr-1 hidden sm:inline">Jugar a:</span>
            <button
              onClick={() => handleLaunchGame('escoba')}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs font-deck shadow"
            >
              Escoba
            </button>
            <button
              onClick={() => handleLaunchGame('chinchon')}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs font-deck shadow"
            >
              Chinchón
            </button>
            <button
              onClick={() => handleLaunchGame('mus')}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs font-deck shadow"
            >
              Mus
            </button>
            <button
              onClick={() => handleLaunchGame('libre')}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-100 font-bold rounded-lg text-xs shadow"
            >
              Mesa Libre
            </button>
          </div>
        </div>
      )}

      {/* Search & Counter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full bg-[#061e11] border border-amber-900/50 rounded-xl pl-9 pr-3 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <span className="text-xs text-emerald-300/60 font-medium">
          {profiles.length} jugadores guardados
        </span>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredProfiles.map((profile) => {
          const isSelected = selectedForGame.includes(profile.id);

          return (
            <div
              key={profile.id}
              className={`p-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-[#0f4427] border-amber-400/90 shadow-lg ring-1 ring-amber-400/40'
                  : 'bg-[#0a2f1b] border-amber-900/40 hover:border-amber-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-[#041a0e] border border-amber-800/40 shrink-0 shadow-inner">
                    <SpanishSuitIcon suit={profile.avatarSuit} className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-amber-100 font-deck truncate">
                      {profile.name}
                    </h3>
                    <div className="text-xs text-emerald-300/70 truncate">
                      {profile.nickname || 'Jugador habitual'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(profile)}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center p-1 rounded-lg text-emerald-300/70 hover:text-amber-300 hover:bg-emerald-900/40 transition-colors"
                    title="Editar perfil"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center p-1 rounded-lg text-emerald-400/40 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Eliminar perfil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Select to play button */}
              <div className="mt-4 pt-3 border-t border-emerald-950/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleSelectForGame(profile.id)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 font-bold shadow'
                      : 'bg-[#061e11] text-emerald-200/90 hover:bg-[#0c3820] border border-amber-900/40'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  {isSelected ? 'Seleccionado' : 'Seleccionar para partida'}
                </button>

                <div className="text-[11px] text-emerald-400/50 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400/70" />
                  {profile.gamesWon} vict.
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center p-8 bg-[#061e11] rounded-2xl border border-amber-900/30 text-xs text-emerald-300/60 space-y-2">
          <p>No se encontraron jugadores con ese nombre.</p>
          <button
            type="button"
            onClick={handleStartAdd}
            className="text-amber-300 font-bold underline"
          >
            + Crear nuevo jugador
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Eliminar perfil"
        message={`¿Estás seguro de que deseas eliminar el perfil de ${deleteConfirm.profileName}? Se borrarán sus estadísticas guardadas.`}
        confirmText="Eliminar perfil"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirm({ isOpen: false, profileId: null, profileName: '' })}
      />
    </div>
  );
};
