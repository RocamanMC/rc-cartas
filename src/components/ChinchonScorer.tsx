import React, { useState } from 'react';
import { ChinchonGame, ChinchonPlayer, PlayerProfile } from '../types';
import { RotateCcw, Undo2, UserPlus, Trash2, Check, Flame, AlertCircle, Edit2, BookOpen } from 'lucide-react';
import { sounds } from '../utils/sound';
import { EditPlayerModal } from './EditPlayerModal';
import { ConfirmModal } from './ConfirmModal';
import { GameRulesCard } from './GameRulesCard';

interface ChinchonScorerProps {
  game: ChinchonGame;
  profiles?: PlayerProfile[];
  onChange: (game: ChinchonGame) => void;
  onVictory: (winnerName: string, subtitle: string) => void;
  onOpenRules?: () => void;
}

export const ChinchonScorer: React.FC<ChinchonScorerProps> = ({ game, profiles, onChange, onVictory, onOpenRules }) => {
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

  // Round draft scores for each player
  const [draftScores, setDraftScores] = useState<{ [playerId: string]: number }>({});
  const [closingPlayerId, setClosingPlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<ChinchonPlayer | null>(null);

  // Direct score editing state (type directly on the number like notes)
  const [editingScorePlayerId, setEditingScorePlayerId] = useState<string | null>(null);
  const [directScoreInput, setDirectScoreInput] = useState<string>('');

  const handleStartScoreEdit = (playerId: string, currentScore: number) => {
    sounds.playTap();
    setEditingScorePlayerId(playerId);
    setDirectScoreInput(String(currentScore));
  };

  const handleSaveDirectScore = (playerId: string) => {
    if (editingScorePlayerId !== playerId) return;
    setEditingScorePlayerId(null);

    const parsed = parseInt(directScoreInput.trim(), 10);
    if (isNaN(parsed) || parsed < 0) return;

    sounds.playPointChime();
    const updatedPlayers = game.players.map((p) => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        totalScore: parsed,
        isEliminated: parsed > game.maxPoints,
      };
    });

    onChange({
      ...game,
      players: updatedPlayers,
    });
  };

  // Initialize draft scores if empty
  const getDraftScore = (playerId: string) => {
    return draftScores[playerId] !== undefined ? draftScores[playerId] : 0;
  };

  const setPlayerDraft = (playerId: string, val: number) => {
    setDraftScores((prev) => ({
      ...prev,
      [playerId]: val,
    }));
  };

  const handleCerrarConMenos10 = (playerId: string) => {
    sounds.playTap();
    setClosingPlayerId(playerId);
    setPlayerDraft(playerId, -10);
  };

  const handleCerrarCon0 = (playerId: string) => {
    sounds.playTap();
    setClosingPlayerId(playerId);
    setPlayerDraft(playerId, 0);
  };

  const handleInstantChinchon = (player: ChinchonPlayer) => {
    setConfirmModal({
      isOpen: true,
      title: '¡CHINCHÓN DIRECTO!',
      message: `¿Confirmar que ${player.name} ha ligado una escalera de 7 cartas del mismo palo (Chinchón)? Gana la partida inmediatamente.`,
      confirmText: '¡Confirmar Victoria!',
      isDangerous: false,
      action: () => {
        sounds.playVictory();
        onVictory(player.name, '¡Victoria instantánea con CHINCHÓN de 7 cartas!');
        onChange({
          ...game,
          winner: player.name,
        });
      },
    });
  };

  const handleAddRound = () => {
    sounds.playCardFlick();

    let aliveCount = 0;
    const updatedPlayers = game.players.map((p) => {
      if (p.isEliminated) return p;

      const roundPoints = getDraftScore(p.id);
      const newTotal = p.totalScore + roundPoints;
      const eliminated = newTotal > game.maxPoints;

      if (!eliminated) aliveCount++;

      return {
        ...p,
        totalScore: newTotal,
        rounds: [...p.rounds, roundPoints],
        isEliminated: eliminated,
      };
    });

    // Check if only 1 player remains alive
    const remainingAlive = updatedPlayers.filter((p) => !p.isEliminated);
    let gameWinner: string | null = null;

    if (remainingAlive.length === 1) {
      gameWinner = remainingAlive[0].name;
      onVictory(remainingAlive[0].name, `¡Único superviviente con ${remainingAlive[0].totalScore} puntos!`);
    } else if (remainingAlive.length === 0) {
      // If all went over in the same round, lowest score wins
      const sorted = [...updatedPlayers].sort((a, b) => a.totalScore - b.totalScore);
      gameWinner = sorted[0].name;
      onVictory(sorted[0].name, `¡Partida finalizada! Menor puntuación: ${sorted[0].totalScore} pts.`);
    }

    onChange({
      ...game,
      players: updatedPlayers,
      roundNumber: game.roundNumber + 1,
      dealerIndex: (game.dealerIndex + 1) % game.players.length,
      winner: gameWinner,
    });

    // Reset draft
    setDraftScores({});
    setClosingPlayerId(null);
  };

  const handleReenganche = (player: ChinchonPlayer) => {
    // Highest score among alive players
    const alivePlayers = game.players.filter((p) => !p.isEliminated && p.id !== player.id);
    if (alivePlayers.length < 2) {
      setConfirmModal({
        isOpen: true,
        title: 'Reenganche no disponible',
        message: 'No se permite el reenganche si solo queda un jugador vivo en la mesa.',
        confirmText: 'Entendido',
        isDangerous: false,
        action: () => {},
      });
      return;
    }

    const maxAliveScore = Math.max(...alivePlayers.map((p) => p.totalScore));
    setConfirmModal({
      isOpen: true,
      title: 'Reenganchar Jugador',
      message: `¿Reenganchar a ${player.name} con ${maxAliveScore} puntos (la puntuación del jugador vivo con más puntos)?`,
      confirmText: 'Reenganchar',
      isDangerous: false,
      action: () => {
        sounds.playPointChime();
        onChange({
          ...game,
          players: game.players.map((p) => {
            if (p.id === player.id) {
              return {
                ...p,
                totalScore: maxAliveScore,
                isEliminated: false,
                reenganchesCount: p.reenganchesCount + 1,
              };
            }
            return p;
          }),
        });
      },
    });
  };

  const handleUndoRound = () => {
    if (game.roundNumber <= 1) return;
    sounds.playUndo();

    const updatedPlayers = game.players.map((p) => {
      if (p.rounds.length === 0) return p;
      const lastRound = p.rounds[p.rounds.length - 1];
      const newTotal = p.totalScore - lastRound;
      return {
        ...p,
        totalScore: newTotal,
        rounds: p.rounds.slice(0, -1),
        isEliminated: newTotal > game.maxPoints,
      };
    });

    onChange({
      ...game,
      players: updatedPlayers,
      roundNumber: Math.max(1, game.roundNumber - 1),
      dealerIndex: (game.dealerIndex - 1 + game.players.length) % game.players.length,
      winner: null,
    });
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    sounds.playTap();
    const newPlayer: ChinchonPlayer = {
      id: String(Date.now()),
      name: newPlayerName.trim(),
      totalScore: 0,
      rounds: Array(game.roundNumber - 1).fill(0),
      isEliminated: false,
      reenganchesCount: 0,
    };

    onChange({
      ...game,
      players: [...game.players, newPlayer],
    });
    setNewPlayerName('');
    setShowAddPlayer(false);
  };

  const handleRemovePlayer = (id: string) => {
    if (game.players.length <= 2) {
      setConfirmModal({
        isOpen: true,
        title: 'Mínimo de jugadores',
        message: 'El Chinchón requiere al menos 2 jugadores en la mesa.',
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
      message: `¿Deseas eliminar a ${p?.name || 'este jugador'} de la partida?`,
      confirmText: 'Sí, eliminar',
      isDangerous: true,
      action: () => {
        sounds.playUndo();
        onChange({
          ...game,
          players: game.players.filter((pl) => pl.id !== id),
        });
      },
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpiar historial de rondas',
      message: '¿Quieres vaciar todo el historial de rondas y reiniciar los marcadores a 0 manteniendo a los mismos jugadores?',
      confirmText: 'Sí, limpiar historial',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          roundNumber: 1,
          dealerIndex: 0,
          winner: null,
          players: game.players.map((p) => ({
            ...p,
            totalScore: 0,
            rounds: [],
            isEliminated: false,
            reenganchesCount: 0,
          })),
        });
        setDraftScores({});
        setClosingPlayerId(null);
      },
    });
  };

  const handleResetGame = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reiniciar partida de Chinchón',
      message: '¿Comenzar una nueva partida de Chinchón? Se limpiará el historial de rondas y los marcadores volverán a 0.',
      confirmText: 'Reiniciar partida',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          roundNumber: 1,
          dealerIndex: 0,
          winner: null,
          players: game.players.map((p) => ({
            ...p,
            totalScore: 0,
            rounds: [],
            isEliminated: false,
            reenganchesCount: 0,
          })),
        });
        setDraftScores({});
        setClosingPlayerId(null);
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Bar with Limit and settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#082817] p-3 sm:p-4 rounded-xl border border-amber-900/40">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-amber-200 font-deck leading-tight">
            Chinchón
          </h2>
          <div className="text-xs text-emerald-300/70">
            Límite: {game.maxPoints} puntos · Ronda #{game.roundNumber}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Max score toggle */}
          <div className="flex items-center bg-[#051c0f] rounded-lg p-0.5 border border-amber-900/50">
            <button
              onClick={() => onChange({ ...game, maxPoints: 50 })}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                game.maxPoints === 50 ? 'bg-amber-400 text-amber-950 font-bold' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              50 pts
            </button>
            <button
              onClick={() => onChange({ ...game, maxPoints: 101 })}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                game.maxPoints === 101 ? 'bg-amber-400 text-amber-950 font-bold' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              101 pts
            </button>
          </div>

          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="min-h-[34px] flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-200 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 cursor-pointer transition-colors"
              title="Ver normas oficiales del Chinchón"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Normas</span>
            </button>
          )}

          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-100 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 min-h-[34px] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Jugador</span>
          </button>

          <button
            onClick={handleResetGame}
            className="min-h-[34px] min-w-[34px] flex items-center justify-center p-1.5 rounded-lg text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors cursor-pointer"
            title="Reiniciar partida y limpiar historial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Game Rules Banner / Card for Chinchón */}
      <GameRulesCard gameType="chinchon" onOpenFullRules={onOpenRules} />

      {/* Add Player Box */}
      {showAddPlayer && (
        <div className="p-3 bg-[#061e11] rounded-xl border border-amber-700/40 space-y-2.5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nombre del nuevo jugador"
              className="flex-1 bg-[#0b331e] border border-amber-900/50 rounded-lg px-3 py-2 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              autoFocus
            />
            <button
              onClick={handleAddPlayer}
              className="px-4 py-2 bg-amber-400 text-amber-950 font-bold rounded-lg text-xs hover:bg-amber-300 cursor-pointer"
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
                            totalScore: 0,
                            rounds: Array(game.roundNumber - 1).fill(0),
                            isEliminated: false,
                            reenganchesCount: 0,
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

      {/* Players Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {game.players.map((player, idx) => {
          const isDealer = idx === game.dealerIndex;
          const isWinnerCandidate = !player.isEliminated && player.totalScore === Math.min(...game.players.filter(p => !p.isEliminated).map(p => p.totalScore));

          return (
            <div
              key={player.id}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                player.isEliminated
                  ? 'bg-[#181a17]/80 border-red-950 opacity-60'
                  : isDealer
                  ? isWinnerCandidate
                    ? 'bg-[#14532d] border-amber-300 shadow-md ring-2 ring-amber-400/60'
                    : 'bg-[#0d3b22] border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                  : isWinnerCandidate
                  ? 'bg-[#114728] border-amber-400 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-[#0a2f1b] border-amber-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`font-deck font-bold text-sm truncate ${
                      player.isEliminated
                        ? 'text-red-400 line-through'
                        : isWinnerCandidate
                        ? 'text-amber-300 font-extrabold'
                        : 'text-amber-100'
                    }`}
                    title={player.name}
                  >
                    {player.name}
                  </span>
                  {isDealer && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...game, dealerIndex: (idx + 1) % game.players.length })}
                      className="text-sm select-none shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                      title={`${player.name} es Mano / Reparte (toca para cambiar)`}
                      aria-label="Mano"
                    >
                      ✋
                    </button>
                  )}
                </div>
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => setEditingPlayer(player)}
                    className="text-emerald-300/70 hover:text-amber-300 p-1 rounded hover:bg-emerald-900/40 cursor-pointer"
                    title="Editar jugador (nombre, puntos o eliminar)"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total points (Clickable like notes to set whatever number you want) */}
              <div className="flex items-baseline justify-between my-0.5">
                {editingScorePlayerId === player.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={directScoreInput}
                      onChange={(e) => setDirectScoreInput(e.target.value)}
                      onBlur={() => handleSaveDirectScore(player.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveDirectScore(player.id);
                        if (e.key === 'Escape') setEditingScorePlayerId(null);
                      }}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      className="w-16 bg-[#041a0e] text-2xl sm:text-3xl font-black font-deck text-amber-300 border-2 border-amber-400 rounded-lg px-1.5 py-0.5 text-center focus:outline-none ring-2 ring-amber-400/60 tabular-nums shadow-inner"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSaveDirectScore(player.id)}
                      className="min-h-[34px] min-w-[34px] bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-lg flex items-center justify-center font-bold shadow cursor-pointer active:scale-95"
                      title="Guardar puntuación"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartScoreEdit(player.id, player.totalScore)}
                    className="group text-left cursor-pointer flex items-baseline gap-1 hover:opacity-90 active:scale-95 transition-all p-0.5 rounded -ml-0.5"
                    title="Pincha en el número para escribir la puntuación que quieras"
                  >
                    <div
                      className={`text-3xl sm:text-4xl font-black font-deck tabular-nums border-b-2 border-dashed ${
                        player.isEliminated
                          ? 'text-red-400 line-through border-red-500/50'
                          : 'text-amber-300 border-amber-400/50 group-hover:border-amber-300 group-hover:text-amber-200'
                      }`}
                    >
                      {player.totalScore}
                    </div>
                    <Edit2 className="w-3 h-3 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
                  </button>
                )}
                <span className="text-xs font-sans font-normal text-emerald-300/60 ml-1">
                  / {game.maxPoints}
                </span>
              </div>
                {player.isEliminated ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    Eliminado
                  </span>
                ) : (
                  <span className="text-xs text-emerald-300/70">
                    Resta: {Math.max(0, game.maxPoints - player.totalScore)}
                  </span>
                )}

              {/* Reenganche button if eliminated */}
              {player.isEliminated && game.allowReenganche && (
                <div className="mt-2 pt-2 border-t border-red-950/60 flex items-center justify-between">
                  <span className="text-[10px] text-red-200/70">
                    Reenganches: {player.reenganchesCount}
                  </span>
                  <button
                    onClick={() => handleReenganche(player)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded text-[11px] cursor-pointer"
                  >
                    Reenganchar
                  </button>
                </div>
              )}

              {/* Action trigger for Chinchon */}
              {!player.isEliminated && (
                <div className="mt-2.5 pt-2 border-t border-emerald-950 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleInstantChinchon(player)}
                    className="text-[10px] text-amber-300/80 hover:text-amber-200 flex items-center gap-1 font-semibold"
                  >
                    <Flame className="w-3 h-3 text-amber-400" />
                    ¡Chinchón directo!
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Round Entry Pad: Puntos sumados en la mano actual */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#092b19] border-2 border-amber-700/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <h3 className="font-bold text-amber-200 font-deck text-sm sm:text-base">
            Puntos de la Mano #{game.roundNumber}
          </h3>
          <span className="text-xs text-emerald-300/70">
            Anota los puntos de las cartas sin ligar
          </span>
        </div>

        {/* Players round input rows */}
        <div className="space-y-3">
          {game.players
            .filter((p) => !p.isEliminated)
            .map((player) => {
              const currentDraft = getDraftScore(player.id);
              const isCloser = closingPlayerId === player.id;

              return (
                <div
                  key={player.id}
                  className="p-3 bg-[#061e11] rounded-xl border border-amber-950 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-[130px]">
                    <span className="text-xs sm:text-sm font-bold text-emerald-100">
                      {player.name}
                    </span>
                    {isCloser && (
                      <span className="text-[9px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded">
                        Cierra
                      </span>
                    )}
                  </div>

                  {/* Quick closing actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCerrarConMenos10(player.id)}
                      className={`min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentDraft === -10
                          ? 'bg-amber-400 text-amber-950 shadow'
                          : 'bg-[#0b331e] text-amber-300 hover:bg-[#0f4427] border border-amber-900/40'
                      }`}
                    >
                      -10 (Cierre)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCerrarCon0(player.id)}
                      className={`min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                        currentDraft === 0 && isCloser
                          ? 'bg-amber-400 text-amber-950 shadow'
                          : 'bg-[#0b331e] text-emerald-200 hover:bg-[#0f4427] border border-amber-900/40'
                      }`}
                    >
                      0 pts
                    </button>
                  </div>

                  {/* Manual point stepper or input */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center bg-[#092918] rounded-xl border border-amber-900/50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerDraft(player.id, currentDraft - 1);
                          sounds.playTap();
                        }}
                        className="min-h-[40px] min-w-[38px] flex items-center justify-center text-amber-200 hover:bg-emerald-900 text-base font-bold active:scale-95"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={currentDraft}
                        onChange={(e) => setPlayerDraft(player.id, parseInt(e.target.value) || 0)}
                        className="w-12 text-center bg-transparent font-bold text-amber-300 text-sm focus:outline-none tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerDraft(player.id, currentDraft + 1);
                          sounds.playTap();
                        }}
                        className="min-h-[40px] min-w-[38px] flex items-center justify-center text-amber-200 hover:bg-emerald-900 text-base font-bold active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    {/* Presets (+5, +10) */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerDraft(player.id, currentDraft + 5);
                          sounds.playTap();
                        }}
                        className="min-h-[40px] px-3 bg-emerald-900/60 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs active:scale-95 cursor-pointer border border-emerald-800/40"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerDraft(player.id, currentDraft + 10);
                          sounds.playTap();
                        }}
                        className="min-h-[40px] px-3 bg-emerald-900/60 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs active:scale-95 cursor-pointer border border-emerald-800/40"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Submit Round */}
        <button
          type="button"
          onClick={handleAddRound}
          className="w-full min-h-[50px] py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold font-deck rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base active:scale-98"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          Registrar Mano #{game.roundNumber}
        </button>
      </div>

      {/* Floating Sticky Mobile Quick Confirm Bar */}
      {Object.values(draftScores).some((val) => val !== 0) && (
        <div className="md:hidden fixed bottom-[calc(3.85rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-30 bg-[#0a311c]/95 backdrop-blur-md border-2 border-amber-400 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom-3">
          <div className="text-xs truncate pl-1">
            <span className="font-bold text-amber-300 block">Mano #{game.roundNumber}:</span>
            <span className="text-emerald-100 text-[11px] truncate">
              {game.players
                .filter((p) => !p.isEliminated && getDraftScore(p.id) !== 0)
                .map((p) => `${p.name} (${getDraftScore(p.id) > 0 ? `+${getDraftScore(p.id)}` : getDraftScore(p.id)})`)
                .join(', ') || 'Puntuaciones listas'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddRound}
            className="min-h-[44px] px-4 py-2 bg-amber-400 active:bg-amber-300 text-amber-950 font-bold text-xs font-deck rounded-xl shadow shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Anotar
          </button>
        </div>
      )}

      {/* Round-by-round Table History */}
      {game.roundNumber > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Historial de Rondas ({game.roundNumber - 1})
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearHistory}
                className="min-h-[34px] flex items-center gap-1 text-xs text-red-300 hover:text-red-100 bg-red-950/60 hover:bg-red-900/70 px-2.5 py-1 rounded-lg border border-red-900/40 cursor-pointer active:scale-95 transition-all"
                title="Limpiar todo el historial de rondas y reiniciar marcadores a 0"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Limpiar historial</span>
              </button>
              <button
                type="button"
                onClick={handleUndoRound}
                className="min-h-[34px] flex items-center gap-1 text-xs text-amber-300/80 hover:text-amber-200 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-amber-900/30 cursor-pointer active:scale-95 transition-all"
                title="Deshacer última ronda"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer última ronda</span>
              </button>
            </div>
          </div>

          <div className="bg-[#072415] rounded-xl border border-amber-950 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#051c0f] text-emerald-300/80 border-b border-amber-950 font-deck">
                <tr>
                  <th className="p-2.5">Ronda</th>
                  {game.players.map((p) => (
                    <th key={p.id} className="p-2.5 font-bold text-amber-200">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/80 text-emerald-100">
                {Array.from({ length: game.roundNumber - 1 }).map((_, rIdx) => (
                  <tr key={`round-row-${rIdx}`} className="hover:bg-[#0a311c]/60">
                    <td className="p-2.5 font-bold text-amber-300/70">
                      #{rIdx + 1}
                    </td>
                    {game.players.map((p) => {
                      const scoreInRound = p.rounds[rIdx] !== undefined ? p.rounds[rIdx] : '-';
                      return (
                        <td key={p.id} className="p-2.5 tabular-nums font-mono">
                          {scoreInRound === -10 ? (
                            <span className="text-amber-400 font-bold">-10</span>
                          ) : scoreInRound === 0 ? (
                            <span className="text-emerald-400 font-bold">0</span>
                          ) : (
                            scoreInRound
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <EditPlayerModal
          isOpen={true}
          playerName={editingPlayer.name}
          playerScore={editingPlayer.totalScore}
          allowDelete={game.players.length > 2}
          scoreLabel="Puntos acumulados del jugador"
          onSave={(newName, newScore) => {
            const updated = game.players.map((p) => {
              if (p.id !== editingPlayer.id) return p;
              const finalScore = newScore !== undefined ? newScore : p.totalScore;
              return {
                ...p,
                name: newName,
                totalScore: finalScore,
                isEliminated: finalScore > game.maxPoints,
              };
            });
            onChange({ ...game, players: updated });
            setEditingPlayer(null);
          }}
          onDelete={() => {
            handleRemovePlayer(editingPlayer.id);
            setEditingPlayer(null);
          }}
          onClose={() => setEditingPlayer(null)}
        />
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
