import React, { useState } from 'react';
import { TuteGame, TuteRound } from '../types';
import { CopasIcon, EspadasIcon, BastosIcon, OrosIcon } from './SpanishDeckIcons';
import { RotateCcw, Undo2, Check, Flame, Edit2, BookOpen, Trash2 } from 'lucide-react';
import { sounds } from '../utils/sound';
import { EditPlayerModal } from './EditPlayerModal';
import { ConfirmModal } from './ConfirmModal';
import { GameRulesCard } from './GameRulesCard';

interface TuteScorerProps {
  game: TuteGame;
  onChange: (game: TuteGame) => void;
  onVictory: (winnerName: string, subtitle: string) => void;
  onOpenRules?: () => void;
}

export const TuteScorer: React.FC<TuteScorerProps> = ({ game, onChange, onVictory, onOpenRules }) => {
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

  const [isEditingNames, setIsEditingNames] = useState(false);
  const [nameA, setNameA] = useState(game.teamA.name);
  const [nameB, setNameB] = useState(game.teamB.name);
  const [editingTeam, setEditingTeam] = useState<'A' | 'B' | null>(null);

  // Draft state for round
  const [cuarentaA, setCuarentaA] = useState(0); // 0 or 1
  const [cuarentaB, setCuarentaB] = useState(0);
  const [veinteA, setVeinteA] = useState(0); // 0 to 3
  const [veinteB, setVeinteB] = useState(0);
  const [diezUltimas, setDiezUltimas] = useState<'A' | 'B' | 'none'>('none');
  const [bazasA, setBazasA] = useState(60);
  const [bazasB, setBazasB] = useState(60);

  // Total scores from past rounds
  const totalScoreA = game.rounds.reduce((acc, r) => acc + (r.scores[game.teamA.id]?.totalRound || 0), 0);
  const totalScoreB = game.rounds.reduce((acc, r) => acc + (r.scores[game.teamB.id]?.totalRound || 0), 0);

  // Draft calculation
  const draftRoundA =
    cuarentaA * 40 +
    veinteA * 20 +
    (diezUltimas === 'A' ? 10 : 0) +
    bazasA;

  const draftRoundB =
    cuarentaB * 40 +
    veinteB * 20 +
    (diezUltimas === 'B' ? 10 : 0) +
    bazasB;

  const handleInstantTuteWin = (teamName: string, type: 'Reyes' | 'Caballos') => {
    setConfirmModal({
      isOpen: true,
      title: `¡TUTE DE ${type.toUpperCase()}!`,
      message: `¿Confirmar que ${teamName} tiene los 4 ${type}? Esta jugada otorga la victoria directa de la partida.`,
      confirmText: '¡Confirmar Tute!',
      isDangerous: false,
      action: () => {
        sounds.playVictory();
        onVictory(teamName, `¡Tute de ${type}! Victoria directa.`);
        onChange({
          ...game,
          winner: teamName,
        });
      },
    });
  };

  const handleAddRound = () => {
    sounds.playCardFlick();

    const newRound: TuteRound = {
      id: String(Date.now()),
      timestamp: Date.now(),
      scores: {
        [game.teamA.id]: {
          cuarenta: cuarentaA,
          veinte: veinteA,
          diezUltimas: diezUltimas === 'A',
          puntosBazas: bazasA,
          totalRound: draftRoundA,
        },
        [game.teamB.id]: {
          cuarenta: cuarentaB,
          veinte: veinteB,
          diezUltimas: diezUltimas === 'B',
          puntosBazas: bazasB,
          totalRound: draftRoundB,
        },
      },
    };

    const newScoreA = totalScoreA + draftRoundA;
    const newScoreB = totalScoreB + draftRoundB;

    let winner: string | null = null;
    if (newScoreA >= game.targetPoints || newScoreB >= game.targetPoints) {
      if (newScoreA > newScoreB) {
        winner = game.teamA.name;
        onVictory(game.teamA.name, `Victoria en Tute con ${newScoreA} puntos.`);
      } else if (newScoreB > newScoreA) {
        winner = game.teamB.name;
        onVictory(game.teamB.name, `Victoria en Tute con ${newScoreB} puntos.`);
      }
    }

    onChange({
      ...game,
      rounds: [newRound, ...game.rounds],
      winner,
    });

    // Reset draft
    setCuarentaA(0);
    setCuarentaB(0);
    setVeinteA(0);
    setVeinteB(0);
    setDiezUltimas('none');
    setBazasA(60);
    setBazasB(60);
  };

  const handleUndo = () => {
    if (game.rounds.length === 0) return;
    sounds.playUndo();
    onChange({
      ...game,
      rounds: game.rounds.slice(1),
      winner: null,
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpiar historial de manos',
      message: '¿Quieres vaciar todo el historial de manos y poner los marcadores a 0 manteniendo los mismos equipos?',
      confirmText: 'Sí, limpiar historial',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          rounds: [],
          winner: null,
        });
      },
    });
  };

  const handleResetGame = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reiniciar partida de Tute',
      message: '¿Reiniciar la partida de Tute? Se limpiará el historial de manos y los puntos volverán a 0.',
      confirmText: 'Reiniciar partida',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          rounds: [],
          winner: null,
        });
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#082817] p-3 sm:p-4 rounded-xl border border-amber-900/40">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <EspadasIcon className="w-5 h-5" />
            <BastosIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-200 font-deck leading-tight">
              Tantador de Tute
            </h2>
            <div className="text-xs text-emerald-300/70">
              Objetivo: {game.targetPoints} puntos · Mano #{game.rounds.length + 1}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Target selector */}
          <div className="flex items-center bg-[#051c0f] rounded-lg p-0.5 border border-amber-900/50">
            {[100, 200, 300].map((pts) => (
              <button
                key={pts}
                onClick={() => onChange({ ...game, targetPoints: pts })}
                className={`px-2 py-1 text-xs font-semibold rounded cursor-pointer ${
                  game.targetPoints === pts ? 'bg-amber-400 text-amber-950 font-bold' : 'text-emerald-300/80 hover:text-amber-200'
                }`}
              >
                {pts} pts
              </button>
            ))}
          </div>

          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="min-h-[34px] flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-200 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 cursor-pointer transition-colors"
              title="Ver normas oficiales del Tute"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Normas</span>
            </button>
          )}

          <button
            onClick={() => setIsEditingNames(!isEditingNames)}
            className="p-1.5 rounded text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
            title="Editar nombres"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetGame}
            className="p-1.5 rounded text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
            title="Reiniciar partida y limpiar historial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Game Rules Banner / Card for Tute */}
      <GameRulesCard gameType="tute" onOpenFullRules={onOpenRules} />

      {/* Inline Name Editor */}
      {isEditingNames && (
        <div className="p-3 bg-[#061e11] rounded-lg border border-amber-700/40 flex flex-wrap items-center gap-3 animate-in fade-in">
          <input
            type="text"
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            placeholder="Equipo 1"
            className="bg-[#0b331e] border border-amber-900/50 rounded px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
          />
          <span className="text-xs text-emerald-400/60 font-serif">vs</span>
          <input
            type="text"
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            placeholder="Equipo 2"
            className="bg-[#0b331e] border border-amber-900/50 rounded px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={() => {
              onChange({
                ...game,
                teamA: { ...game.teamA, name: nameA.trim() || 'Nosotros' },
                teamB: { ...game.teamB, name: nameB.trim() || 'Ellos' },
              });
              setIsEditingNames(false);
            }}
            className="px-3 py-1.5 bg-amber-400 text-amber-950 font-bold rounded text-xs hover:bg-amber-300"
          >
            Guardar
          </button>
        </div>
      )}

      {/* Main Scoreboard: Team A vs Team B */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {/* Team A */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            totalScoreA > totalScoreB
              ? 'bg-[#0f4427] border-amber-400/70 shadow-lg ring-1 ring-amber-400/30'
              : 'bg-[#0a311c] border-amber-900/40'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span
              className={`font-deck font-bold text-sm sm:text-base truncate ${
                totalScoreA > totalScoreB ? 'text-amber-300 font-extrabold' : 'text-amber-100'
              }`}
              title={game.teamA.name}
            >
              {game.teamA.name}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingTeam('A')}
                className="p-1 rounded text-emerald-300/70 hover:text-amber-300 hover:bg-emerald-900/40 cursor-pointer"
                title="Editar nombre del equipo"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-4xl sm:text-5xl font-black font-deck text-amber-300 tabular-nums my-1">
            {totalScoreA}
          </div>

          <div className="w-full bg-[#051c0f] h-2 rounded-full overflow-hidden mt-3 border border-amber-950">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalScoreA / game.targetPoints) * 100)}%` }}
            />
          </div>

          <div className="mt-3 pt-2 border-t border-emerald-950 flex justify-end">
            <button
              onClick={() => handleInstantTuteWin(game.teamA.name, 'Reyes')}
              className="text-[10px] text-amber-300/80 hover:text-amber-200 flex items-center gap-1 font-semibold"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              ¡Tute de Reyes!
            </button>
          </div>
        </div>

        {/* Team B */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            totalScoreB > totalScoreA
              ? 'bg-[#0f4427] border-amber-400/70 shadow-lg ring-1 ring-amber-400/30'
              : 'bg-[#0a311c] border-amber-900/40'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <span
              className={`font-deck font-bold text-sm sm:text-base truncate ${
                totalScoreB > totalScoreA ? 'text-amber-300 font-extrabold' : 'text-amber-100'
              }`}
              title={game.teamB.name}
            >
              {game.teamB.name}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingTeam('B')}
                className="p-1 rounded text-emerald-300/70 hover:text-amber-300 hover:bg-emerald-900/40 cursor-pointer"
                title="Editar nombre del equipo"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-4xl sm:text-5xl font-black font-deck text-amber-300 tabular-nums my-1">
            {totalScoreB}
          </div>

          <div className="w-full bg-[#051c0f] h-2 rounded-full overflow-hidden mt-3 border border-amber-950">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalScoreB / game.targetPoints) * 100)}%` }}
            />
          </div>

          <div className="mt-3 pt-2 border-t border-emerald-950 flex justify-end">
            <button
              onClick={() => handleInstantTuteWin(game.teamB.name, 'Reyes')}
              className="text-[10px] text-amber-300/80 hover:text-amber-200 flex items-center gap-1 font-semibold"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              ¡Tute de Reyes!
            </button>
          </div>
        </div>
      </div>

      {/* Round Cantos & Tally Pad */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#092b19] border-2 border-amber-700/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <h3 className="font-bold text-amber-200 font-deck text-sm sm:text-base">
            Cantos y Bazas de la Mano
          </h3>
          <div className="text-xs font-semibold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-600/30">
            {game.teamA.name}: +{draftRoundA} · {game.teamB.name}: +{draftRoundB}
          </div>
        </div>

        {/* Las Cuarenta (+40 de triunfo) */}
        <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CopasIcon className="w-4 h-4" />
              <span className="text-xs font-bold text-amber-200">Las Cuarenta (+40 pts)</span>
            </div>
            <span className="text-[10px] text-emerald-400/60">Rey y Caballo del triunfo</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 1, label: game.teamA.name, team: 'A' },
              { id: 0, label: 'Ninguno', team: 'none' },
              { id: 1, label: game.teamB.name, team: 'B' },
            ].map((opt, i) => {
              const selected =
                opt.team === 'A'
                  ? cuarentaA === 1
                  : opt.team === 'B'
                  ? cuarentaB === 1
                  : cuarentaA === 0 && cuarentaB === 0;
              return (
                <button
                  key={`cuarenta-${i}`}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    if (opt.team === 'A') {
                      setCuarentaA(1);
                      setCuarentaB(0);
                    } else if (opt.team === 'B') {
                      setCuarentaB(1);
                      setCuarentaA(0);
                    } else {
                      setCuarentaA(0);
                      setCuarentaB(0);
                    }
                  }}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all truncate ${
                    selected ? 'bg-amber-400 text-amber-950 shadow' : 'bg-[#0a2f1b] text-emerald-200/80 hover:bg-[#0f4427]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Las Veinte (+20 pts en otro palo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-2">
            <span className="text-xs font-bold text-amber-200">Las Veinte {game.teamA.name}</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={`veinteA-${num}`}
                  type="button"
                  onClick={() => {
                    setVeinteA(num);
                    sounds.playTap();
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                    veinteA === num ? 'bg-amber-400 text-amber-950 font-bold' : 'bg-[#0a2f1b] text-emerald-200'
                  }`}
                >
                  {num} ({num * 20}p)
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-2">
            <span className="text-xs font-bold text-amber-200">Las Veinte {game.teamB.name}</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={`veinteB-${num}`}
                  type="button"
                  onClick={() => {
                    setVeinteB(num);
                    sounds.playTap();
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                    veinteB === num ? 'bg-amber-400 text-amber-950 font-bold' : 'bg-[#0a2f1b] text-emerald-200'
                  }`}
                >
                  {num} ({num * 20}p)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Diez de Últimas (+10 pts) */}
        <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">Diez de Últimas (+10 pts)</span>
            <span className="text-[10px] text-emerald-400/60">Última baza ganada</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'A', label: game.teamA.name },
              { id: 'none', label: 'Ninguno' },
              { id: 'B', label: game.teamB.name },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setDiezUltimas(opt.id as 'A' | 'B' | 'none');
                  sounds.playTap();
                }}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all truncate ${
                  diezUltimas === opt.id
                    ? 'bg-amber-400 text-amber-950 shadow'
                    : 'bg-[#0a2f1b] text-emerald-200/80 hover:bg-[#0f4427]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bazas Points (Cartas sumadas) */}
        <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">Puntos de Cartas (Bazas)</span>
            <span className="text-[10px] text-emerald-400/60">Total baraja: 120 puntos</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-emerald-300 block mb-1">{game.teamA.name}</label>
              <input
                type="number"
                value={bazasA}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setBazasA(val);
                  setBazasB(Math.max(0, 120 - val));
                }}
                className="w-full bg-[#0a2f1b] border border-amber-900/50 rounded-lg p-2 text-amber-300 font-bold text-center tabular-nums"
              />
            </div>
            <div>
              <label className="text-[11px] text-emerald-300 block mb-1">{game.teamB.name}</label>
              <input
                type="number"
                value={bazasB}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setBazasB(val);
                  setBazasA(Math.max(0, 120 - val));
                }}
                className="w-full bg-[#0a2f1b] border border-amber-900/50 rounded-lg p-2 text-amber-300 font-bold text-center tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Submit Round */}
        <button
          type="button"
          onClick={handleAddRound}
          className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold font-deck rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Anotar Mano de Tute (+{draftRoundA} a {game.teamA.name} / +{draftRoundB} a {game.teamB.name})
        </button>
      </div>

      {/* History */}
      {game.rounds.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Historial de Manos ({game.rounds.length})
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearHistory}
                className="min-h-[34px] flex items-center gap-1 text-xs text-red-300 hover:text-red-100 bg-red-950/60 hover:bg-red-900/70 px-2.5 py-1 rounded-lg border border-red-900/40 cursor-pointer active:scale-95 transition-all"
                title="Limpiar todo el historial de manos y reiniciar los tanteos a 0"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Limpiar historial</span>
              </button>
              <button
                type="button"
                onClick={handleUndo}
                className="min-h-[34px] flex items-center gap-1 text-xs text-amber-300/80 hover:text-amber-200 bg-emerald-950/60 px-2.5 py-1 rounded border border-amber-900/30 cursor-pointer active:scale-95 transition-all"
                title="Deshacer última mano"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer última mano</span>
              </button>
            </div>
          </div>

          <div className="bg-[#072415] rounded-xl border border-amber-950 overflow-hidden divide-y divide-emerald-950/80 text-xs">
            {game.rounds.map((round, idx) => {
              const sA = round.scores[game.teamA.id];
              const sB = round.scores[game.teamB.id];
              return (
                <div key={round.id} className="p-3 flex items-center justify-between hover:bg-[#0a311c]/60">
                  <span className="font-bold text-amber-300/70 font-deck">
                    #{game.rounds.length - idx}
                  </span>
                  <div className="text-emerald-100">
                    <span className="font-semibold text-amber-200">{game.teamA.name}: +{sA?.totalRound || 0}</span>
                    <span className="text-emerald-400/60 mx-2">vs</span>
                    <span className="font-semibold text-amber-200">{game.teamB.name}: +{sB?.totalRound || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Team Modal for Tute */}
      {editingTeam && (
        <EditPlayerModal
          isOpen={true}
          playerName={editingTeam === 'A' ? game.teamA.name : game.teamB.name}
          onSave={(newName) => {
            if (editingTeam === 'A') {
              onChange({ ...game, teamA: { ...game.teamA, name: newName } });
            } else {
              onChange({ ...game, teamB: { ...game.teamB, name: newName } });
            }
            setEditingTeam(null);
          }}
          onClose={() => setEditingTeam(null)}
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
