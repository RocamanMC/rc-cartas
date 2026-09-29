import React, { useState } from 'react';
import { MusGame, PlayerProfile } from '../types';
import { AmarracoStone } from './SpanishDeckIcons';
import { RotateCcw, Undo2, Flame, Edit2, Check, BookOpen, Trash2, Settings, Trophy, Sparkles, X, ChevronRight } from 'lucide-react';
import { sounds } from '../utils/sound';
import { EditPlayerModal } from './EditPlayerModal';
import { ConfirmModal } from './ConfirmModal';
import { GameRulesCard } from './GameRulesCard';

interface MusScorerProps {
  game: MusGame;
  profiles?: PlayerProfile[];
  onChange: (game: MusGame) => void;
  onVictory: (winnerName: string, subtitle: string) => void;
  onOpenRules?: () => void;
}

export const MusScorer: React.FC<MusScorerProps> = ({ game, profiles = [], onChange, onVictory, onOpenRules }) => {
  // Modes: 'quick' (Tanteador táctil de piedras y botones) vs 'assistant' (Asistente de cobro de mano por lances)
  const [activeTab, setActiveTab] = useState<'quick' | 'assistant'>('quick');

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
    confirmText: 'Aceptar',
    isDangerous: true,
    action: () => {},
  });

  // In-app modal for Vaca Won (replaces forbidden window.alert)
  const [vacaModal, setVacaModal] = useState<{
    isOpen: boolean;
    teamName: string;
    vP1: number;
    vP2: number;
  } | null>(null);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTantos, setSettingsTantos] = useState<number>(game.tantosPorJuego);
  const [settingsChicosPorVaca, setSettingsChicosPorVaca] = useState<number>(game.juegosPorVaca);
  const [settingsVacasObjetivo, setSettingsVacasObjetivo] = useState<number>(game.vacasObjetivo);
  const [settingsNameP1, setSettingsNameP1] = useState(game.pareja1.name);
  const [settingsNameP2, setSettingsNameP2] = useState(game.pareja2.name);

  // Editing individual team
  const [editingTeam, setEditingTeam] = useState<'p1' | 'p2' | null>(null);

  // Direct score editing state (type directly on the number like notes)
  const [editingScoreTeam, setEditingScoreTeam] = useState<'p1' | 'p2' | null>(null);
  const [directScoreInput, setDirectScoreInput] = useState<string>('');

  // Selected team for single-lance pad
  const [activeTeam, setActiveTeam] = useState<'p1' | 'p2'>('p1');

  // ==========================================
  // HAND ASSISTANT STATE (Cobro oficial de mano)
  // ==========================================
  const [handGrandeWinner, setHandGrandeWinner] = useState<'p1' | 'p2' | 'nadie'>('nadie');
  const [handGrandePoints, setHandGrandePoints] = useState<number>(1); // 1 de paso, 2 envite, etc.

  const [handChicaWinner, setHandChicaWinner] = useState<'p1' | 'p2' | 'nadie'>('nadie');
  const [handChicaPoints, setHandChicaPoints] = useState<number>(1);

  // Pares
  const [handP1Pares, setHandP1Pares] = useState<number>(0); // 0: nada, 1: par, 2: medias, 3: duples
  const [handP2Pares, setHandP2Pares] = useState<number>(0);
  const [handParesWinner, setHandParesWinner] = useState<'p1' | 'p2' | 'nadie'>('nadie');
  const [handParesEnvite, setHandParesEnvite] = useState<number>(0); // puntos extras por envite

  // Juego o Punto
  const [handHasJuego, setHandHasJuego] = useState<boolean>(true);
  const [handP1Juego, setHandP1Juego] = useState<number>(0); // 0: nada, 2: juego normal, 3: juego 31
  const [handP2Juego, setHandP2Juego] = useState<number>(0);
  const [handJuegoWinner, setHandJuegoWinner] = useState<'p1' | 'p2' | 'nadie'>('nadie');
  const [handJuegoEnvite, setHandJuegoEnvite] = useState<number>(0);

  // Punto (si no hay juego)
  const [handPuntoWinner, setHandPuntoWinner] = useState<'p1' | 'p2' | 'nadie'>('nadie');
  const [handPuntoPoints, setHandPuntoPoints] = useState<number>(1);

  const resetHandAssistant = () => {
    setHandGrandeWinner('nadie');
    setHandGrandePoints(1);
    setHandChicaWinner('nadie');
    setHandChicaPoints(1);
    setHandP1Pares(0);
    setHandP2Pares(0);
    setHandParesWinner('nadie');
    setHandParesEnvite(0);
    setHandHasJuego(true);
    setHandP1Juego(0);
    setHandP2Juego(0);
    setHandJuegoWinner('nadie');
    setHandJuegoEnvite(0);
    setHandPuntoWinner('nadie');
    setHandPuntoPoints(1);
  };

  const handleStartScoreEdit = (team: 'p1' | 'p2', currentScore: number) => {
    sounds.playTap();
    setEditingScoreTeam(team);
    setDirectScoreInput(String(currentScore));
  };

  const handleSaveDirectScore = (team: 'p1' | 'p2') => {
    if (editingScoreTeam !== team) return;
    setEditingScoreTeam(null);

    const parsed = parseInt(directScoreInput.trim(), 10);
    if (isNaN(parsed) || parsed < 0) return;

    sounds.playPointChime();
    const finalScore = Math.min(game.tantosPorJuego, parsed);

    if (team === 'p1') {
      onChange({
        ...game,
        piedrasP1: finalScore,
      });
      if (finalScore >= game.tantosPorJuego) {
        handleChicoWin('p1', finalScore, game.piedrasP2, game.historialTantos);
      }
    } else {
      onChange({
        ...game,
        piedrasP2: finalScore,
      });
      if (finalScore >= game.tantosPorJuego) {
        handleChicoWin('p2', game.piedrasP1, finalScore, game.historialTantos);
      }
    }
  };

  // Helper to add points to a team
  const addPoints = (team: 'p1' | 'p2', amount: number, motivo: string) => {
    sounds.playStoneClick();

    const currentP1 = game.piedrasP1;
    const currentP2 = game.piedrasP2;
    const maxTantos = game.tantosPorJuego;

    let nextP1 = currentP1;
    let nextP2 = currentP2;

    if (team === 'p1') {
      nextP1 = Math.max(0, currentP1 + amount);
    } else {
      nextP2 = Math.max(0, currentP2 + amount);
    }

    const newHistory = [
      {
        id: String(Date.now() + Math.random()),
        equipoId: team,
        cantidad: amount,
        motivo,
        timestamp: Date.now(),
      },
      ...game.historialTantos,
    ];

    // Check if chico won
    if (nextP1 >= maxTantos || nextP2 >= maxTantos) {
      handleChicoWin(team, nextP1, nextP2, newHistory);
      return;
    }

    onChange({
      ...game,
      piedrasP1: nextP1,
      piedrasP2: nextP2,
      historialTantos: newHistory,
    });
  };

  const handleChicoWin = (
    winnerTeam: 'p1' | 'p2',
    finalP1: number,
    finalP2: number,
    history: typeof game.historialTantos
  ) => {
    sounds.playVictory();
    const winningName = winnerTeam === 'p1' ? game.pareja1.name : game.pareja2.name;

    let jP1 = game.juegosGanadosP1;
    let jP2 = game.juegosGanadosP2;
    let vP1 = game.vacasGanadasP1;
    let vP2 = game.vacasGanadasP2;

    if (winnerTeam === 'p1') {
      jP1 += 1;
    } else {
      jP2 += 1;
    }

    let matchWinner: string | null = null;

    // Check if vaca won (typically 3 or 2 chicos)
    if (jP1 >= game.juegosPorVaca) {
      vP1 += 1;
      jP1 = 0;
      jP2 = 0;
      if (vP1 >= game.vacasObjetivo) {
        matchWinner = game.pareja1.name;
        onVictory(game.pareja1.name, `¡Ganadores del Mus con ${vP1} vacas a ${vP2}!`);
      } else {
        setVacaModal({
          isOpen: true,
          teamName: game.pareja1.name,
          vP1,
          vP2,
        });
      }
    } else if (jP2 >= game.juegosPorVaca) {
      vP2 += 1;
      jP1 = 0;
      jP2 = 0;
      if (vP2 >= game.vacasObjetivo) {
        matchWinner = game.pareja2.name;
        onVictory(game.pareja2.name, `¡Ganadores del Mus con ${vP2} vacas a ${vP1}!`);
      } else {
        setVacaModal({
          isOpen: true,
          teamName: game.pareja2.name,
          vP1,
          vP2,
        });
      }
    }

    onChange({
      ...game,
      piedrasP1: 0,
      piedrasP2: 0,
      juegosGanadosP1: jP1,
      juegosGanadosP2: jP2,
      vacasGanadasP1: vP1,
      vacasGanadasP2: vP2,
      manoIndex: (game.manoIndex + 1) % 2, // Rotación automática de mano tras cada chico
      historialTantos: history,
      winner: matchWinner,
    });
  };

  // Official order of Mus scoring executed step-by-step
  const handleApplyHandAssistant = () => {
    sounds.playPointChime();
    let currentP1 = game.piedrasP1;
    let currentP2 = game.piedrasP2;
    const maxTantos = game.tantosPorJuego;
    const newHistoryItems: typeof game.historialTantos = [];

    // Helper to add points in sequence, stopping immediately if 30/40 is reached ("el que entra, gana")
    const stepAdd = (team: 'p1' | 'p2', pts: number, motivo: string): boolean => {
      if (pts <= 0) return false;
      if (team === 'p1') {
        currentP1 += pts;
      } else {
        currentP2 += pts;
      }
      newHistoryItems.unshift({
        id: String(Date.now() + Math.random()),
        equipoId: team,
        cantidad: pts,
        motivo,
        timestamp: Date.now(),
      });
      return currentP1 >= maxTantos || currentP2 >= maxTantos;
    };

    // 1. GRANDE
    if (handGrandeWinner !== 'nadie') {
      const reached = stepAdd(handGrandeWinner, handGrandePoints, `Grande (+${handGrandePoints})`);
      if (reached) {
        finishHand(currentP1, currentP2, newHistoryItems, handGrandeWinner);
        return;
      }
    }

    // 2. CHICA
    if (handChicaWinner !== 'nadie') {
      const reached = stepAdd(handChicaWinner, handChicaPoints, `Chica (+${handChicaPoints})`);
      if (reached) {
        finishHand(currentP1, currentP2, newHistoryItems, handChicaWinner);
        return;
      }
    }

    // 3. PARES
    // Pares de ley
    if (handP1Pares > 0) {
      const reached = stepAdd('p1', handP1Pares, `Pares de ley ${game.pareja1.name} (+${handP1Pares})`);
      if (reached) {
        finishHand(currentP1, currentP2, newHistoryItems, 'p1');
        return;
      }
    }
    if (handP2Pares > 0) {
      const reached = stepAdd('p2', handP2Pares, `Pares de ley ${game.pareja2.name} (+${handP2Pares})`);
      if (reached) {
        finishHand(currentP1, currentP2, newHistoryItems, 'p2');
        return;
      }
    }
    // Envite de pares
    if (handParesWinner !== 'nadie' && handParesEnvite > 0) {
      const reached = stepAdd(handParesWinner, handParesEnvite, `Envite de Pares (+${handParesEnvite})`);
      if (reached) {
        finishHand(currentP1, currentP2, newHistoryItems, handParesWinner);
        return;
      }
    }

    // 4. JUEGO o PUNTO
    if (handHasJuego) {
      // Juegos de ley
      if (handP1Juego > 0) {
        const reached = stepAdd('p1', handP1Juego, `Juego de ley ${game.pareja1.name} (+${handP1Juego})`);
        if (reached) {
          finishHand(currentP1, currentP2, newHistoryItems, 'p1');
          return;
        }
      }
      if (handP2Juego > 0) {
        const reached = stepAdd('p2', handP2Juego, `Juego de ley ${game.pareja2.name} (+${handP2Juego})`);
        if (reached) {
          finishHand(currentP1, currentP2, newHistoryItems, 'p2');
          return;
        }
      }
      // Envite de juego
      if (handJuegoWinner !== 'nadie' && handJuegoEnvite > 0) {
        const reached = stepAdd(handJuegoWinner, handJuegoEnvite, `Envite de Juego (+${handJuegoEnvite})`);
        if (reached) {
          finishHand(currentP1, currentP2, newHistoryItems, handJuegoWinner);
          return;
        }
      }
    } else {
      // Punto
      if (handPuntoWinner !== 'nadie') {
        const reached = stepAdd(handPuntoWinner, handPuntoPoints, `Punto (+${handPuntoPoints})`);
        if (reached) {
          finishHand(currentP1, currentP2, newHistoryItems, handPuntoWinner);
          return;
        }
      }
    }

    // Normal hand completion without chico win
    finishHand(currentP1, currentP2, newHistoryItems, null);
  };

  const finishHand = (
    finalP1: number,
    finalP2: number,
    newItems: typeof game.historialTantos,
    winnerTeam: 'p1' | 'p2' | null
  ) => {
    resetHandAssistant();
    const updatedHistory = [...newItems, ...game.historialTantos];

    if (winnerTeam) {
      handleChicoWin(winnerTeam, finalP1, finalP2, updatedHistory);
      return;
    }

    onChange({
      ...game,
      piedrasP1: Math.min(game.tantosPorJuego, finalP1),
      piedrasP2: Math.min(game.tantosPorJuego, finalP2),
      historialTantos: updatedHistory,
    });
  };

  const handleOrdago = (winnerTeam: 'p1' | 'p2') => {
    const winnerName = winnerTeam === 'p1' ? game.pareja1.name : game.pareja2.name;
    setConfirmModal({
      isOpen: true,
      title: '¡Órdago Ganado!',
      message: `¿Confirmar que ${winnerName} ha ganado el ÓRDAGO? Se llevará el chico completo inmediatamente.`,
      confirmText: '¡Ganar Chico!',
      isDangerous: false,
      action: () => {
        handleChicoWin(
          winnerTeam,
          winnerTeam === 'p1' ? game.tantosPorJuego : 0,
          winnerTeam === 'p2' ? game.tantosPorJuego : 0,
          [
            {
              id: String(Date.now()),
              equipoId: winnerTeam,
              cantidad: game.tantosPorJuego,
              motivo: '¡ÓRDAGO GANADO!',
              timestamp: Date.now(),
            },
            ...game.historialTantos,
          ]
        );
      },
    });
  };

  const handleUndo = () => {
    if (game.historialTantos.length === 0) return;
    const lastAction = game.historialTantos[0];
    const newHistory = game.historialTantos.slice(1);
    sounds.playUndo();

    let newP1 = game.piedrasP1;
    let newP2 = game.piedrasP2;

    if (lastAction.equipoId === 'p1') {
      newP1 = Math.max(0, newP1 - lastAction.cantidad);
    } else {
      newP2 = Math.max(0, newP2 - lastAction.cantidad);
    }

    onChange({
      ...game,
      piedrasP1: newP1,
      piedrasP2: newP2,
      historialTantos: newHistory,
    });
  };

  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpiar historial de tantos',
      message: '¿Quieres vaciar todo el registro de tantos y anotaciones de este chico?',
      confirmText: 'Sí, limpiar historial',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          historialTantos: [],
        });
      },
    });
  };

  const handleResetMatch = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reiniciar partida de Mus',
      message: '¿Reiniciar la partida completa? Se pondrán a 0 las piedras, chicos, vacas e historial de tantos.',
      confirmText: 'Reiniciar partida',
      isDangerous: true,
      action: () => {
        sounds.playCardFlick();
        onChange({
          ...game,
          piedrasP1: 0,
          piedrasP2: 0,
          juegosGanadosP1: 0,
          juegosGanadosP2: 0,
          vacasGanadasP1: 0,
          vacasGanadasP2: 0,
          manoIndex: 0,
          historialTantos: [],
          winner: null,
        });
      },
    });
  };

  const handleOpenSettings = () => {
    setSettingsTantos(game.tantosPorJuego);
    setSettingsChicosPorVaca(game.juegosPorVaca);
    setSettingsVacasObjetivo(game.vacasObjetivo);
    setSettingsNameP1(game.pareja1.name);
    setSettingsNameP2(game.pareja2.name);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    sounds.playTap();
    onChange({
      ...game,
      tantosPorJuego: settingsTantos,
      juegosPorVaca: settingsChicosPorVaca,
      vacasObjetivo: settingsVacasObjetivo,
      pareja1: { ...game.pareja1, name: settingsNameP1.trim() || 'Pareja 1' },
      pareja2: { ...game.pareja2, name: settingsNameP2.trim() || 'Pareja 2' },
    });
    setShowSettingsModal(false);
  };

  // Convert points to amarracos (groups of 5) and single piedras (1 to 4)
  const amarracosP1 = Math.floor(game.piedrasP1 / 5);
  const piedrasRestoP1 = game.piedrasP1 % 5;

  const amarracosP2 = Math.floor(game.piedrasP2 / 5);
  const piedrasRestoP2 = game.piedrasP2 % 5;

  const maxAmarracos = game.tantosPorJuego / 5;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Fast Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#082817] p-3 sm:p-4 rounded-xl border border-amber-900/40">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1">
            <AmarracoStone type="amarraco" size="sm" />
            <AmarracoStone type="piedra" size="sm" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-200 font-deck leading-tight">
              Tanteador de Mus
            </h2>
            <div className="text-xs text-emerald-300/70">
              A {game.tantosPorJuego} piedras ({maxAmarracos} amarracos) · Vaca a {game.juegosPorVaca} chicos · A {game.vacasObjetivo} {game.vacasObjetivo === 1 ? 'vaca' : 'vacas'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Fast 30 / 40 selector */}
          <div className="flex items-center bg-[#051c0f] rounded-lg p-0.5 border border-amber-900/50">
            <button
              onClick={() => onChange({ ...game, tantosPorJuego: 30 })}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                game.tantosPorJuego === 30 ? 'bg-amber-400 text-amber-950 font-bold shadow' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              30 tantos
            </button>
            <button
              onClick={() => onChange({ ...game, tantosPorJuego: 40 })}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                game.tantosPorJuego === 40 ? 'bg-amber-400 text-amber-950 font-bold shadow' : 'text-emerald-300/80 hover:text-amber-200'
              }`}
            >
              40 tantos
            </button>
          </div>

          {/* Full Settings button */}
          <button
            onClick={handleOpenSettings}
            className="min-h-[34px] flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-200 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 cursor-pointer transition-colors"
            title="Ajustes de partida (tantos, chicos por vaca, vacas objetivo y nombres)"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>

          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="min-h-[34px] flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-200 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/50 cursor-pointer transition-colors"
              title="Ver normas oficiales del Mus"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Normas</span>
            </button>
          )}

          <button
            onClick={handleResetMatch}
            className="p-1.5 rounded text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
            title="Reiniciar partida y limpiar historial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Game Rules Banner / Card for Mus */}
      <GameRulesCard gameType="mus" onOpenFullRules={onOpenRules} />

      {/* Vacas and Chicos Visual Scoreboard */}
      <div className="bg-[#061f12] p-3 sm:p-4 rounded-xl border border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Pareja 1 Score Summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="text-left">
            <span className={`font-deck font-bold text-sm sm:text-base ${game.piedrasP1 > game.piedrasP2 ? 'text-amber-300' : 'text-amber-100'}`}>
              {game.pareja1.name}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-amber-400 font-semibold">{game.vacasGanadasP1} {game.vacasGanadasP1 === 1 ? 'vaca' : 'vacas'}</span>
              <span className="text-[10px] text-emerald-300/60">·</span>
              <span className="text-xs text-emerald-200">{game.juegosGanadosP1}/{game.juegosPorVaca} chicos</span>
            </div>
          </div>
          {/* Chicos visual chips for P1 */}
          <div className="flex items-center gap-1">
            {Array.from({ length: game.juegosPorVaca }).map((_, idx) => (
              <div
                key={`p1-chico-${idx}`}
                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                  idx < game.juegosGanadosP1
                    ? 'bg-amber-400 border-amber-300 text-amber-950 shadow-sm'
                    : 'bg-[#041a0e] border-emerald-900/60 text-emerald-400/30'
                }`}
                title={`Chico ${idx + 1}`}
              >
                {idx < game.juegosGanadosP1 ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Center Badge: Chico Status */}
        <div className="px-3 py-1 bg-[#092b19] border border-amber-800/40 rounded-full flex items-center gap-1.5 text-xs text-amber-300 font-semibold shadow-inner">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Vaca {game.vacasGanadasP1 + game.vacasGanadasP2 + 1} de {game.vacasObjetivo}</span>
        </div>

        {/* Pareja 2 Score Summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Chicos visual chips for P2 */}
          <div className="flex items-center gap-1 order-2 sm:order-1">
            {Array.from({ length: game.juegosPorVaca }).map((_, idx) => (
              <div
                key={`p2-chico-${idx}`}
                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                  idx < game.juegosGanadosP2
                    ? 'bg-amber-400 border-amber-300 text-amber-950 shadow-sm'
                    : 'bg-[#041a0e] border-emerald-900/60 text-emerald-400/30'
                }`}
                title={`Chico ${idx + 1}`}
              >
                {idx < game.juegosGanadosP2 ? '✓' : ''}
              </div>
            ))}
          </div>
          <div className="text-right order-1 sm:order-2">
            <span className={`font-deck font-bold text-sm sm:text-base ${game.piedrasP2 > game.piedrasP1 ? 'text-amber-300' : 'text-amber-100'}`}>
              {game.pareja2.name}
            </span>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <span className="text-xs text-amber-400 font-semibold">{game.vacasGanadasP2} {game.vacasGanadasP2 === 1 ? 'vaca' : 'vacas'}</span>
              <span className="text-[10px] text-emerald-300/60">·</span>
              <span className="text-xs text-emerald-200">{game.juegosGanadosP2}/{game.juegosPorVaca} chicos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Tanteador Táctil vs Asistente de Mano */}
      <div className="flex items-center justify-center p-1 bg-[#061d11] rounded-xl border border-amber-900/50 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('quick')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'quick'
              ? 'bg-amber-400 text-amber-950 shadow'
              : 'text-emerald-300/80 hover:text-amber-200'
          }`}
        >
          <AmarracoStone type="piedra" size="sm" />
          <span>Tapete Táctil y Teclas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'assistant'
              ? 'bg-amber-400 text-amber-950 shadow'
              : 'text-emerald-300/80 hover:text-amber-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Anotador por Lances</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: TAPETE TÁCTIL DE PIEDRAS Y AMARRACOS (Interactivo) */}
      {/* ========================================================== */}
      {activeTab === 'quick' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pareja 1 Box */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                game.manoIndex === 0
                  ? activeTeam === 'p1'
                    ? 'bg-[#124d2d] border-amber-300 shadow-xl ring-2 ring-amber-400/50'
                    : 'bg-[#0d3b22] border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                  : activeTeam === 'p1'
                  ? 'bg-[#0e4024] border-amber-400 shadow-xl ring-2 ring-amber-400/30'
                  : 'bg-[#0a2e1a] border-amber-900/40'
              }`}
              onClick={() => setActiveTeam('p1')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`font-deck font-bold text-base sm:text-lg truncate ${
                      game.piedrasP1 > game.piedrasP2 ? 'text-amber-300 font-extrabold' : 'text-amber-100'
                    }`}
                    title={game.pareja1.name}
                  >
                    {game.pareja1.name}
                  </span>
                  {game.manoIndex === 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({ ...game, manoIndex: 1 });
                      }}
                      className="text-base select-none shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                      title={`${game.pareja1.name} es Mano (toca para cambiar)`}
                      aria-label="Mano"
                    >
                      ✋
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTeam('p1');
                    }}
                    className="p-1 rounded text-emerald-300/70 hover:text-amber-300 hover:bg-emerald-900/40 cursor-pointer"
                    title="Editar nombre y tantos de Pareja 1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Big score indicator (Clickable like notes to set whatever number you want) */}
              <div className="flex items-baseline justify-between my-2">
                {editingScoreTeam === 'p1' ? (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={directScoreInput}
                      onChange={(e) => setDirectScoreInput(e.target.value)}
                      onBlur={() => handleSaveDirectScore('p1')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveDirectScore('p1');
                        if (e.key === 'Escape') setEditingScoreTeam(null);
                      }}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      className="w-20 bg-[#041a0e] text-3xl sm:text-4xl font-black font-deck text-amber-300 border-2 border-amber-400 rounded-lg px-2 py-0.5 text-center focus:outline-none ring-2 ring-amber-400/60 tabular-nums shadow-inner"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSaveDirectScore('p1')}
                      className="min-h-[38px] min-w-[38px] bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-lg flex items-center justify-center font-bold shadow cursor-pointer active:scale-95"
                      title="Guardar tantos"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartScoreEdit('p1', game.piedrasP1);
                    }}
                    className="group text-left cursor-pointer flex items-baseline gap-1.5 hover:opacity-90 active:scale-95 transition-all p-0.5 rounded -ml-0.5"
                    title="Pincha en el número para escribir los tantos que quieras"
                  >
                    <div className="text-4xl sm:text-5xl font-black font-deck text-amber-300 tabular-nums border-b-2 border-dashed border-amber-400/50 group-hover:border-amber-300 group-hover:text-amber-200">
                      {game.piedrasP1}
                    </div>
                    <Edit2 className="w-4 h-4 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
                    <span className="text-xs sm:text-sm font-sans font-normal text-emerald-300/60 ml-0.5">
                      / {game.tantosPorJuego} tantos
                    </span>
                  </button>
                )}
                <div className="text-right text-xs text-amber-200/80">
                  <span className="font-bold text-amber-300">{amarracosP1}</span> amar. · <span className="font-bold text-amber-300">{piedrasRestoP1}</span> piedras
                </div>
              </div>

              {/* Visual stones and amarracos table layout (Interactive: Click to add/remove) */}
              <div className="mt-3 p-3 bg-[#061e11] rounded-xl border border-amber-950/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-bold text-emerald-300/70 tracking-wider">
                  <span>Amarracos ({amarracosP1}/{maxAmarracos}):</span>
                  <span className="text-[10px] text-amber-400/70 lowercase font-normal">toca para sumar +5</span>
                </div>
                <div
                  className="flex items-center gap-2 flex-wrap min-h-8 p-1.5 bg-[#03150b] rounded-lg border border-amber-950/40 cursor-pointer hover:border-amber-700/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p1', 5, 'Amarraco (+5)');
                  }}
                  title="Toca el plato para añadir un amarraco (+5)"
                >
                  {Array.from({ length: amarracosP1 }).map((_, idx) => (
                    <AmarracoStone key={`amarraco-${idx}`} type="amarraco" size="md" />
                  ))}
                  {amarracosP1 === 0 && (
                    <span className="text-xs text-emerald-400/40 italic">Toca para añadir +5</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] uppercase font-bold text-emerald-300/70 tracking-wider pt-1">
                  <span>Piedras sueltas ({piedrasRestoP1}/4):</span>
                  <span className="text-[10px] text-amber-400/70 lowercase font-normal">toca para sumar +1</span>
                </div>
                <div
                  className="flex items-center gap-2 min-h-8 p-1.5 bg-[#03150b] rounded-lg border border-amber-950/40 cursor-pointer hover:border-amber-700/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p1', 1, 'Piedra (+1)');
                  }}
                  title="Toca el plato para añadir una piedra (+1)"
                >
                  {Array.from({ length: piedrasRestoP1 }).map((_, idx) => (
                    <AmarracoStone key={`piedra-${idx}`} type="piedra" size="md" />
                  ))}
                  {piedrasRestoP1 === 0 && (
                    <span className="text-xs text-emerald-400/40 italic">Toca para añadir +1</span>
                  )}
                </div>
              </div>

              {/* Quick-add row for P1 */}
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p1', 1, 'Piedra (+1)');
                  }}
                  className="min-h-[44px] px-1 bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-emerald-800/40 text-center"
                >
                  <span>+1</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p1', 2, 'Envite (+2)');
                  }}
                  className="min-h-[44px] px-1 bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-emerald-800/40 text-center"
                >
                  <span>+2</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p1', 3, 'Duples / 31 (+3)');
                  }}
                  className="min-h-[44px] px-1 bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-emerald-800/40 text-center"
                >
                  <span>+3</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p1', 5, 'Amarraco (+5)');
                  }}
                  className="min-h-[44px] px-1 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs cursor-pointer active:scale-95 transition-all shadow flex items-center justify-center text-center"
                >
                  <span>+5</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p1', -1, 'Corrección (-1)');
                  }}
                  disabled={game.piedrasP1 === 0}
                  className="min-h-[44px] px-1 bg-red-950/40 hover:bg-red-900/60 disabled:opacity-30 text-red-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-red-950"
                  title="Restar 1"
                >
                  -1
                </button>
              </div>
            </div>

            {/* Pareja 2 Box */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                game.manoIndex === 1
                  ? activeTeam === 'p2'
                    ? 'bg-[#124d2d] border-amber-300 shadow-xl ring-2 ring-amber-400/50'
                    : 'bg-[#0d3b22] border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                  : activeTeam === 'p2'
                  ? 'bg-[#0e4024] border-amber-400 shadow-xl ring-2 ring-amber-400/30'
                  : 'bg-[#0a2e1a] border-amber-900/40'
              }`}
              onClick={() => setActiveTeam('p2')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`font-deck font-bold text-base sm:text-lg truncate ${
                      game.piedrasP2 > game.piedrasP1 ? 'text-amber-300 font-extrabold' : 'text-amber-100'
                    }`}
                    title={game.pareja2.name}
                  >
                    {game.pareja2.name}
                  </span>
                  {game.manoIndex === 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({ ...game, manoIndex: 0 });
                      }}
                      className="text-base select-none shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                      title={`${game.pareja2.name} es Mano (toca para cambiar)`}
                      aria-label="Mano"
                    >
                      ✋
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTeam('p2');
                    }}
                    className="p-1 rounded text-emerald-300/70 hover:text-amber-300 hover:bg-emerald-900/40 cursor-pointer"
                    title="Editar nombre y tantos de Pareja 2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Big score indicator */}
              <div className="flex items-baseline justify-between my-2">
                {editingScoreTeam === 'p2' ? (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={directScoreInput}
                      onChange={(e) => setDirectScoreInput(e.target.value)}
                      onBlur={() => handleSaveDirectScore('p2')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveDirectScore('p2');
                        if (e.key === 'Escape') setEditingScoreTeam(null);
                      }}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      className="w-20 bg-[#041a0e] text-3xl sm:text-4xl font-black font-deck text-amber-300 border-2 border-amber-400 rounded-lg px-2 py-0.5 text-center focus:outline-none ring-2 ring-amber-400/60 tabular-nums shadow-inner"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSaveDirectScore('p2')}
                      className="min-h-[38px] min-w-[38px] bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-lg flex items-center justify-center font-bold shadow cursor-pointer active:scale-95"
                      title="Guardar tantos"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartScoreEdit('p2', game.piedrasP2);
                    }}
                    className="group text-left cursor-pointer flex items-baseline gap-1.5 hover:opacity-90 active:scale-95 transition-all p-0.5 rounded -ml-0.5"
                    title="Pincha en el número para escribir los tantos que quieras"
                  >
                    <div className="text-4xl sm:text-5xl font-black font-deck text-amber-300 tabular-nums border-b-2 border-dashed border-amber-400/50 group-hover:border-amber-300 group-hover:text-amber-200">
                      {game.piedrasP2}
                    </div>
                    <Edit2 className="w-4 h-4 text-amber-400/60 group-hover:text-amber-300 transition-colors" />
                    <span className="text-xs sm:text-sm font-sans font-normal text-emerald-300/60 ml-0.5">
                      / {game.tantosPorJuego} tantos
                    </span>
                  </button>
                )}
                <div className="text-right text-xs text-amber-200/80">
                  <span className="font-bold text-amber-300">{amarracosP2}</span> amar. · <span className="font-bold text-amber-300">{piedrasRestoP2}</span> piedras
                </div>
              </div>

              {/* Visual stones and amarracos table layout */}
              <div className="mt-3 p-3 bg-[#061e11] rounded-xl border border-amber-950/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-bold text-emerald-300/70 tracking-wider">
                  <span>Amarracos ({amarracosP2}/{maxAmarracos}):</span>
                  <span className="text-[10px] text-amber-400/70 lowercase font-normal">toca para sumar +5</span>
                </div>
                <div
                  className="flex items-center gap-2 flex-wrap min-h-8 p-1.5 bg-[#03150b] rounded-lg border border-amber-950/40 cursor-pointer hover:border-amber-700/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p2', 5, 'Amarraco (+5)');
                  }}
                  title="Toca el plato para añadir un amarraco (+5)"
                >
                  {Array.from({ length: amarracosP2 }).map((_, idx) => (
                    <AmarracoStone key={`amarraco-p2-${idx}`} type="amarraco" size="md" />
                  ))}
                  {amarracosP2 === 0 && (
                    <span className="text-xs text-emerald-400/40 italic">Toca para añadir +5</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] uppercase font-bold text-emerald-300/70 tracking-wider pt-1">
                  <span>Piedras sueltas ({piedrasRestoP2}/4):</span>
                  <span className="text-[10px] text-amber-400/70 lowercase font-normal">toca para sumar +1</span>
                </div>
                <div
                  className="flex items-center gap-2 min-h-8 p-1.5 bg-[#03150b] rounded-lg border border-amber-950/40 cursor-pointer hover:border-amber-700/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p2', 1, 'Piedra (+1)');
                  }}
                  title="Toca el plato para añadir una piedra (+1)"
                >
                  {Array.from({ length: piedrasRestoP2 }).map((_, idx) => (
                    <AmarracoStone key={`piedra-p2-${idx}`} type="piedra" size="md" />
                  ))}
                  {piedrasRestoP2 === 0 && (
                    <span className="text-xs text-emerald-400/40 italic">Toca para añadir +1</span>
                  )}
                </div>
              </div>

              {/* Quick-add row for P2 */}
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p2', 1, 'Piedra (+1)');
                  }}
                  className="min-h-[44px] px-1 bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-emerald-800/40 text-center"
                >
                  <span>+1</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p2', 2, 'Envite (+2)');
                  }}
                  className="min-h-[44px] px-1 bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-emerald-800/40 text-center"
                >
                  <span>+2</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p2', 3, 'Duples / 31 (+3)');
                  }}
                  className="min-h-[44px] px-1 bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-emerald-800/40 text-center"
                >
                  <span>+3</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p2', 5, 'Amarraco (+5)');
                  }}
                  className="min-h-[44px] px-1 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs cursor-pointer active:scale-95 transition-all shadow flex items-center justify-center text-center"
                >
                  <span>+5</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoints('p2', -1, 'Corrección (-1)');
                  }}
                  disabled={game.piedrasP2 === 0}
                  className="min-h-[44px] px-1 bg-red-950/40 hover:bg-red-900/60 disabled:opacity-30 text-red-200 font-bold rounded-xl text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center border border-red-950"
                  title="Restar 1"
                >
                  -1
                </button>
              </div>
            </div>
          </div>

          {/* Quick Lances Selector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#092b19] border-2 border-amber-700/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-amber-200 font-deck text-sm sm:text-base">
                  Anotación Rápida por Lances
                </h3>
              </div>
              {/* Target Team Indicator */}
              <div className="flex items-center gap-1 bg-[#051c0f] p-1 rounded-lg border border-amber-950">
                <button
                  type="button"
                  onClick={() => setActiveTeam('p1')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                    activeTeam === 'p1' ? 'bg-amber-400 text-amber-950 shadow' : 'text-emerald-300/70'
                  }`}
                >
                  {game.pareja1.name}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTeam('p2')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                    activeTeam === 'p2' ? 'bg-amber-400 text-amber-950 shadow' : 'text-emerald-300/70'
                  }`}
                >
                  {game.pareja2.name}
                </button>
              </div>
            </div>

            {/* Lances Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Grande */}
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950/80 space-y-1.5">
                <span className="font-bold text-amber-300 block">Grande</span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 1, 'Grande (Paso +1)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                  >
                    +1 Paso
                  </button>
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 2, 'Grande (Envite +2)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                  >
                    +2 Envite
                  </button>
                </div>
              </div>

              {/* Chica */}
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950/80 space-y-1.5">
                <span className="font-bold text-amber-300 block">Chica</span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 1, 'Chica (Paso +1)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                  >
                    +1 Paso
                  </button>
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 2, 'Chica (Envite +2)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                  >
                    +2 Envite
                  </button>
                </div>
              </div>

              {/* Pares */}
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950/80 space-y-1.5">
                <span className="font-bold text-amber-300 block">Pares</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 1, 'Par (+1)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                    title="Par (+1)"
                  >
                    +1 Par
                  </button>
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 2, 'Medias (+2)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                    title="Medias (+2)"
                  >
                    +2 Med
                  </button>
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 3, 'Duples (+3)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                    title="Duples (+3)"
                  >
                    +3 Dup
                  </button>
                </div>
              </div>

              {/* Juego / Punto */}
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950/80 space-y-1.5">
                <span className="font-bold text-amber-300 block">Juego / Punto</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 1, 'Punto (+1)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                    title="Punto (+1)"
                  >
                    +1 Pto
                  </button>
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 2, 'Juego no 31 (+2)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                    title="Juego (+2)"
                  >
                    +2 Jgo
                  </button>
                  <button
                    type="button"
                    onClick={() => addPoints(activeTeam, 3, 'Juego de 31 (+3)')}
                    className="py-1.5 bg-[#0a311c] hover:bg-emerald-800 text-amber-200 font-semibold rounded text-center cursor-pointer active:scale-95"
                    title="Juego de 31 (+3)"
                  >
                    +3 (31)
                  </button>
                </div>
              </div>
            </div>

            {/* Órdago Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOrdago('p1')}
                className="py-2.5 px-3 bg-gradient-to-r from-red-800 via-amber-700 to-red-800 hover:from-red-700 hover:to-red-700 text-white font-bold font-deck uppercase tracking-wider rounded-xl shadow transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                ¡Órdago para {game.pareja1.name}!
              </button>
              <button
                type="button"
                onClick={() => handleOrdago('p2')}
                className="py-2.5 px-3 bg-gradient-to-r from-red-800 via-amber-700 to-red-800 hover:from-red-700 hover:to-red-700 text-white font-bold font-deck uppercase tracking-wider rounded-xl shadow transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                ¡Órdago para {game.pareja2.name}!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ASISTENTE OFICIAL DE COBRO DE MANO (Orden estricto de Mus) */}
      {/* ============================================================== */}
      {activeTab === 'assistant' && (
        <div className="p-4 sm:p-6 bg-[#082817] rounded-2xl border-2 border-amber-600/50 shadow-xl space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
            <div>
              <h3 className="font-bold text-amber-200 font-deck text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Asistente de Cobro de Mano (Reglamento Oficial)
              </h3>
              <p className="text-xs text-emerald-300/70 mt-0.5">
                Selecciona lo ocurrido en cada lance. Al pulsar <strong>Cobrar Mano</strong>, se cobrará en orden estricto (Grande → Chica → Pares → Juego/Punto). ¡Si una pareja llega a {game.tantosPorJuego} a mitad de cobro, gana el chico inmediatamente!
              </p>
            </div>
            <button
              type="button"
              onClick={resetHandAssistant}
              className="text-xs text-emerald-300 hover:text-amber-200 underline cursor-pointer shrink-0 ml-2"
            >
              Reiniciar selección
            </button>
          </div>

          {/* 1. GRANDE */}
          <div className="p-3 bg-[#061e11] rounded-xl border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">1. Grande</span>
              <span className="text-[11px] text-emerald-300/70">¿Quién se llevó la Grande?</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setHandGrandeWinner(handGrandeWinner === 'p1' ? 'nadie' : 'p1')}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  handGrandeWinner === 'p1'
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                    : 'bg-[#0a2e1a] text-amber-100 border-amber-900/40 hover:bg-emerald-900/50'
                }`}
              >
                {game.pareja1.name}
              </button>
              <button
                type="button"
                onClick={() => setHandGrandeWinner(handGrandeWinner === 'p2' ? 'nadie' : 'p2')}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  handGrandeWinner === 'p2'
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                    : 'bg-[#0a2e1a] text-amber-100 border-amber-900/40 hover:bg-emerald-900/50'
                }`}
              >
                {game.pareja2.name}
              </button>
              <button
                type="button"
                onClick={() => setHandGrandeWinner('nadie')}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  handGrandeWinner === 'nadie'
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
                    : 'bg-[#0a2e1a] text-emerald-400/70 border-amber-900/40'
                }`}
              >
                En pase / Nadie
              </button>
            </div>
            {handGrandeWinner !== 'nadie' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-emerald-200">Tantos cobrados:</span>
                {[1, 2, 3, 4, 5].map((pts) => (
                  <button
                    key={`grande-${pts}`}
                    type="button"
                    onClick={() => setHandGrandePoints(pts)}
                    className={`w-7 h-7 rounded text-xs font-bold border cursor-pointer ${
                      handGrandePoints === pts
                        ? 'bg-amber-400 text-amber-950 border-amber-300'
                        : 'bg-[#0a311c] text-amber-100 border-amber-900/50'
                    }`}
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. CHICA */}
          <div className="p-3 bg-[#061e11] rounded-xl border border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">2. Chica</span>
              <span className="text-[11px] text-emerald-300/70">¿Quién se llevó la Chica?</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setHandChicaWinner(handChicaWinner === 'p1' ? 'nadie' : 'p1')}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  handChicaWinner === 'p1'
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                    : 'bg-[#0a2e1a] text-amber-100 border-amber-900/40 hover:bg-emerald-900/50'
                }`}
              >
                {game.pareja1.name}
              </button>
              <button
                type="button"
                onClick={() => setHandChicaWinner(handChicaWinner === 'p2' ? 'nadie' : 'p2')}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  handChicaWinner === 'p2'
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                    : 'bg-[#0a2e1a] text-amber-100 border-amber-900/40 hover:bg-emerald-900/50'
                }`}
              >
                {game.pareja2.name}
              </button>
              <button
                type="button"
                onClick={() => setHandChicaWinner('nadie')}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                  handChicaWinner === 'nadie'
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
                    : 'bg-[#0a2e1a] text-emerald-400/70 border-amber-900/40'
                }`}
              >
                En pase / Nadie
              </button>
            </div>
            {handChicaWinner !== 'nadie' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-emerald-200">Tantos cobrados:</span>
                {[1, 2, 3, 4, 5].map((pts) => (
                  <button
                    key={`chica-${pts}`}
                    type="button"
                    onClick={() => setHandChicaPoints(pts)}
                    className={`w-7 h-7 rounded text-xs font-bold border cursor-pointer ${
                      handChicaPoints === pts
                        ? 'bg-amber-400 text-amber-950 border-amber-300'
                        : 'bg-[#0a311c] text-amber-100 border-amber-900/50'
                    }`}
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. PARES */}
          <div className="p-3 bg-[#061e11] rounded-xl border border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">3. Pares</span>
              <span className="text-[11px] text-emerald-300/70">Pares de ley (+envite si hubo)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* P1 Pares */}
              <div className="p-2 bg-[#092b19] rounded-lg border border-amber-950/60 space-y-1">
                <span className="font-bold text-amber-200 block">{game.pareja1.name}:</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'No', val: 0 },
                    { label: 'Par (+1)', val: 1 },
                    { label: 'Med. (+2)', val: 2 },
                    { label: 'Dup. (+3)', val: 3 },
                  ].map((item) => (
                    <button
                      key={`p1-par-${item.val}`}
                      type="button"
                      onClick={() => setHandP1Pares(item.val)}
                      className={`py-1.5 px-1 rounded text-center font-semibold border cursor-pointer ${
                        handP1Pares === item.val
                          ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold'
                          : 'bg-[#051c0f] text-emerald-200 border-emerald-950'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* P2 Pares */}
              <div className="p-2 bg-[#092b19] rounded-lg border border-amber-950/60 space-y-1">
                <span className="font-bold text-amber-200 block">{game.pareja2.name}:</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'No', val: 0 },
                    { label: 'Par (+1)', val: 1 },
                    { label: 'Med. (+2)', val: 2 },
                    { label: 'Dup. (+3)', val: 3 },
                  ].map((item) => (
                    <button
                      key={`p2-par-${item.val}`}
                      type="button"
                      onClick={() => setHandP2Pares(item.val)}
                      className={`py-1.5 px-1 rounded text-center font-semibold border cursor-pointer ${
                        handP2Pares === item.val
                          ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold'
                          : 'bg-[#051c0f] text-emerald-200 border-emerald-950'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Envite de pares */}
            {(handP1Pares > 0 || handP2Pares > 0) && (
              <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-emerald-200 font-semibold">Envite de Pares:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-300/70">Ganador:</span>
                  <button
                    type="button"
                    onClick={() => setHandParesWinner(handParesWinner === 'p1' ? 'nadie' : 'p1')}
                    className={`px-2 py-1 rounded border text-xs font-bold cursor-pointer ${
                      handParesWinner === 'p1' ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                    }`}
                  >
                    {game.pareja1.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandParesWinner(handParesWinner === 'p2' ? 'nadie' : 'p2')}
                    className={`px-2 py-1 rounded border text-xs font-bold cursor-pointer ${
                      handParesWinner === 'p2' ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                    }`}
                  >
                    {game.pareja2.name}
                  </button>
                  {handParesWinner !== 'nadie' && (
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-emerald-300/70">Tantos:</span>
                      {[1, 2, 3, 4, 5].map((pts) => (
                        <button
                          key={`pe-${pts}`}
                          type="button"
                          onClick={() => setHandParesEnvite(pts)}
                          className={`w-6 h-6 rounded text-xs font-bold border cursor-pointer ${
                            handParesEnvite === pts ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                          }`}
                        >
                          +{pts}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. JUEGO O PUNTO */}
          <div className="p-3 bg-[#061e11] rounded-xl border border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">4. {handHasJuego ? 'Juego' : 'Punto'}</span>
              <div className="flex items-center bg-[#051c0f] rounded-lg p-0.5 border border-amber-950">
                <button
                  type="button"
                  onClick={() => setHandHasJuego(true)}
                  className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                    handHasJuego ? 'bg-amber-400 text-amber-950' : 'text-emerald-300/70'
                  }`}
                >
                  Hubo Juego (≥31)
                </button>
                <button
                  type="button"
                  onClick={() => setHandHasJuego(false)}
                  className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                    !handHasJuego ? 'bg-amber-400 text-amber-950' : 'text-emerald-300/70'
                  }`}
                >
                  No hubo (Punto)
                </button>
              </div>
            </div>

            {handHasJuego ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* P1 Juego */}
                  <div className="p-2 bg-[#092b19] rounded-lg border border-amber-950/60 space-y-1">
                    <span className="font-bold text-amber-200 block">{game.pareja1.name}:</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: 'Sin juego', val: 0 },
                        { label: 'Juego (+2)', val: 2 },
                        { label: '31 (+3)', val: 3 },
                      ].map((item) => (
                        <button
                          key={`p1-juego-${item.val}`}
                          type="button"
                          onClick={() => setHandP1Juego(item.val)}
                          className={`py-1.5 px-1 rounded text-center font-semibold border cursor-pointer ${
                            handP1Juego === item.val
                              ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold'
                              : 'bg-[#051c0f] text-emerald-200 border-emerald-950'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* P2 Juego */}
                  <div className="p-2 bg-[#092b19] rounded-lg border border-amber-950/60 space-y-1">
                    <span className="font-bold text-amber-200 block">{game.pareja2.name}:</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: 'Sin juego', val: 0 },
                        { label: 'Juego (+2)', val: 2 },
                        { label: '31 (+3)', val: 3 },
                      ].map((item) => (
                        <button
                          key={`p2-juego-${item.val}`}
                          type="button"
                          onClick={() => setHandP2Juego(item.val)}
                          className={`py-1.5 px-1 rounded text-center font-semibold border cursor-pointer ${
                            handP2Juego === item.val
                              ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold'
                              : 'bg-[#051c0f] text-emerald-200 border-emerald-950'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Envite de Juego */}
                {(handP1Juego > 0 || handP2Juego > 0) && (
                  <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-emerald-200 font-semibold">Envite de Juego:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-300/70">Ganador:</span>
                      <button
                        type="button"
                        onClick={() => setHandJuegoWinner(handJuegoWinner === 'p1' ? 'nadie' : 'p1')}
                        className={`px-2 py-1 rounded border text-xs font-bold cursor-pointer ${
                          handJuegoWinner === 'p1' ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                        }`}
                      >
                        {game.pareja1.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHandJuegoWinner(handJuegoWinner === 'p2' ? 'nadie' : 'p2')}
                        className={`px-2 py-1 rounded border text-xs font-bold cursor-pointer ${
                          handJuegoWinner === 'p2' ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                        }`}
                      >
                        {game.pareja2.name}
                      </button>
                      {handJuegoWinner !== 'nadie' && (
                        <div className="flex items-center gap-1 ml-2">
                          <span className="text-emerald-300/70">Tantos:</span>
                          {[1, 2, 3, 4, 5].map((pts) => (
                            <button
                              key={`je-${pts}`}
                              type="button"
                              onClick={() => setHandJuegoEnvite(pts)}
                              className={`w-6 h-6 rounded text-xs font-bold border cursor-pointer ${
                                handJuegoEnvite === pts ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                              }`}
                            >
                              +{pts}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Punto (No hubo juego) */
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200">¿Quién se llevó el Punto?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHandPuntoWinner(handPuntoWinner === 'p1' ? 'nadie' : 'p1')}
                      className={`px-3 py-1.5 rounded border text-xs font-bold cursor-pointer ${
                        handPuntoWinner === 'p1' ? 'bg-amber-400 text-amber-950 border-amber-300 shadow' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                      }`}
                    >
                      {game.pareja1.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHandPuntoWinner(handPuntoWinner === 'p2' ? 'nadie' : 'p2')}
                      className={`px-3 py-1.5 rounded border text-xs font-bold cursor-pointer ${
                        handPuntoWinner === 'p2' ? 'bg-amber-400 text-amber-950 border-amber-300 shadow' : 'bg-[#0a311c] text-amber-200 border-amber-900/50'
                      }`}
                    >
                      {game.pareja2.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHandPuntoWinner('nadie')}
                      className={`px-3 py-1.5 rounded border text-xs font-bold cursor-pointer ${
                        handPuntoWinner === 'nadie' ? 'bg-emerald-950 text-emerald-200 border-emerald-700' : 'bg-[#0a311c] text-emerald-400/70 border-amber-900/50'
                      }`}
                    >
                      Nadie / En pase
                    </button>
                  </div>
                </div>
                {handPuntoWinner !== 'nadie' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-emerald-200">Tantos cobrados por punto:</span>
                    {[1, 2, 3, 4, 5].map((pts) => (
                      <button
                        key={`pto-${pts}`}
                        type="button"
                        onClick={() => setHandPuntoPoints(pts)}
                        className={`w-7 h-7 rounded text-xs font-bold border cursor-pointer ${
                          handPuntoPoints === pts ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-[#0a311c] text-amber-100 border-amber-900/50'
                        }`}
                      >
                        +{pts}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Hand Execution Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleApplyHandAssistant}
              className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black font-deck text-base rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Cobrar Mano en Orden Oficial</span>
            </button>
          </div>
        </div>
      )}

      {/* History of Actions & Undo */}
      {game.historialTantos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Últimas Anotaciones ({game.historialTantos.length})
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearHistory}
                className="min-h-[34px] flex items-center gap-1 text-xs text-red-300 hover:text-red-100 bg-red-950/60 hover:bg-red-900/70 px-2.5 py-1 rounded-lg border border-red-900/40 cursor-pointer active:scale-95 transition-all"
                title="Limpiar todo el historial de anotaciones de este chico"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Limpiar historial</span>
              </button>
              <button
                type="button"
                onClick={handleUndo}
                className="min-h-[34px] flex items-center gap-1 text-xs text-amber-300/80 hover:text-amber-200 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-amber-900/30 cursor-pointer active:scale-95 transition-all"
                title="Deshacer último tanto"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer último tanto</span>
              </button>
            </div>
          </div>

          <div className="bg-[#072415] rounded-xl border border-amber-950 overflow-hidden divide-y divide-emerald-950/80 text-xs max-h-48 overflow-y-auto">
            {game.historialTantos.slice(0, 10).map((h) => {
              const teamName = h.equipoId === 'p1' ? game.pareja1.name : game.pareja2.name;
              return (
                <div key={h.id} className="p-2.5 flex items-center justify-between hover:bg-[#0a311c]/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300">{teamName}</span>
                    <span className="text-emerald-300/80">{h.motivo}</span>
                  </div>
                  <span className={`font-mono font-bold ${h.cantidad > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                    {h.cantidad > 0 ? `+${h.cantidad}` : h.cantidad}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0a2b1b] border-2 border-amber-600/60 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-200 font-deck text-base">
                  Ajustes de Partida de Mus
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-950/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Names */}
              <div className="space-y-2">
                <label className="text-emerald-200 font-semibold block">Nombres de las Parejas:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-emerald-300/70 block mb-1">Pareja 1:</span>
                    <input
                      type="text"
                      value={settingsNameP1}
                      onChange={(e) => setSettingsNameP1(e.target.value)}
                      className="w-full bg-[#061e11] border border-amber-900/50 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-300/70 block mb-1">Pareja 2:</span>
                    <input
                      type="text"
                      value={settingsNameP2}
                      onChange={(e) => setSettingsNameP2(e.target.value)}
                      className="w-full bg-[#061e11] border border-amber-900/50 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Tantos por chico */}
              <div>
                <label className="text-emerald-200 font-semibold block mb-1.5">Piedras / Tantos por Chico:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingsTantos(30)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      settingsTantos === 30
                        ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                        : 'bg-[#061e11] text-amber-100 border-amber-900/50'
                    }`}
                  >
                    30 piedras (6 amarracos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsTantos(40)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      settingsTantos === 40
                        ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                        : 'bg-[#061e11] text-amber-100 border-amber-900/50'
                    }`}
                  >
                    40 piedras (8 amarracos)
                  </button>
                </div>
              </div>

              {/* Chicos por vaca */}
              <div>
                <label className="text-emerald-200 font-semibold block mb-1.5">Chicos para ganar una Vaca:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingsChicosPorVaca(3)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      settingsChicosPorVaca === 3
                        ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                        : 'bg-[#061e11] text-amber-100 border-amber-900/50'
                    }`}
                  >
                    3 chicos (Estándar oficial)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsChicosPorVaca(2)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      settingsChicosPorVaca === 2
                        ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                        : 'bg-[#061e11] text-amber-100 border-amber-900/50'
                    }`}
                  >
                    2 chicos (Partida rápida)
                  </button>
                </div>
              </div>

              {/* Vacas objetivo */}
              <div>
                <label className="text-emerald-200 font-semibold block mb-1.5">Vacas para ganar la Partida:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((v) => (
                    <button
                      key={`vaca-obj-${v}`}
                      type="button"
                      onClick={() => setSettingsVacasObjetivo(v)}
                      className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        settingsVacasObjetivo === v
                          ? 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                          : 'bg-[#061e11] text-amber-100 border-amber-900/50'
                      }`}
                    >
                      {v} {v === 1 ? 'Vaca' : 'Vacas'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-900/40">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-3 py-2 text-emerald-300/80 hover:text-emerald-100 rounded-xl font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow transition-colors cursor-pointer"
              >
                Guardar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vaca Won In-App Modal (Replaces native window.alert) */}
      {vacaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#0a2b1b] border-2 border-amber-400 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-bold font-deck text-amber-300">
                ¡{vacaModal.teamName} gana la Vaca!
              </h3>
              <p className="text-sm text-emerald-200 mt-1">
                Marcador general de vacas:
              </p>
              <div className="mt-2 text-2xl font-black font-deck text-amber-400">
                {game.pareja1.name} {vacaModal.vP1} - {vacaModal.vP2} {game.pareja2.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVacaModal(null)}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow transition-colors cursor-pointer"
            >
              ¡Continuar al Siguiente Chico!
            </button>
          </div>
        </div>
      )}

      {/* Edit Team Modal for Mus */}
      {editingTeam && (
        <EditPlayerModal
          isOpen={true}
          playerName={editingTeam === 'p1' ? game.pareja1.name : game.pareja2.name}
          playerScore={editingTeam === 'p1' ? game.piedrasP1 : game.piedrasP2}
          scoreLabel="Piedras acumuladas en el chico"
          onSave={(newName, newScore) => {
            if (editingTeam === 'p1') {
              onChange({
                ...game,
                pareja1: { ...game.pareja1, name: newName },
                piedrasP1: newScore !== undefined ? Math.min(game.tantosPorJuego, Math.max(0, newScore)) : game.piedrasP1,
              });
            } else {
              onChange({
                ...game,
                pareja2: { ...game.pareja2, name: newName },
                piedrasP2: newScore !== undefined ? Math.min(game.tantosPorJuego, Math.max(0, newScore)) : game.piedrasP2,
              });
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
