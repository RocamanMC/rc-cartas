import React, { useState } from 'react';
import { EscobaGame, EscobaPlayer, EscobaRound, PlayerProfile, AvatarSuit } from '../types';
import { OrosIcon } from './SpanishDeckIcons';
import { RotateCcw, Undo2, Plus, Minus, Check, Edit2, UserPlus, Trash2, Users, BookOpen } from 'lucide-react';
import { sounds } from '../utils/sound';
import { EditPlayerModal } from './EditPlayerModal';
import { PlayerPickerModal } from './PlayerPickerModal';
import { ConfirmModal } from './ConfirmModal';
import { GameRulesCard } from './GameRulesCard';

interface EscobaScorerProps {
  game: EscobaGame;
  profiles: PlayerProfile[];
  onChange: (game: EscobaGame) => void;
  onAddNewProfile: (name: string, suit: AvatarSuit) => PlayerProfile;
  onVictory: (winnerName: string, subtitle: string) => void;
  onOpenRules?: () => void;
}

export const EscobaScorer: React.FC<EscobaScorerProps> = ({
  game,
  profiles,
  onChange,
  onAddNewProfile,
  onVictory,
  onOpenRules,
}) => {
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
  // Round draft state
  const [escobasByPlayer, setEscobasByPlayer] = useState<{ [playerId: string]: number }>({});
  const [cartasWinner, setCartasWinner] = useState<string>('none');
  const [orosWinner, setOrosWinner] = useState<string>('none');
  const [velosWinner, setVelosWinner] = useState<string>('none');
  const [setentaWinner, setSetentaWinner] = useState<string>('none');

  // Player management state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<EscobaPlayer | null>(null);

  // Direct score editing state (type directly on the number like notes)
  const [editingScorePlayerId, setEditingScorePlayerId] = useState<string | null>(null);
  const [directScoreInput, setDirectScoreInput] = useState<string>('');

  // Calculate total score for each player from recorded rounds
  const getPlayerTotalScore = (playerId: string) => {
    return game.rounds.reduce((acc, r) => acc + (r.scores[playerId]?.totalRound || 0), 0);
  };

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

    const currentScore = getPlayerTotalScore(playerId);
    if (parsed === currentScore) return;

    sounds.playPointChime();
    const diff = parsed - currentScore;

    // Record an adjustment round
    const adjustRound: EscobaRound = {
      id: `direct-${Date.now()}`,
      timestamp: Date.now(),
      manoIndex: game.manoIndex,
      scores: {
        [playerId]: {
          escobas: 0,
          cartas: false,
          oros: false,
          sieteVelos: false,
          setenta: false,
          totalRound: diff,
        },
      },
    };

    if (parsed >= game.targetPoints && diff > 0) {
      const p = game.players.find((pl) => pl.id === playerId);
      if (p) onVictory(p.name, `¡Victoria en la Escoba con ${parsed} puntos!`);
    }

    onChange({
      ...game,
      rounds: [adjustRound, ...game.rounds],
    });
  };

  const getEscobas = (playerId: string) => escobasByPlayer[playerId] || 0;
  const setEscobas = (playerId: string, val: number) => {
    setEscobasByPlayer((prev) => ({ ...prev, [playerId]: Math.max(0, val) }));
  };

  // Calculate draft round points for each player
  const getDraftRoundPoints = (playerId: string) => {
    let pts = getEscobas(playerId);
    if (cartasWinner === playerId) pts += 1;
    if (orosWinner === playerId) pts += 1;
    if (velosWinner === playerId) pts += 1;
    if (setentaWinner === playerId) pts += 1;
    return pts;
  };

  const totalDraftPointsInRound = game.players.reduce((sum, p) => sum + getDraftRoundPoints(p.id), 0);

  // Find highest scorer
  const playerScores = game.players.map((p) => ({
    ...p,
    total: getPlayerTotalScore(p.id),
  }));
  const maxScore = Math.max(...playerScores.map((p) => p.total), 0);

  // Direct score adjustment on player card (+1 / -1)
  const handleDirectAdjust = (playerId: string, delta: number) => {
    if (delta > 0) {
      sounds.playCardFlick();
    } else {
      sounds.playUndo();
    }

    const currentScore = getPlayerTotalScore(playerId);
    const newScore = Math.max(0, currentScore + delta);

    // Create a manual adjust round or adjust existing rounds
    const adjustmentRound: EscobaRound = {
      id: String(Date.now()),
      timestamp: Date.now(),
      manoIndex: game.manoIndex,
      scores: {
        [playerId]: {
          escobas: 0,
          cartas: false,
          oros: false,
          sieteVelos: false,
          setenta: false,
          totalRound: delta,
        },
      },
    };

    if (newScore >= game.targetPoints && delta > 0) {
      const p = game.players.find((pl) => pl.id === playerId);
      if (p) onVictory(p.name, `¡Victoria en la Escoba con ${newScore} puntos!`);
    }

    onChange({
      ...game,
      rounds: [adjustmentRound, ...game.rounds],
    });
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    sounds.playTap();
    const newP: EscobaPlayer = {
      id: String(Date.now()),
      name: newPlayerName.trim(),
    };
    onChange({
      ...game,
      players: [...game.players, newP],
    });
    setNewPlayerName('');
    setShowAddPlayer(false);
  };

  const handleRemovePlayer = (id: string) => {
    if (game.players.length <= 2) {
      setConfirmModal({
        isOpen: true,
        title: 'Mínimo de jugadores',
        message: 'La Escoba del 15 requiere al menos 2 jugadores en la mesa.',
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
      message: `¿Estás seguro de que deseas eliminar a ${p?.name || 'este jugador'} de la partida?`,
      confirmText: 'Sí, eliminar',
      isDangerous: true,
      action: () => {
        sounds.playUndo();
        onChange({
          ...game,
          players: game.players.filter((player) => player.id !== id),
          manoIndex: game.manoIndex % (game.players.length - 1),
        });
      },
    });
  };

  const handleSavePlayerEdit = (newName: string, directScore?: number) => {
    if (!editingPlayer) return;
    const currentScore = getPlayerTotalScore(editingPlayer.id);

    let updatedRounds = game.rounds;
    if (directScore !== undefined && directScore !== currentScore) {
      const diff = directScore - currentScore;
      const adjustRound: EscobaRound = {
        id: String(Date.now()),
        timestamp: Date.now(),
        manoIndex: game.manoIndex,
        scores: {
          [editingPlayer.id]: {
            escobas: 0,
            cartas: false,
            oros: false,
            sieteVelos: false,
            setenta: false,
            totalRound: diff,
          },
        },
      };
      updatedRounds = [adjustRound, ...game.rounds];
    }

    const updatedPlayers = game.players.map((p) => {
      if (p.id !== editingPlayer.id) return p;
      return { ...p, name: newName };
    });

    onChange({
      ...game,
      players: updatedPlayers,
      rounds: updatedRounds,
    });
    setEditingPlayer(null);
  };

  const handleAddRound = () => {
    sounds.playPointChime();

    const roundScores: EscobaRound['scores'] = {};
    const newTotals: { [playerId: string]: number } = {};

    game.players.forEach((p) => {
      const roundPts = getDraftRoundPoints(p.id);
      roundScores[p.id] = {
        escobas: getEscobas(p.id),
        cartas: cartasWinner === p.id,
        oros: orosWinner === p.id,
        sieteVelos: velosWinner === p.id,
        setenta: setentaWinner === p.id,
        totalRound: roundPts,
      };
      newTotals[p.id] = getPlayerTotalScore(p.id) + roundPts;
    });

    const newRound: EscobaRound = {
      id: String(Date.now()),
      timestamp: Date.now(),
      manoIndex: game.manoIndex,
      scores: roundScores,
    };

    // Check if anyone won
    const candidates = game.players
      .map((p) => ({ name: p.name, score: newTotals[p.id] }))
      .filter((c) => c.score >= game.targetPoints);

    let winnerName: string | null = null;
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      if (candidates.length === 1 || candidates[0].score > candidates[1].score) {
        winnerName = candidates[0].name;
        onVictory(winnerName, `¡Victoria en la Escoba con ${candidates[0].score} puntos!`);
      }
    }

    onChange({
      ...game,
      manoIndex: (game.manoIndex + 1) % game.players.length,
      rounds: [newRound, ...game.rounds],
      winner: winnerName,
    });

    // Reset draft
    setEscobasByPlayer({});
    setCartasWinner('none');
    setOrosWinner('none');
    setVelosWinner('none');
    setSetentaWinner('none');
  };

  const handleUndo = () => {
    if (game.rounds.length === 0) return;
    sounds.playUndo();
    onChange({
      ...game,
      rounds: game.rounds.slice(1),
      manoIndex: (game.manoIndex - 1 + game.players.length) % game.players.length,
      winner: null,
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpiar historial de manos',
      message: '¿Quieres vaciar todo el historial de manos y poner los marcadores a 0 manteniendo a los mismos jugadores en la mesa?',
      confirmText: 'Sí, limpiar historial',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          rounds: [],
          winner: null,
          manoIndex: 0,
        });
        setEscobasByPlayer({});
        setCartasWinner('none');
        setOrosWinner('none');
        setVelosWinner('none');
        setSetentaWinner('none');
      },
    });
  };

  const handleResetGame = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reiniciar partida de Escoba',
      message: '¿Comenzar una nueva partida de Escoba? Se limpiará el historial de manos y los tantos volverán a 0.',
      confirmText: 'Reiniciar partida',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          rounds: [],
          winner: null,
          manoIndex: 0,
        });
        setEscobasByPlayer({});
        setCartasWinner('none');
        setOrosWinner('none');
        setVelosWinner('none');
        setSetentaWinner('none');
      },
    });
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Top Banner & Quick Controls - Highly compact for mobile */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#082817] p-2.5 sm:p-4 rounded-xl border border-amber-900/40">
        <div className="flex items-center gap-2 min-w-0">
          <OrosIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-amber-200 font-deck leading-tight truncate">
              La Escoba del 15
            </h2>
            <div className="text-[11px] text-emerald-300/70 truncate">
              Mano #{game.rounds.length + 1} · A {game.targetPoints} pts
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {/* Target points selector */}
          <div className="flex items-center bg-[#051c0f] rounded-lg p-0.5 border border-amber-900/50">
            <button
              onClick={() => onChange({ ...game, targetPoints: 15 })}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md min-h-[34px] cursor-pointer ${
                game.targetPoints === 15 ? 'bg-amber-400 text-amber-950 font-bold' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              15 pts
            </button>
            <button
              onClick={() => onChange({ ...game, targetPoints: 21 })}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md min-h-[34px] cursor-pointer ${
                game.targetPoints === 21 ? 'bg-amber-400 text-amber-950 font-bold' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              21 pts
            </button>
          </div>

          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="min-h-[34px] flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-200 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 cursor-pointer transition-colors"
              title="Ver normas oficiales de la Escoba"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Normas</span>
            </button>
          )}

          <button
            onClick={() => setShowPickerModal(true)}
            className="min-h-[34px] flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors cursor-pointer"
            title="Elegir jugadores de tus perfiles guardados"
          >
            <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Perfiles</span>
          </button>

          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="min-h-[34px] flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-100 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 cursor-pointer"
            title="Añadir jugador"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Jugador</span>
          </button>

          <button
            onClick={handleResetGame}
            className="min-h-[34px] min-w-[34px] flex items-center justify-center p-1.5 rounded-lg text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors cursor-pointer"
            title="Reiniciar partida completa y limpiar historial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Game Rules Banner / Card */}
      <GameRulesCard gameType="escoba" onOpenFullRules={onOpenRules} />

      {/* Add Player Box */}
      {showAddPlayer && (
        <div className="p-3 bg-[#061e11] rounded-xl border border-amber-700/40 space-y-2.5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nombre del nuevo jugador (ej. Carlos, Marta...)"
              className="flex-1 bg-[#0b331e] border border-amber-900/50 rounded-lg px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              autoFocus
            />
            <button
              onClick={handleAddPlayer}
              className="min-h-[38px] px-3.5 py-1.5 bg-amber-400 text-amber-950 font-bold rounded-lg text-xs hover:bg-amber-300 cursor-pointer"
            >
              Añadir
            </button>
          </div>

          {/* Quick chips of saved profiles not yet added */}
          {profiles.filter((p) => !game.players.some((gp) => gp.name.toLowerCase() === p.name.toLowerCase())).length > 0 && (
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
                        players: [...game.players, { id: prof.id, name: prof.name }],
                      });
                    }}
                    className="px-2.5 py-1 bg-[#0a2f1b] hover:bg-[#0f4427] text-amber-200 border border-amber-800/40 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ {prof.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Individual Players Scoreboard Grid - Responsive 2-col on mobile for maximum readability */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {game.players.map((player, idx) => {
          const totalScore = getPlayerTotalScore(player.id);
          const isLeader = totalScore === maxScore && totalScore > 0;
          const isMano = idx === game.manoIndex;

          return (
            <div
              key={player.id}
              className={`p-3 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                isMano
                  ? isLeader
                    ? 'bg-[#14532d] border-amber-300 shadow-lg ring-2 ring-amber-400/70'
                    : 'bg-[#0d3b22] border-amber-400/90 shadow-md ring-1 ring-amber-400/40'
                  : isLeader
                  ? 'bg-[#114728] border-amber-400 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-[#0a2f1b] border-amber-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`font-deck font-bold text-sm sm:text-base truncate ${
                        isLeader ? 'text-amber-300 font-extrabold' : 'text-amber-100'
                      }`}
                      title={player.name}
                    >
                      {player.name}
                    </span>
                    {isMano && (
                      <button
                        type="button"
                        onClick={() => onChange({ ...game, manoIndex: (idx + 1) % game.players.length })}
                        className="text-sm select-none shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                        title={`${player.name} es Mano (toca para cambiar de mano)`}
                        aria-label="Mano"
                      >
                        ✋
                      </button>
                    )}
                  </div>

                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingPlayer(player)}
                      className="p-1 rounded text-emerald-300/70 hover:text-amber-300 hover:bg-emerald-900/40 cursor-pointer"
                      title="Editar jugador (nombre, puntos o eliminar)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Score (Clickable like notes to set whatever number you want) */}
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
                        title="Guardar tanteo"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartScoreEdit(player.id, totalScore)}
                      className="group text-left cursor-pointer flex items-baseline gap-1 hover:opacity-90 active:scale-95 transition-all p-0.5 rounded -ml-0.5"
                      title="Pincha en el número para escribir la puntuación que quieras"
                    >
                      <div className="text-3xl sm:text-4xl font-black font-deck text-amber-300 tabular-nums border-b-2 border-dashed border-amber-400/50 group-hover:border-amber-300 group-hover:text-amber-200">
                        {totalScore}
                      </div>
                      <Edit2 className="w-3 h-3 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
                    </button>
                  )}
                  <span className="text-[11px] text-emerald-300/60 font-semibold">
                    /{game.targetPoints}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#051c0f] h-1.5 rounded-full overflow-hidden mt-1.5 border border-amber-950">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalScore / game.targetPoints) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Direct quick adjustments for mobile (+1 / -1 in 1 tap) */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-emerald-950/60">
                <button
                  type="button"
                  onClick={() => handleDirectAdjust(player.id, -1)}
                  className="flex-1 min-h-[34px] bg-[#072415] hover:bg-emerald-900/60 text-red-300 text-xs font-bold rounded-lg border border-amber-950 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                  title="Restar 1 punto directo"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectAdjust(player.id, 1)}
                  className="flex-1 min-h-[34px] bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 text-xs font-bold rounded-lg border border-amber-900/40 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                  title="Sumar 1 punto directo"
                >
                  +1
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streamlined Round Anotación Form - Unified for Rapid Touch Input */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#092b19] border-2 border-amber-700/40 shadow-xl space-y-4">
        {/* Header with preview */}
        <div className="flex flex-wrap items-center justify-between border-b border-amber-900/40 pb-2.5 gap-2">
          <div>
            <h3 className="font-bold text-amber-200 font-deck text-sm sm:text-base">
              Anotar Baza / Mano #{game.rounds.length + 1}
            </h3>
            <span className="text-[11px] text-emerald-300/70">
              Marca quién ganó cada lance en esta mano:
            </span>
          </div>

          <div className="text-xs text-amber-300 bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-600/30 flex items-center gap-2 flex-wrap">
            {game.players.map((p) => {
              const draft = getDraftRoundPoints(p.id);
              return (
                <span key={`preview-${p.id}`} className="font-semibold">
                  {p.name}: <strong className="text-amber-200">+{draft}</strong>
                </span>
              );
            })}
          </div>
        </div>

        {/* 1. Clean Escobas Steppers */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
            <span>🧹</span> Escobas Limpias (+1 c/u)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {game.players.map((p) => {
              const count = getEscobas(p.id);
              return (
                <div
                  key={`escoba-p-${p.id}`}
                  className="flex items-center justify-between p-2 bg-[#061e11] rounded-xl border border-amber-950"
                >
                  <span className="text-xs text-emerald-200 font-semibold truncate pr-2">
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEscobas(p.id, count - 1);
                        sounds.playTap();
                      }}
                      className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg bg-emerald-950 hover:bg-emerald-900 text-amber-200 cursor-pointer active:scale-95 text-base font-bold border border-emerald-900"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-amber-300 w-7 text-center tabular-nums font-deck">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEscobas(p.id, count + 1);
                        sounds.playCardFlick();
                      }}
                      className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 cursor-pointer font-bold active:scale-95 shadow"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Rapid Lances Pill Selector - 4 simple rows without scrolling! */}
        <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-3 text-xs">
          {/* 7 de Oros */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 flex items-center gap-1">
                <span>⭐</span> 7 de Oros (+1)
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {game.players.map((p) => (
                <button
                  key={`velos-${p.id}`}
                  type="button"
                  onClick={() => {
                    setVelosWinner(p.id);
                    sounds.playTap();
                  }}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    velosWinner === p.id
                      ? 'bg-amber-400 text-amber-950 font-bold shadow ring-1 ring-amber-300'
                      : 'bg-[#0a2f1b] text-emerald-200 hover:bg-[#0f4427]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setVelosWinner('none');
                  sounds.playTap();
                }}
                className={`min-h-[42px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  velosWinner === 'none'
                    ? 'bg-amber-400 text-amber-950 font-bold shadow'
                    : 'bg-[#0a2f1b] text-emerald-300/70 hover:bg-[#0f4427]'
                }`}
              >
                Nadie
              </button>
            </div>
          </div>

          {/* Mayoría de Oros */}
          <div className="space-y-1 pt-1.5 border-t border-emerald-950/80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 flex items-center gap-1">
                <span>🪙</span> Mayoría de Oros (+1)
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {game.players.map((p) => (
                <button
                  key={`oros-${p.id}`}
                  type="button"
                  onClick={() => {
                    setOrosWinner(p.id);
                    sounds.playTap();
                  }}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    orosWinner === p.id
                      ? 'bg-amber-400 text-amber-950 font-bold shadow ring-1 ring-amber-300'
                      : 'bg-[#0a2f1b] text-emerald-200 hover:bg-[#0f4427]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOrosWinner('none');
                  sounds.playTap();
                }}
                className={`min-h-[42px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  orosWinner === 'none'
                    ? 'bg-amber-400 text-amber-950 font-bold shadow'
                    : 'bg-[#0a2f1b] text-emerald-300/70 hover:bg-[#0f4427]'
                }`}
              >
                Empate
              </button>
            </div>
          </div>

          {/* Mayoría de Cartas */}
          <div className="space-y-1 pt-1.5 border-t border-emerald-950/80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 flex items-center gap-1">
                <span>🃏</span> Mayoría de Cartas (+1)
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {game.players.map((p) => (
                <button
                  key={`cartas-${p.id}`}
                  type="button"
                  onClick={() => {
                    setCartasWinner(p.id);
                    sounds.playTap();
                  }}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    cartasWinner === p.id
                      ? 'bg-amber-400 text-amber-950 font-bold shadow ring-1 ring-amber-300'
                      : 'bg-[#0a2f1b] text-emerald-200 hover:bg-[#0f4427]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCartasWinner('none');
                  sounds.playTap();
                }}
                className={`min-h-[42px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  cartasWinner === 'none'
                    ? 'bg-amber-400 text-amber-950 font-bold shadow'
                    : 'bg-[#0a2f1b] text-emerald-300/70 hover:bg-[#0f4427]'
                }`}
              >
                Empate
              </button>
            </div>
          </div>

          {/* La Setenta (Sietes) */}
          <div className="space-y-1 pt-1.5 border-t border-emerald-950/80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 flex items-center gap-1">
                <span>7️⃣</span> La Setenta (Mayoría de Sietes) (+1)
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {game.players.map((p) => (
                <button
                  key={`setenta-${p.id}`}
                  type="button"
                  onClick={() => {
                    setSetentaWinner(p.id);
                    sounds.playTap();
                  }}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    setentaWinner === p.id
                      ? 'bg-amber-400 text-amber-950 font-bold shadow ring-1 ring-amber-300'
                      : 'bg-[#0a2f1b] text-emerald-200 hover:bg-[#0f4427]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSetentaWinner('none');
                  sounds.playTap();
                }}
                className={`min-h-[42px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  setentaWinner === 'none'
                    ? 'bg-amber-400 text-amber-950 font-bold shadow'
                    : 'bg-[#0a2f1b] text-emerald-300/70 hover:bg-[#0f4427]'
                }`}
              >
                Empate
              </button>
            </div>
          </div>
        </div>

        {/* Submit Round Button */}
        <button
          type="button"
          onClick={handleAddRound}
          className="w-full min-h-[50px] py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base font-deck active:scale-98"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          Anotar Mano #{game.rounds.length + 1}
        </button>
      </div>

      {/* Floating Sticky Mobile Quick Confirm Bar (visible when points are queued) */}
      {totalDraftPointsInRound > 0 && (
        <div className="md:hidden fixed bottom-[calc(3.85rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-30 bg-[#0a311c]/95 backdrop-blur-md border-2 border-amber-400 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom-3">
          <div className="text-xs truncate pl-1">
            <span className="font-bold text-amber-300 block">Mano #{game.rounds.length + 1}:</span>
            <span className="text-emerald-100 text-[11px] truncate">
              {game.players
                .filter((p) => getDraftRoundPoints(p.id) > 0)
                .map((p) => `${p.name} (+${getDraftRoundPoints(p.id)})`)
                .join(', ')}
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

      {/* History of Rounds */}
      {game.rounds.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Historial ({game.rounds.length} {game.rounds.length === 1 ? 'mano' : 'manos'})
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearHistory}
                className="min-h-[34px] flex items-center gap-1 text-xs text-red-300 hover:text-red-100 bg-red-950/60 hover:bg-red-900/70 px-2.5 py-1 rounded-lg border border-red-900/40 cursor-pointer active:scale-95 transition-all"
                title="Limpiar todo el historial de manos y poner los marcadores a 0"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Limpiar historial</span>
              </button>
              <button
                type="button"
                onClick={handleUndo}
                className="min-h-[34px] flex items-center gap-1 text-xs text-amber-300/80 hover:text-amber-200 bg-emerald-950/60 px-3 py-1 rounded-lg border border-amber-900/30 cursor-pointer active:scale-95 transition-all"
                title="Deshacer última mano"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer última</span>
              </button>
            </div>
          </div>

          <div className="bg-[#072415] rounded-xl border border-amber-950 overflow-hidden divide-y divide-emerald-950/80 text-xs">
            {game.rounds.map((round, idx) => {
              const handNum = game.rounds.length - idx;

              return (
                <div key={round.id} className="p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2 hover:bg-[#0a311c]/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-amber-300/70 font-deck w-7">
                      #{handNum}
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {game.players.map((p) => {
                        const s = round.scores[p.id];
                        return (
                          <span key={`hist-${p.id}`} className="font-semibold text-amber-200">
                            {p.name}: <strong className="text-amber-300">+{s?.totalRound || 0}</strong>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-300/70 flex items-center gap-2 flex-wrap">
                    {game.players.map((p) => {
                      const s = round.scores[p.id];
                      if (!s) return null;
                      return (
                        <span key={`details-${p.id}`}>
                          {s.escobas > 0 && <span>🧹 {s.escobas} {p.name} </span>}
                          {s.sieteVelos && <span className="text-amber-400">⭐ 7 Oros ({p.name}) </span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <EditPlayerModal
          isOpen={true}
          playerName={editingPlayer.name}
          playerScore={getPlayerTotalScore(editingPlayer.id)}
          allowDelete={game.players.length > 2}
          onSave={handleSavePlayerEdit}
          onDelete={() => {
            handleRemovePlayer(editingPlayer.id);
            setEditingPlayer(null);
          }}
          onClose={() => setEditingPlayer(null)}
        />
      )}

      {/* Player Picker Modal */}
      {showPickerModal && (
        <PlayerPickerModal
          isOpen={true}
          profiles={profiles}
          currentSelectedNames={game.players.map((p) => p.name)}
          title="Elegir Jugadores para la Escoba"
          minPlayers={2}
          maxPlayers={6}
          onConfirm={(selectedProfiles) => {
            const newPlayers: EscobaPlayer[] = selectedProfiles.map((p) => ({
              id: p.id,
              name: p.name,
            }));
            onChange({
              ...game,
              players: newPlayers,
              rounds: [],
              winner: null,
              manoIndex: 0,
            });
            setShowPickerModal(false);
          }}
          onAddNewProfile={onAddNewProfile}
          onClose={() => setShowPickerModal(false)}
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
