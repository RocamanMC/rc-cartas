import React, { useState } from 'react';
import { LibreGame, LibrePlayer, PlayerProfile } from '../types';
import { RotateCcw, Undo2, UserPlus, Plus, Minus, Settings2, Edit2, Calculator, Check, BookOpen, Trash2, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';
import { EditPlayerModal } from './EditPlayerModal';
import { ConfirmModal } from './ConfirmModal';
import { GameRulesCard } from './GameRulesCard';

interface LibreScorerProps {
  game: LibreGame;
  profiles?: PlayerProfile[];
  onChange: (game: LibreGame) => void;
  onVictory: (winnerName: string, subtitle: string) => void;
  onOpenRules?: () => void;
  onOpenMoreGames?: () => void;
}

export const LibreScorer: React.FC<LibreScorerProps> = ({ game, profiles, onChange, onVictory, onOpenRules, onOpenMoreGames }) => {
  // Confirm modal state (replaces native window.confirm for iframe & mobile reliability)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDangerous?: boolean;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Limpiar',
    isDangerous: true,
    action: () => {},
  });

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [titleInput, setTitleInput] = useState(game.title);
  const [targetInput, setTargetInput] = useState(game.targetScore);

  // Custom freeform input per player
  const [customInputs, setCustomInputs] = useState<{ [playerId: string]: string }>({});

  // Editing modal state
  const [editingPlayer, setEditingPlayer] = useState<LibrePlayer | null>(null);

  // Quick Keypad modal state for rapid mobile typing
  const [keypadPlayer, setKeypadPlayer] = useState<LibrePlayer | null>(null);
  const [keypadValue, setKeypadValue] = useState<string>('0');
  const [keypadMode, setKeypadMode] = useState<'add' | 'subtract' | 'set'>('add');

  const getCustomInput = (id: string) => customInputs[id] || '';
  const setCustomInput = (id: string, val: string) => {
    setCustomInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleApplyCustomDelta = (playerId: string, sign: 1 | -1) => {
    const raw = customInputs[playerId];
    const val = parseInt(raw, 10);
    if (isNaN(val) || val === 0) return;

    handleAddPoints(playerId, val * sign);
    setCustomInput(playerId, '');
  };

  const handleAddPoints = (playerId: string, delta: number) => {
    sounds.playTap();
    const updatedPlayers = game.players.map((p) => {
      if (p.id !== playerId) return p;
      const newScore = p.score + delta;
      return {
        ...p,
        score: newScore,
        history: [delta, ...p.history],
      };
    });

    checkVictory(updatedPlayers);
  };

  const handleSetExactScore = (playerId: string, exactScore: number) => {
    sounds.playPointChime();
    const updatedPlayers = game.players.map((p) => {
      if (p.id !== playerId) return p;
      const delta = exactScore - p.score;
      return {
        ...p,
        score: exactScore,
        history: [delta, ...p.history],
      };
    });

    checkVictory(updatedPlayers);
  };

  const checkVictory = (players: LibrePlayer[]) => {
    let winner: string | null = null;
    const target = game.targetScore;
    if (target > 0) {
      if (game.isCountdown) {
        const finished = players.filter((p) => p.score <= 0);
        if (finished.length > 0) {
          winner = finished[0].name;
          onVictory(winner, '¡Ha llegado a 0 puntos!');
        }
      } else {
        const finished = players.filter((p) => p.score >= target);
        if (finished.length > 0) {
          winner = finished[0].name;
          onVictory(winner, `¡Ha alcanzado el objetivo de ${target} puntos!`);
        }
      }
    }

    onChange({
      ...game,
      players,
      winner,
    });
  };

  const handleUndoPlayer = (playerId: string) => {
    sounds.playUndo();
    const updatedPlayers = game.players.map((p) => {
      if (p.id !== playerId || p.history.length === 0) return p;
      const lastDelta = p.history[0];
      return {
        ...p,
        score: p.score - lastDelta,
        history: p.history.slice(1),
      };
    });

    onChange({
      ...game,
      players: updatedPlayers,
      winner: null,
    });
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    sounds.playTap();
    const newP: LibrePlayer = {
      id: String(Date.now()),
      name: newPlayerName.trim(),
      score: game.isCountdown ? game.targetScore : 0,
      history: [],
    };
    onChange({
      ...game,
      players: [...game.players, newP],
    });
    setNewPlayerName('');
    setShowAddPlayer(false);
  };

  const handleDeletePlayer = (id: string) => {
    if (game.players.length <= 1) {
      setConfirmModal({
        isOpen: true,
        title: 'Mínimo de jugadores',
        message: 'Debe quedar al menos 1 jugador en la mesa.',
        confirmText: 'Entendido',
        isDangerous: false,
        action: () => {},
      });
      return;
    }
    const p = game.players.find((pl) => pl.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar jugador',
      message: `¿Eliminar a ${p?.name || 'este jugador'} de la mesa?`,
      confirmText: 'Sí, eliminar',
      isDangerous: true,
      action: () => {
        sounds.playUndo();
        onChange({
          ...game,
          players: game.players.filter((player) => player.id !== id),
        });
      },
    });
  };

  const handleSavePlayerEdit = (newName: string, newScore?: number) => {
    if (!editingPlayer) return;
    const updatedPlayers = game.players.map((p) => {
      if (p.id !== editingPlayer.id) return p;
      return {
        ...p,
        name: newName,
        score: newScore !== undefined ? newScore : p.score,
      };
    });
    onChange({
      ...game,
      players: updatedPlayers,
    });
    setEditingPlayer(null);
  };

  const handleSaveSettings = () => {
    sounds.playTap();
    onChange({
      ...game,
      title: titleInput.trim() || 'Mesa Libre',
      targetScore: targetInput,
    });
    setShowSettings(false);
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpiar historial de anotaciones',
      message: '¿Quieres vaciar todo el historial de anotaciones y reiniciar los marcadores a 0?',
      confirmText: 'Sí, limpiar historial',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          winner: null,
          players: game.players.map((p) => ({
            ...p,
            score: game.isCountdown ? game.targetScore : 0,
            history: [],
          })),
        });
        setCustomInputs({});
      },
    });
  };

  const handleReset = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reiniciar partida libre',
      message: '¿Reiniciar todas las puntuaciones y limpiar el historial?',
      confirmText: 'Reiniciar partida',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          winner: null,
          players: game.players.map((p) => ({
            ...p,
            score: game.isCountdown ? game.targetScore : 0,
            history: [],
          })),
        });
        setCustomInputs({});
      },
    });
  };

  // Mobile Keypad Handlers
  const handleKeypadDigit = (digit: string) => {
    sounds.playTap();
    setKeypadValue((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleKeypadBackspace = () => {
    sounds.playTap();
    setKeypadValue((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const handleKeypadApply = () => {
    if (!keypadPlayer) return;
    const num = parseInt(keypadValue, 10) || 0;

    if (keypadMode === 'set') {
      handleSetExactScore(keypadPlayer.id, num);
    } else if (keypadMode === 'add') {
      handleAddPoints(keypadPlayer.id, num);
    } else {
      handleAddPoints(keypadPlayer.id, -num);
    }

    setKeypadPlayer(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-[#082817] p-3 sm:p-4 rounded-xl border border-amber-900/40 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-amber-200 font-deck leading-tight truncate">
              {game.title}
            </h2>
            <div className="text-xs text-emerald-300/70">
              {game.isCountdown ? 'Cuenta hacia abajo' : 'Cuenta hacia arriba'} · Meta:{' '}
              {game.targetScore > 0 ? `${game.targetScore} pts` : 'Libre'}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="min-h-[38px] px-2.5 py-1 rounded-lg text-emerald-300/80 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors flex items-center gap-1 text-xs cursor-pointer border border-amber-900/30"
              title="Ajustes de mesa"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajustes</span>
            </button>

            <button
              onClick={handleReset}
              className="min-h-[38px] min-w-[38px] p-2 rounded-lg text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors flex items-center justify-center cursor-pointer border border-amber-900/30"
              title="Reiniciar tanteo y limpiar historial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action buttons bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="min-h-[36px] flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-100 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 cursor-pointer shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Jugador</span>
          </button>

          {onOpenMoreGames && (
            <button
              onClick={onOpenMoreGames}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-amber-200 bg-[#092b19] hover:bg-[#0f4427] border border-amber-500/40 transition-colors flex items-center gap-1 text-xs cursor-pointer shadow-sm shrink-0"
              title="Ver normas de más juegos (El Culo, Brisca, Guiñote, Pocha, Cinquillo...)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Más Juegos</span>
            </button>
          )}

          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-amber-200 bg-[#0a311c] hover:bg-emerald-800 border border-amber-900/50 transition-colors flex items-center gap-1 text-xs cursor-pointer shrink-0"
              title="Ver normas y ayuda de Mesa Libre"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Normas</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Game Rules Banner / Card for Libre */}
      <GameRulesCard gameType="libre" onOpenFullRules={onOpenRules} />

      {/* Quick helper banner for extra games */}
      {onOpenMoreGames && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-[#062415] to-[#0a351e] rounded-xl border border-amber-500/40 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-amber-200 block text-sm">
                Catálogo de Más Juegos Españoles y sus Normas
              </span>
              <span className="text-emerald-200/80 text-xs">
                Consulta las reglas completas de <strong>El Culo</strong>, <strong>Brisca</strong>, <strong>Guiñote</strong>, <strong>Pocha</strong>, <strong>Cinquillo</strong>, <strong>Truco</strong>, <strong>Continental</strong>, <strong>Cuarenta</strong> y más.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenMoreGames}
            className="self-start sm:self-auto px-4 py-2 bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold rounded-xl text-xs whitespace-nowrap transition-all shadow cursor-pointer font-deck active:scale-95 shrink-0"
          >
            📚 Leer Normas de Más Juegos
          </button>
        </div>
      )}

      {/* Settings Drawer */}
      {showSettings && (
        <div className="p-4 bg-[#061e11] rounded-xl border border-amber-700/40 space-y-3 animate-in fade-in text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-emerald-300 block mb-1">Nombre del Juego / Mesa</label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full bg-[#0b331e] border border-amber-900/50 rounded-lg px-3 py-2 text-amber-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-emerald-300 block mb-1">Puntos Objetivo (0 = Sin límite)</label>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0b331e] border border-amber-900/50 rounded-lg px-3 py-2 text-amber-100 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-950/80 flex-wrap">
            <button
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/70 text-red-200 border border-red-900/40 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Limpiar Historial y Tanteos</span>
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-amber-400 text-amber-950 font-bold rounded-lg hover:bg-amber-300 cursor-pointer text-xs"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Add Player Box */}
      {showAddPlayer && (
        <div className="p-3 bg-[#061e11] rounded-xl border border-amber-700/40 space-y-2.5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nombre del nuevo jugador o pareja"
              className="flex-1 bg-[#0b331e] border border-amber-900/50 rounded-lg px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              autoFocus
            />
            <button
              onClick={handleAddPlayer}
              className="min-h-[40px] px-4 py-2 bg-amber-400 text-amber-950 font-bold rounded-lg text-xs hover:bg-amber-300 cursor-pointer"
            >
              Añadir
            </button>
          </div>

          {profiles && profiles.filter((p) => !game.players.some((gp) => gp.name.toLowerCase() === p.name.toLowerCase())).length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-950/60 text-xs">
              <span className="text-emerald-300/70 text-[11px]">Añadir de perfiles:</span>
              {profiles
                .filter((p) => !game.players.some((gp) => gp.name.toLowerCase() === p.name.toLowerCase()))
                .map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      onChange({
                        ...game,
                        players: [
                          ...game.players,
                          {
                            id: prof.id,
                            name: prof.name,
                            score: game.isCountdown ? game.targetScore : 0,
                            history: [],
                          },
                        ],
                      });
                    }}
                    className="px-2.5 py-1 bg-[#0a2f1b] hover:bg-[#0f4427] text-amber-200 border border-amber-800/40 rounded-lg text-xs"
                  >
                    + {prof.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Players Cards Grid - Fully Optimized for Touch & Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {game.players.map((player) => {
          const isLeader =
            player.score === Math.max(...game.players.map((p) => p.score)) && player.score > 0;
          const currentCustom = getCustomInput(player.id);

          return (
            <div
              key={player.id}
              className={`p-4 rounded-2xl border transition-all ${
                isLeader
                  ? 'bg-[#0f4427] border-amber-400/80 shadow-lg ring-1 ring-amber-400/30'
                  : 'bg-[#0a2f1b] border-amber-900/40'
              }`}
            >
              {/* Header: Player Name + Edit button */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`font-deck font-bold text-base sm:text-lg truncate ${
                      isLeader ? 'text-amber-300 font-extrabold' : 'text-amber-100'
                    }`}
                    title={player.name}
                  >
                    {player.name}
                  </span>
                </div>

                {/* Edit Player Button */}
                <button
                  type="button"
                  onClick={() => setEditingPlayer(player)}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 rounded-lg text-emerald-300/80 hover:text-amber-200 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                  title="Editar jugador o puntuación (incluye opción de eliminar)"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Big Score (clickable to open rapid keypad) */}
              <div className="flex items-baseline justify-between my-2">
                <button
                  type="button"
                  onClick={() => {
                    setKeypadPlayer(player);
                    setKeypadValue('0');
                    setKeypadMode('add');
                  }}
                  className="text-left group cursor-pointer"
                  title="Toca para abrir teclado de puntuación"
                >
                  <div className="text-4xl sm:text-5xl font-black font-deck text-amber-300 tabular-nums group-hover:text-amber-200 transition-colors">
                    {player.score}
                  </div>
                  <span className="text-[10px] text-emerald-400/70 group-hover:text-amber-300 underline">
                    Tocar para teclado numérico
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKeypadPlayer(player);
                    setKeypadValue(String(player.score));
                    setKeypadMode('set');
                  }}
                  className="p-2 rounded-lg bg-[#061e11] hover:bg-emerald-900/60 border border-amber-950 text-amber-300 text-xs flex items-center gap-1"
                  title="Fijar tanteo exacto"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Teclado</span>
                </button>
              </div>

              {/* FREEDOM TO ENTER ANY NUMBER (Direct Custom Input with + / -) */}
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950/80 space-y-2 mt-3">
                <div className="text-[11px] font-semibold text-emerald-300/80 flex items-center justify-between">
                  <span>Anotar cualquier número:</span>
                  <span className="text-[10px] text-amber-400/70">Libertad total</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={currentCustom}
                    onChange={(e) => setCustomInput(player.id, e.target.value)}
                    placeholder="Ej. 15, 23, 100..."
                    className="flex-1 bg-[#0b331e] border border-amber-900/50 rounded-lg px-2.5 py-2 text-sm font-bold text-amber-200 focus:outline-none focus:border-amber-400 tabular-nums min-w-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyCustomDelta(player.id, 1);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCustomDelta(player.id, 1)}
                    disabled={!currentCustom || currentCustom === '0'}
                    className="min-h-[42px] px-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-amber-950 font-bold rounded-lg text-xs cursor-pointer active:scale-95 transition-all shadow shrink-0 flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Sumar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCustomDelta(player.id, -1)}
                    disabled={!currentCustom || currentCustom === '0'}
                    className="min-h-[42px] px-2.5 bg-red-900/60 hover:bg-red-800 disabled:opacity-40 text-red-100 font-bold rounded-lg text-xs cursor-pointer active:scale-95 transition-all shrink-0 flex items-center gap-0.5"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    Restar
                  </button>
                </div>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="grid grid-cols-5 gap-1.5 my-3">
                <button
                  type="button"
                  onClick={() => handleAddPoints(player.id, 1)}
                  className="min-h-[40px] bg-emerald-900/60 hover:bg-emerald-800 text-amber-200 font-bold rounded-lg text-xs cursor-pointer active:scale-95"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPoints(player.id, 5)}
                  className="min-h-[40px] bg-emerald-900/60 hover:bg-emerald-800 text-amber-200 font-bold rounded-lg text-xs cursor-pointer active:scale-95"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPoints(player.id, 10)}
                  className="min-h-[40px] bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg text-xs cursor-pointer active:scale-95 shadow"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPoints(player.id, 20)}
                  className="min-h-[40px] bg-amber-600 hover:bg-amber-500 text-amber-950 font-black rounded-lg text-xs cursor-pointer active:scale-95 shadow"
                >
                  +20
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPoints(player.id, -1)}
                  className="min-h-[40px] bg-red-950/50 hover:bg-red-900/70 text-red-200 font-bold rounded-lg text-xs cursor-pointer active:scale-95"
                >
                  -1
                </button>
              </div>

              {/* History & Undo */}
              <div className="pt-2 border-t border-emerald-950 flex items-center justify-between text-xs">
                <span className="text-emerald-300/60 text-[11px] truncate">
                  Últimos: {player.history.slice(0, 4).join(', ') || 'Sin cambios'}
                </span>
                {player.history.length > 0 && (
                  <button
                    onClick={() => handleUndoPlayer(player.id)}
                    className="min-h-[32px] px-2 text-amber-300/80 hover:text-amber-200 flex items-center gap-1 text-[11px] rounded"
                    title="Deshacer último"
                  >
                    <Undo2 className="w-3.5 h-3.5" /> Deshacer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Player Modal */}
      {editingPlayer && (
        <EditPlayerModal
          isOpen={true}
          playerName={editingPlayer.name}
          playerScore={editingPlayer.score}
          allowDelete={game.players.length > 1}
          scoreLabel="Puntuación actual del jugador"
          onSave={handleSavePlayerEdit}
          onDelete={() => {
            handleDeletePlayer(editingPlayer.id);
            setEditingPlayer(null);
          }}
          onClose={() => setEditingPlayer(null)}
        />
      )}

      {/* Rapid Mobile NumPad / Keypad Modal */}
      {keypadPlayer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0a2b1b] border-t-2 sm:border-2 border-amber-600/70 rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl">
            {/* Grab handle for mobile touch */}
            <div className="sm:hidden w-12 h-1.5 bg-amber-900/60 rounded-full mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <div>
                <span className="text-xs text-emerald-300/70 block">Anotación para:</span>
                <span className="font-deck font-bold text-amber-200 text-base">
                  {keypadPlayer.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setKeypadPlayer(null)}
                className="p-1 rounded text-emerald-300/70 hover:text-amber-200"
              >
                ✕
              </button>
            </div>

            {/* Mode selector (Sumar, Restar, Fijar Tanteo) */}
            <div className="grid grid-cols-3 gap-1 bg-[#061e11] p-1 rounded-xl border border-amber-950">
              <button
                type="button"
                onClick={() => setKeypadMode('add')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  keypadMode === 'add'
                    ? 'bg-amber-400 text-amber-950 shadow'
                    : 'text-emerald-300/80 hover:text-amber-200'
                }`}
              >
                + Sumar
              </button>
              <button
                type="button"
                onClick={() => setKeypadMode('subtract')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  keypadMode === 'subtract'
                    ? 'bg-red-800 text-white shadow'
                    : 'text-emerald-300/80 hover:text-amber-200'
                }`}
              >
                - Restar
              </button>
              <button
                type="button"
                onClick={() => setKeypadMode('set')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  keypadMode === 'set'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-emerald-300/80 hover:text-amber-200'
                }`}
              >
                Fijar Total
              </button>
            </div>

            {/* Display */}
            <div className="bg-[#051c0f] p-3 rounded-xl border border-amber-900/60 text-right">
              <span className="text-xs text-emerald-400/60 block">
                {keypadMode === 'add' ? 'Valor a sumar:' : keypadMode === 'subtract' ? 'Valor a restar:' : 'Nuevo total exacto:'}
              </span>
              <span className="text-3xl font-black font-deck text-amber-300 tabular-nums">
                {keypadMode === 'add' ? `+${keypadValue}` : keypadMode === 'subtract' ? `-${keypadValue}` : keypadValue}
              </span>
            </div>

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadDigit(digit)}
                  className="min-h-[48px] bg-[#0b331e] hover:bg-emerald-900 text-amber-100 font-bold text-xl rounded-xl border border-amber-950/60 active:scale-95 transition-transform"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setKeypadValue('0')}
                className="min-h-[48px] bg-[#082415] hover:bg-[#0c351f] text-emerald-300 text-xs font-bold rounded-xl active:scale-95"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadDigit('0')}
                className="min-h-[48px] bg-[#0b331e] hover:bg-emerald-900 text-amber-100 font-bold text-xl rounded-xl border border-amber-950/60 active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="min-h-[48px] bg-[#082415] hover:bg-[#0c351f] text-amber-300 text-sm font-bold rounded-xl active:scale-95"
              >
                ⌫
              </button>
            </div>

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleKeypadApply}
              className="w-full min-h-[50px] bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-base font-deck rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              Confirmar Anotación
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.action}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
