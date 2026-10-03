import React, { useState, useEffect } from 'react';
import { MusGame, PlayerProfile } from '../types';
import {
  RotateCcw,
  RotateCw,
  Undo2,
  Flame,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Crown,
  History,
  Check,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { ConfirmModal } from './ConfirmModal';

interface MusScorerProps {
  game: MusGame;
  profiles?: PlayerProfile[];
  onChange: (game: MusGame) => void;
  onVictory: (winnerName: string, subtitle: string) => void;
  onOpenRules?: () => void;
}

type LanceType = 'grande' | 'chica' | 'pares' | 'juego';
type MusTab = 'marcador' | 'historial';

export const MusScorer: React.FC<MusScorerProps> = ({
  game,
  onChange,
  onVictory,
}) => {
  // Current active tab defaults to 'historial' so browsing between games stays in vertical mode
  const [activeTab, setActiveTab] = useState<MusTab>('historial');

  // Mobile horizontal rotation state (defaults to true on mobile devices in portrait as requested)
  const [isRotated, setIsRotated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cartasrc_mus_horizontal');
      if (saved !== null) return saved === 'true';
    } catch {}
    // Default to true so mobile scoreboard is horizontal by default
    return true;
  });

  const [dimensions, setDimensions] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 390,
    h: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));

  const [isLandscape, setIsLandscape] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false;
  });

  useEffect(() => {
    const handleOrientation = () => {
      setDimensions({
        w: window.innerWidth,
        h: window.innerHeight,
      });
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  const toggleRotate = () => {
    const next = !isRotated;
    setIsRotated(next);
    try {
      localStorage.setItem('cartasrc_mus_horizontal', String(next));
    } catch {}
    sounds.playCardFlick();
    haptics.light();
  };

  // Only apply CSS 90deg transform when in 'marcador' tab, isRotated is true, and phone is in portrait
  const shouldApplyCssRotation = activeTab === 'marcador' && isRotated && !isLandscape;

  // Temporary points pending for each lance in the current hand
  const [lancePots, setLancePots] = useState<Record<LanceType, number>>({
    grande: 0,
    chica: 0,
    pares: 0,
    juego: 0,
  });

  // Toggle for 4th lance: "Juego" vs "Punto"
  const [usePunto, setUsePunto] = useState(false);

  // Settings values
  const [settingsTantos, setSettingsTantos] = useState<number>(game.tantosPorJuego);
  const [settingsChicosPorVaca, setSettingsChicosPorVaca] = useState<number>(game.juegosPorVaca);
  const [settingsVacasObjetivo, setSettingsVacasObjetivo] = useState<number>(game.vacasObjetivo);
  const [nameP1, setNameP1] = useState(game.pareja1.name);
  const [nameP2, setNameP2] = useState(game.pareja2.name);

  // Inline team rename
  const [editingTeamName, setEditingTeamName] = useState<'p1' | 'p2' | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');

  // Confirm Reset modal
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Ordago Modal
  const [ordagoModalOpen, setOrdagoModalOpen] = useState(false);

  // Vaca Won announcement modal
  const [vacaNotice, setVacaNotice] = useState<{
    teamName: string;
    v1: number;
    v2: number;
  } | null>(null);

  // ----------------------------------------------------
  // Helper: Chico / Vaca Victory Checker
  // ----------------------------------------------------
  const handleScoreUpdate = (
    nextP1: number,
    nextP2: number,
    motivo: string,
    cantidad: number,
    equipoId: 'p1' | 'p2'
  ) => {
    const maxTantos = game.tantosPorJuego;
    const newHistory = [
      {
        id: String(Date.now() + Math.random()),
        equipoId,
        cantidad,
        motivo,
        timestamp: Date.now(),
      },
      ...game.historialTantos,
    ];

    // Check if team 1 won the Chico
    if (nextP1 >= maxTantos) {
      handleChicoWon('p1', newHistory);
      return;
    }

    // Check if team 2 won the Chico
    if (nextP2 >= maxTantos) {
      handleChicoWon('p2', newHistory);
      return;
    }

    // Normal point update
    onChange({
      ...game,
      piedrasP1: nextP1,
      piedrasP2: nextP2,
      historialTantos: newHistory,
    });
  };

  // When a team reaches the target points (30 or 40)
  const handleChicoWon = (
    teamId: 'p1' | 'p2',
    history: MusGame['historialTantos']
  ) => {
    sounds.playVictory();
    haptics.victory();

    const winnerName = teamId === 'p1' ? game.pareja1.name : game.pareja2.name;
    const newChicosP1 = teamId === 'p1' ? game.juegosGanadosP1 + 1 : game.juegosGanadosP1;
    const newChicosP2 = teamId === 'p2' ? game.juegosGanadosP2 + 1 : game.juegosGanadosP2;

    const chicoWonHistory = [
      {
        id: String(Date.now() + Math.random()),
        equipoId: teamId,
        cantidad: 0,
        motivo: `🏆 ¡Chico ganado por ${winnerName}!`,
        timestamp: Date.now(),
      },
      ...history,
    ];

    // Check if this Chico wins the Vaca
    const chicosTarget = game.juegosPorVaca;
    if (newChicosP1 >= chicosTarget) {
      handleVacaWon('p1', newChicosP1, newChicosP2, chicoWonHistory);
      return;
    }
    if (newChicosP2 >= chicosTarget) {
      handleVacaWon('p2', newChicosP1, newChicosP2, chicoWonHistory);
      return;
    }

    // Reset stones for the next Chico
    onChange({
      ...game,
      piedrasP1: 0,
      piedrasP2: 0,
      juegosGanadosP1: newChicosP1,
      juegosGanadosP2: newChicosP2,
      historialTantos: chicoWonHistory,
      manoIndex: (game.manoIndex + 1) % 2,
    });
  };

  // When a team wins the required Chicos for a Vaca
  const handleVacaWon = (
    teamId: 'p1' | 'p2',
    c1: number,
    c2: number,
    history?: MusGame['historialTantos']
  ) => {
    sounds.playVictory();
    haptics.victory();

    const winnerName = teamId === 'p1' ? game.pareja1.name : game.pareja2.name;
    const newVacasP1 = teamId === 'p1' ? game.vacasGanadasP1 + 1 : game.vacasGanadasP1;
    const newVacasP2 = teamId === 'p2' ? game.vacasGanadasP2 + 1 : game.vacasGanadasP2;

    const currentHistory = history || game.historialTantos;
    const vacaHistory = [
      {
        id: String(Date.now() + Math.random()),
        equipoId: teamId,
        cantidad: 0,
        motivo: `👑 ¡VACA GANADA POR ${winnerName.toUpperCase()}!`,
        timestamp: Date.now(),
      },
      ...currentHistory,
    ];

    // Check if entire match is won
    if (newVacasP1 >= game.vacasObjetivo) {
      onChange({
        ...game,
        piedrasP1: 0,
        piedrasP2: 0,
        juegosGanadosP1: c1,
        juegosGanadosP2: c2,
        vacasGanadasP1: newVacasP1,
        vacasGanadasP2: newVacasP2,
        winner: game.pareja1.name,
        historialTantos: vacaHistory,
      });
      onVictory(
        game.pareja1.name,
        `¡Campeones de Mus! Han ganado ${newVacasP1} vacas a ${newVacasP2}.`
      );
      return;
    }

    if (newVacasP2 >= game.vacasObjetivo) {
      onChange({
        ...game,
        piedrasP1: 0,
        piedrasP2: 0,
        juegosGanadosP1: c1,
        juegosGanadosP2: c2,
        vacasGanadasP1: newVacasP1,
        vacasGanadasP2: newVacasP2,
        winner: game.pareja2.name,
        historialTantos: vacaHistory,
      });
      onVictory(
        game.pareja2.name,
        `¡Campeones de Mus! Han ganado ${newVacasP2} vacas a ${newVacasP1}.`
      );
      return;
    }

    // Reset Chicos and stones for next Vaca
    setVacaNotice({
      teamName: winnerName,
      v1: newVacasP1,
      v2: newVacasP2,
    });

    onChange({
      ...game,
      piedrasP1: 0,
      piedrasP2: 0,
      juegosGanadosP1: 0,
      juegosGanadosP2: 0,
      vacasGanadasP1: newVacasP1,
      vacasGanadasP2: newVacasP2,
      historialTantos: vacaHistory,
      manoIndex: (game.manoIndex + 1) % 2,
    });
  };

  // ----------------------------------------------------
  // Lance Pot Adjustments
  // ----------------------------------------------------
  const handleAddLancePot = (lanceId: LanceType, delta: number) => {
    sounds.playTap();
    haptics.light();
    setLancePots((prev) => ({
      ...prev,
      [lanceId]: Math.max(0, prev[lanceId] + delta),
    }));
  };

  const handleClearLancePot = (lanceId: LanceType) => {
    sounds.playCardFlick();
    haptics.undo();
    setLancePots((prev) => ({
      ...prev,
      [lanceId]: 0,
    }));
  };

  // Award the lance to a team (using arrow ◀ or ▶)
  const handleAwardLance = (lanceId: LanceType, teamId: 'p1' | 'p2') => {
    sounds.playPointChime();
    haptics.point();
    const currentPot = lancePots[lanceId];
    // If pot is 0, in Mus if no one bid, it's 1 point (tanto del paso)
    const pointsToAward = currentPot > 0 ? currentPot : 1;
    const lanceLabel =
      lanceId === 'juego'
        ? usePunto
          ? 'Punto'
          : 'Juego'
        : lanceId.charAt(0).toUpperCase() + lanceId.slice(1);

    const nextP1 = teamId === 'p1' ? game.piedrasP1 + pointsToAward : game.piedrasP1;
    const nextP2 = teamId === 'p2' ? game.piedrasP2 + pointsToAward : game.piedrasP2;

    // Reset this pot
    setLancePots((prev) => ({ ...prev, [lanceId]: 0 }));

    handleScoreUpdate(
      nextP1,
      nextP2,
      `${lanceLabel} (+${pointsToAward})`,
      pointsToAward,
      teamId
    );
  };

  // ----------------------------------------------------
  // Direct Team Points Adjustments (-1, +1, +5)
  // ----------------------------------------------------
  const handleTeamPoints = (teamId: 'p1' | 'p2', delta: number) => {
    if (delta > 0) {
      sounds.playPointChime();
      haptics.point();
    } else {
      sounds.playCardFlick();
      haptics.undo();
    }

    const current = teamId === 'p1' ? game.piedrasP1 : game.piedrasP2;
    const next = Math.max(0, current + delta);
    if (next === current) return;

    const nextP1 = teamId === 'p1' ? next : game.piedrasP1;
    const nextP2 = teamId === 'p2' ? next : game.piedrasP2;

    const motivo = delta > 0 ? `Anotación manual (+${delta})` : `Corrección (${delta})`;
    handleScoreUpdate(nextP1, nextP2, motivo, delta, teamId);
  };

  // ----------------------------------------------------
  // Bottom Stepper: [-] [ 0 ] [+] (Chicos won manual correction)
  // ----------------------------------------------------
  const handleChicosStep = (teamId: 'p1' | 'p2', delta: number) => {
    sounds.playCardFlick();
    haptics.light();
    if (teamId === 'p1') {
      const next = Math.max(0, game.juegosGanadosP1 + delta);
      if (next >= game.juegosPorVaca && delta > 0) {
        handleVacaWon('p1', next, game.juegosGanadosP2);
      } else {
        onChange({ ...game, juegosGanadosP1: next });
      }
    } else {
      const next = Math.max(0, game.juegosGanadosP2 + delta);
      if (next >= game.juegosPorVaca && delta > 0) {
        handleVacaWon('p2', game.juegosGanadosP1, next);
      } else {
        onChange({ ...game, juegosGanadosP2: next });
      }
    }
  };

  // ----------------------------------------------------
  // Undo Last Action
  // ----------------------------------------------------
  const handleUndo = () => {
    if (game.historialTantos.length === 0) return;
    sounds.playCardFlick();
    haptics.undo();
    const last = game.historialTantos[0];
    const newHist = game.historialTantos.slice(1);

    if (last.equipoId === 'p1') {
      onChange({
        ...game,
        piedrasP1: Math.max(0, game.piedrasP1 - last.cantidad),
        historialTantos: newHist,
      });
    } else {
      onChange({
        ...game,
        piedrasP2: Math.max(0, game.piedrasP2 - last.cantidad),
        historialTantos: newHist,
      });
    }
  };

  // ----------------------------------------------------
  // Execute Órdago
  // ----------------------------------------------------
  const handleExecuteOrdago = (winnerTeam: 'p1' | 'p2') => {
    sounds.playVictory();
    haptics.victory();
    setOrdagoModalOpen(false);

    const winnerName = winnerTeam === 'p1' ? game.pareja1.name : game.pareja2.name;
    const historyWithOrdago = [
      {
        id: String(Date.now() + Math.random()),
        equipoId: winnerTeam,
        cantidad: game.tantosPorJuego,
        motivo: `🔥 ¡Órdago ganado por ${winnerName}!`,
        timestamp: Date.now(),
      },
      ...game.historialTantos,
    ];

    handleChicoWon(winnerTeam, historyWithOrdago);
  };

  // ----------------------------------------------------
  // Full Reset
  // ----------------------------------------------------
  const handleFullReset = () => {
    sounds.playTap();
    haptics.light();
    onChange({
      ...game,
      piedrasP1: 0,
      piedrasP2: 0,
      juegosGanadosP1: 0,
      juegosGanadosP2: 0,
      vacasGanadasP1: 0,
      vacasGanadasP2: 0,
      winner: null,
      historialTantos: [],
    });
    setLancePots({ grande: 0, chica: 0, pares: 0, juego: 0 });
    setConfirmResetOpen(false);
  };

  const lanceRows: { id: LanceType; label: string }[] = [
    { id: 'grande', label: 'Grande' },
    { id: 'chica', label: 'Chica' },
    { id: 'pares', label: 'Pares' },
    { id: 'juego', label: usePunto ? 'Punto' : 'Juego' },
  ];

  return (
    <div
      className={
        shouldApplyCssRotation
          ? 'fixed inset-0 z-50 bg-[#121417] flex items-center justify-center overflow-hidden select-none p-0'
          : 'w-full max-w-5xl mx-auto px-0.5 sm:px-4 py-1 sm:py-4 space-y-2 sm:space-y-4 select-none'
      }
    >
      <div
        style={
          shouldApplyCssRotation
            ? {
                width: `${dimensions.h}px`,
                height: `${dimensions.w}px`,
                maxWidth: `${dimensions.h}px`,
                maxHeight: `${dimensions.w}px`,
              }
            : undefined
        }
        className={
          shouldApplyCssRotation
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 z-50 overflow-hidden bg-[#121417] text-white flex flex-col justify-between p-2 select-none shadow-2xl'
            : 'w-full flex flex-col space-y-2 sm:space-y-4'
        }
      >
        {/* ======================================================== */}
        {/* TOP TAB SWITCHER: [ 🃏 MARCADOR ] vs [ 📜 REGLAS E HISTORIAL ] */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-1 px-1.5 py-1.5 bg-zinc-900/95 rounded-2xl border border-zinc-800 shadow-md">
          {/* Main 2 Tabs: Reglas e Historial FIRST, Marcador SECOND */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('historial');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'historial'
                  ? 'bg-amber-400 text-amber-950 shadow-md ring-1 ring-amber-300'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <span>📜 Reglas e Historial</span>
              {game.historialTantos.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-amber-300 rounded-full font-bold">
                  {game.historialTantos.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setActiveTab('marcador');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'marcador'
                  ? 'bg-amber-400 text-amber-950 shadow-md ring-1 ring-amber-300'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <span>🃏 Marcador</span>
            </button>
          </div>

          {/* Quick Utility Chips */}
          <div className="flex items-center gap-1">
            {/* Mano indicator toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                haptics.light();
                onChange({ ...game, manoIndex: (game.manoIndex + 1) % 2 });
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-amber-300 font-semibold border border-amber-500/30 text-xs transition-colors cursor-pointer"
              title="Toca para cambiar la Mano"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden xs:inline">Mano:</span>
              <span className="truncate max-w-[65px] font-bold">
                {game.manoIndex === 0 ? game.pareja1.name : game.pareja2.name}
              </span>
            </button>

            {/* Órdago */}
            <button
              type="button"
              onClick={() => setOrdagoModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-red-600/95 hover:bg-red-500 text-white font-bold transition-all active:scale-95 cursor-pointer shadow-md text-xs"
              title="Lanzar un Órdago"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
              <span className="hidden sm:inline">Órdago</span>
            </button>

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={game.historialTantos.length === 0}
              className={`p-1.5 px-2 rounded-xl border transition-all flex items-center gap-1 text-xs cursor-pointer ${
                game.historialTantos.length > 0
                  ? 'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-600 text-zinc-200 active:scale-95'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              title="Deshacer último tanto"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            {/* Rotate Horizontal / Vertical toggle */}
            {!isLandscape && activeTab === 'marcador' && (
              <button
                type="button"
                onClick={toggleRotate}
                className={`p-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isRotated
                    ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                    : 'bg-zinc-800/80 text-amber-300 border-amber-500/30 hover:bg-zinc-700'
                }`}
                title={isRotated ? 'Girar a vertical' : 'Girar a horizontal'}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{isRotated ? 'Horizontal' : 'Vertical'}</span>
              </button>
            )}

            {/* Reset button */}
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="p-1.5 px-2 rounded-xl border border-zinc-700/60 bg-zinc-800/80 hover:bg-red-950/40 text-zinc-300 hover:text-red-300 text-xs transition-colors cursor-pointer"
              title="Reiniciar partida"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PESTAÑA 1: MARCADOR SOLO EN HORIZONTAL                  */}
        {/* ======================================================== */}
        {activeTab === 'marcador' && (
          <div className="w-full flex-1 flex flex-col justify-center space-y-1.5 sm:space-y-2">
            {/* Main 3-Column Scoreboard Card */}
            <div className="w-full flex-1 bg-[#16171a]/95 rounded-2xl sm:rounded-3xl border border-zinc-800/90 shadow-2xl p-2 sm:p-5 md:p-6 backdrop-blur-md flex flex-col justify-center">
              <div className="w-full grid grid-cols-12 gap-1 sm:gap-3 items-center">
                {/* ==================== LEFT COLUMN: EQUIPO 1 ==================== */}
                <div className="col-span-3 sm:col-span-3 md:col-span-4 flex flex-col items-center justify-center space-y-1 sm:space-y-3">
                  {/* Team 1 Title */}
                  <div className="relative group text-center w-full flex flex-col items-center">
                    {editingTeamName === 'p1' ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (teamNameInput.trim()) {
                            onChange({
                              ...game,
                              pareja1: { ...game.pareja1, name: teamNameInput.trim() },
                            });
                          }
                          setEditingTeamName(null);
                        }}
                        className="flex items-center justify-center gap-1 w-full"
                      >
                        <input
                          type="text"
                          value={teamNameInput}
                          onChange={(e) => setTeamNameInput(e.target.value)}
                          autoFocus
                          className="bg-zinc-800 text-white font-bold text-center px-1 py-0.5 rounded border border-sky-400 text-xs sm:text-base max-w-[85px] sm:max-w-[140px] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="text-[10px] sm:text-xs bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          OK
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeamName('p1');
                          setTeamNameInput(game.pareja1.name);
                        }}
                        className="text-xs sm:text-base md:text-xl font-black text-zinc-100 hover:text-sky-300 transition-colors flex items-center justify-center gap-1 cursor-pointer truncate max-w-full"
                        title="Toca para cambiar nombre"
                      >
                        <span className="truncate">{game.pareja1.name}</span>
                        {game.manoIndex === 0 && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0 ring-2 ring-amber-400/30"
                            title="Es Mano"
                          />
                        )}
                      </button>
                    )}

                    {/* Vacas indicator */}
                    <div className="text-[10px] sm:text-xs font-semibold text-amber-400/90 flex items-center gap-0.5 mt-0.5">
                      <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>
                        {game.vacasGanadasP1} / {game.vacasObjetivo} {game.vacasObjetivo === 1 ? 'vaca' : 'vacas'}
                      </span>
                    </div>
                  </div>

                  {/* Big Score Number */}
                  <div className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tight tabular-nums select-none drop-shadow-md leading-none py-0.5">
                    {game.piedrasP1}
                  </div>

                  {/* Action Buttons: [-1] [+1] [+5] */}
                  <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleTeamPoints('p1', -1)}
                      className="w-8 sm:w-11 h-7 sm:h-10 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs sm:text-base rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
                      title="Restar 1 piedra"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTeamPoints('p1', 1)}
                      className="w-8 sm:w-11 h-7 sm:h-10 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black text-xs sm:text-base rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
                      title="Sumar 1 piedra"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTeamPoints('p1', 5)}
                      className="w-8 sm:w-11 h-7 sm:h-10 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black text-xs sm:text-base rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
                      title="Sumar 1 amarraco (+5 piedras)"
                    >
                      +5
                    </button>
                  </div>

                  {/* Bottom Stepper: [-] [ 0 ] [+] (Chicos won) */}
                  <div className="flex flex-col items-center pt-0.5">
                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Chicos
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleChicosStep('p1', -1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                        title="Restar Chico manualmente"
                      >
                        <Minus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      </button>
                      <div
                        className="min-w-[28px] sm:min-w-[36px] px-1.5 py-0.5 sm:py-1 bg-white text-zinc-950 font-black text-xs sm:text-base rounded-md sm:rounded-lg shadow text-center select-none"
                        title={`Chicos ganados por ${game.pareja1.name}`}
                      >
                        {game.juegosGanadosP1}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChicosStep('p1', 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                        title="Sumar Chico manualmente"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ==================== CENTER COLUMN: 4 LANCES ==================== */}
                <div className="col-span-6 sm:col-span-6 md:col-span-4 flex flex-col items-center justify-center py-0.5 sm:py-2 md:py-0 border-x border-zinc-800/90 space-y-1.5 sm:space-y-3">
                  {lanceRows.map((lance) => {
                    const pot = lancePots[lance.id];
                    const isLastRow = lance.id === 'juego';

                    return (
                      <div
                        key={lance.id}
                        className="flex items-center justify-center gap-1 sm:gap-2 w-full max-w-[280px]"
                      >
                        {/* ◀ Left Arrow (awards to Team 1) */}
                        <button
                          type="button"
                          onClick={() => handleAwardLance(lance.id, 'p1')}
                          className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center text-white hover:text-sky-400 active:scale-75 transition-transform cursor-pointer shrink-0"
                          title={`Asignar ${lance.label} (${pot > 0 ? pot : 1} tanto${pot > 1 ? 's' : ''}) a ${game.pareja1.name}`}
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                        </button>

                        {/* [+1] Button */}
                        <button
                          type="button"
                          onClick={() => handleAddLancePot(lance.id, 1)}
                          className="w-7 sm:w-10 h-7 sm:h-9 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black text-[11px] sm:text-xs rounded-md sm:rounded-xl transition-all cursor-pointer shadow flex items-center justify-center shrink-0"
                          title={`Añadir +1 punto a ${lance.label}`}
                        >
                          +1
                        </button>

                        {/* Center Badge: Name and Points */}
                        <div className="relative group shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (isLastRow) {
                                setUsePunto(!usePunto);
                                sounds.playTap();
                              } else if (pot > 0) {
                                handleClearLancePot(lance.id);
                              }
                            }}
                            className={`min-w-[56px] sm:min-w-[76px] py-0.5 sm:py-1 px-1 bg-white text-zinc-950 rounded-md sm:rounded-lg shadow text-center cursor-pointer transition-transform active:scale-95 flex flex-col items-center justify-center ${
                              pot > 0 ? 'ring-2 ring-sky-400 shadow-sky-500/20' : ''
                            }`}
                            title={
                              isLastRow
                                ? 'Toca para alternar entre Juego y Punto'
                                : pot > 0
                                ? 'Toca para reiniciar el bote a 0'
                                : `${lance.label}`
                            }
                          >
                            <span className="text-[10px] sm:text-xs font-bold leading-tight select-none">
                              {lance.label}
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-black leading-tight tabular-nums select-none ${
                                pot > 0 ? 'text-sky-600' : 'text-zinc-900'
                              }`}
                            >
                              {pot}
                            </span>
                          </button>
                        </div>

                        {/* [+5] Button */}
                        <button
                          type="button"
                          onClick={() => handleAddLancePot(lance.id, 5)}
                          className="w-7 sm:w-10 h-7 sm:h-9 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black text-[11px] sm:text-xs rounded-md sm:rounded-xl transition-all cursor-pointer shadow flex items-center justify-center shrink-0"
                          title={`Añadir +5 puntos a ${lance.label}`}
                        >
                          +5
                        </button>

                        {/* ▶ Right Arrow (awards to Team 2) */}
                        <button
                          type="button"
                          onClick={() => handleAwardLance(lance.id, 'p2')}
                          className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center text-white hover:text-sky-400 active:scale-75 transition-transform cursor-pointer shrink-0"
                          title={`Asignar ${lance.label} (${pot > 0 ? pot : 1} tanto${pot > 1 ? 's' : ''}) a ${game.pareja2.name}`}
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* ==================== RIGHT COLUMN: EQUIPO 2 ==================== */}
                <div className="col-span-3 sm:col-span-3 md:col-span-4 flex flex-col items-center justify-center space-y-1 sm:space-y-3">
                  {/* Team 2 Title */}
                  <div className="relative group text-center w-full flex flex-col items-center">
                    {editingTeamName === 'p2' ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (teamNameInput.trim()) {
                            onChange({
                              ...game,
                              pareja2: { ...game.pareja2, name: teamNameInput.trim() },
                            });
                          }
                          setEditingTeamName(null);
                        }}
                        className="flex items-center justify-center gap-1 w-full"
                      >
                        <input
                          type="text"
                          value={teamNameInput}
                          onChange={(e) => setTeamNameInput(e.target.value)}
                          autoFocus
                          className="bg-zinc-800 text-white font-bold text-center px-1 py-0.5 rounded border border-sky-400 text-xs sm:text-base max-w-[85px] sm:max-w-[140px] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="text-[10px] sm:text-xs bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          OK
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeamName('p2');
                          setTeamNameInput(game.pareja2.name);
                        }}
                        className="text-xs sm:text-base md:text-xl font-black text-zinc-100 hover:text-sky-300 transition-colors flex items-center justify-center gap-1 cursor-pointer truncate max-w-full"
                        title="Toca para cambiar nombre"
                      >
                        <span className="truncate">{game.pareja2.name}</span>
                        {game.manoIndex === 1 && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0 ring-2 ring-amber-400/30"
                            title="Es Mano"
                          />
                        )}
                      </button>
                    )}

                    {/* Vacas indicator */}
                    <div className="text-[10px] sm:text-xs font-semibold text-amber-400/90 flex items-center gap-0.5 mt-0.5">
                      <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>
                        {game.vacasGanadasP2} / {game.vacasObjetivo} {game.vacasObjetivo === 1 ? 'vaca' : 'vacas'}
                      </span>
                    </div>
                  </div>

                  {/* Big Score Number */}
                  <div className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tight tabular-nums select-none drop-shadow-md leading-none py-0.5">
                    {game.piedrasP2}
                  </div>

                  {/* Action Buttons: [-1] [+1] [+5] */}
                  <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => handleTeamPoints('p2', -1)}
                      className="w-8 sm:w-11 h-7 sm:h-10 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs sm:text-base rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
                      title="Restar 1 piedra"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTeamPoints('p2', 1)}
                      className="w-8 sm:w-11 h-7 sm:h-10 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black text-xs sm:text-base rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
                      title="Sumar 1 piedra"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTeamPoints('p2', 5)}
                      className="w-8 sm:w-11 h-7 sm:h-10 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black text-xs sm:text-base rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center"
                      title="Sumar 1 amarraco (+5 piedras)"
                    >
                      +5
                    </button>
                  </div>

                  {/* Bottom Stepper: [-] [ 0 ] [+] (Chicos won) */}
                  <div className="flex flex-col items-center pt-0.5">
                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                      Chicos
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleChicosStep('p2', -1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                        title="Restar Chico manualmente"
                      >
                        <Minus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      </button>
                      <div
                        className="min-w-[28px] sm:min-w-[36px] px-1.5 py-0.5 sm:py-1 bg-white text-zinc-950 font-black text-xs sm:text-base rounded-md sm:rounded-lg shadow text-center select-none"
                        title={`Chicos ganados por ${game.pareja2.name}`}
                      >
                        {game.juegosGanadosP2}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChicosStep('p2', 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                        title="Sumar Chico manualmente"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Footer Info Bar */}
            <div className="flex items-center justify-between px-2 py-1 bg-zinc-900/60 rounded-xl border border-zinc-800/60 text-[11px] text-zinc-400">
              <span className="truncate">
                Chico a <strong className="text-zinc-200">{game.tantosPorJuego} piedras</strong> • Vaca a{' '}
                <strong className="text-zinc-200">{game.juegosPorVaca} chicos</strong>
              </span>
              <span className="hidden sm:inline text-zinc-500">
                Usa ◀ y ▶ para asignar el tanteo de cada lance
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: REGLAS, HISTORIAL Y AJUSTES (EN VERTICAL)    */}
        {/* ======================================================== */}
        {activeTab === 'historial' && (
          <div className="w-full space-y-4 max-h-[85vh] overflow-y-auto pr-0.5">
            {/* Primary Action Button to Open Horizontal Scoreboard */}
            <button
              type="button"
              onClick={() => {
                sounds.playCardFlick();
                setActiveTab('marcador');
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 active:scale-[0.99] text-amber-950 font-black rounded-2xl text-sm sm:text-base flex items-center justify-between shadow-xl cursor-pointer transition-all border border-amber-300"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-950/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-950" />
                </div>
                <div className="text-left">
                  <div className="leading-tight font-black">Abrir Marcador de Partida</div>
                  <div className="text-[11px] font-semibold text-amber-900/80">Pantalla horizontal para colocar el móvil en la mesa</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-950/15 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold">
                <span>Entrar</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </div>
            </button>

            {/* 1. EXPLICACIÓN DIDÁCTICA: ¿Para qué sirve el contador inferior de Chicos [-] [ 0 ] [+]? */}
            <div className="bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-3.5 sm:p-5 space-y-2 text-zinc-200 shadow-lg">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>¿Para qué sirve el contador inferior de Chicos [-] [ 0 ] [+]?</span>
              </div>
              <div className="text-xs sm:text-sm text-zinc-300 space-y-2 leading-relaxed">
                <p>
                  En el Mus tradicional, una partida completa se estructura en tres niveles:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-300">
                  <li>
                    <strong className="text-white">Piedras o Tantos (0 a {game.tantosPorJuego}):</strong> Es el marcador grande. Se suman con los lances y amarracos.
                  </li>
                  <li>
                    <strong className="text-amber-300">Chicos (contador inferior [-] [ 0 ] [+]):</strong> Cada vez que una pareja alcanza los {game.tantosPorJuego} tantos, gana <strong>1 Chico</strong> y las piedras se reinician automáticamente a 0 para el siguiente.
                  </li>
                  <li>
                    <strong className="text-amber-400">Vacas:</strong> La pareja que consiga {game.juegosPorVaca} chicos gana <strong>1 Vaca</strong>.
                  </li>
                </ul>
                <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-amber-500/30 text-xs text-amber-200/90 mt-2">
                  💡 <strong>¿Por qué tiene botones [-] y [+]?</strong> Aunque la app suma los chicos automáticamente al llegar a {game.tantosPorJuego} piedras, estos botones te permiten <strong>corregir una jugada o empezar a anotar una partida que ya iba a medias</strong> en la taberna sin tener que pasar por todas las piedras.
                </div>
              </div>
            </div>

            {/* 2. History of points */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  <span>Historial de Tantos ({game.historialTantos.length})</span>
                </h4>
                {game.historialTantos.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Deshacer último</span>
                  </button>
                )}
              </div>

              {game.historialTantos.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 text-center italic">
                  Aún no se han anotado tantos en esta partida. Anota un lance con ◀ o ▶ en el Marcador.
                </p>
              ) : (
                <div className="divide-y divide-zinc-800 max-h-56 overflow-y-auto text-xs">
                  {game.historialTantos.map((h) => {
                    const isP1 = h.equipoId === 'p1';
                    const teamName = isP1 ? game.pareja1.name : game.pareja2.name;

                    return (
                      <div key={h.id} className="py-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isP1 ? 'bg-sky-400' : 'bg-red-400'
                            }`}
                          />
                          <span className="font-semibold text-zinc-200">{teamName}</span>
                          <span className="text-zinc-400">• {h.motivo}</span>
                        </div>
                        {h.cantidad > 0 && (
                          <span className="font-mono font-bold text-sky-400 shrink-0">
                            +{h.cantidad}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Official Mus Rules summary */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 space-y-3 text-xs text-zinc-300">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Reglamento y Lances del Mus</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 bg-zinc-800/60 rounded-xl space-y-1">
                  <strong className="text-white block text-sm">1. Grande</strong>
                  <p>Gana quien tiene las cartas de mayor valor. En el mus tradicional con 8 reyes: Rey (o 3) &gt; Caballo &gt; Sota &gt; 7...</p>
                  <p className="text-[11px] text-amber-300/80">Si nadie envida: 1 tanto al cobro (tanto de paso).</p>
                </div>

                <div className="p-2.5 bg-zinc-800/60 rounded-xl space-y-1">
                  <strong className="text-white block text-sm">2. Chica</strong>
                  <p>Gana quien tiene las cartas de menor valor. As (o 2) &gt; 4 &gt; 5 &gt; 6...</p>
                  <p className="text-[11px] text-amber-300/80">Si nadie envida: 1 tanto al cobro (tanto de paso).</p>
                </div>

                <div className="p-2.5 bg-zinc-800/60 rounded-xl space-y-1">
                  <strong className="text-white block text-sm">3. Pares</strong>
                  <p>Requiere tener al menos 2 cartas del mismo valor para hablar:</p>
                  <ul className="text-[11px] space-y-0.5 text-zinc-300">
                    <li>• <strong>Duples:</strong> 2 parejas o póker (3 tantos).</li>
                    <li>• <strong>Medias:</strong> trío de cartas (2 tantos).</li>
                    <li>• <strong>Par simple:</strong> 1 pareja (1 tanto).</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-zinc-800/60 rounded-xl space-y-1">
                  <strong className="text-white block text-sm">4. Juego o Punto</strong>
                  <p>
                    <strong>Juego:</strong> sumar 31 o más con las 4 cartas. La mejor jugada es 31 (3 tantos), seguida de 32 (2 tantos), 40, 37, 36...
                  </p>
                  <p>
                    <strong>Punto:</strong> si nadie llega a 31, gana quien más se acerque a 30 (la mejor es 30, luego 29...) y vale 1 tanto.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-red-950/40 border border-red-800/40 rounded-xl text-zinc-300 space-y-1">
                <strong className="text-red-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> El Órdago
                </strong>
                <p className="text-xs">
                  Se apuesta todo el Chico entero en una sola jugada. Si se acepta el órdago, se bajan las cartas inmediatamente para comprobar el lance.
                </p>
              </div>
            </div>

            {/* 4. Match Settings */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 space-y-3.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-sky-400" />
                  <span>Ajustes de la Partida de Mus</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar Partida</span>
                </button>
              </div>

              {/* Names */}
              <div>
                <label className="font-semibold text-white block mb-1">Nombres de las Parejas</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={nameP1}
                    onChange={(e) => setNameP1(e.target.value)}
                    placeholder="Equipo 1"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-400 text-xs"
                  />
                  <input
                    type="text"
                    value={nameP2}
                    onChange={(e) => setNameP2(e.target.value)}
                    placeholder="Equipo 2"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-400 text-xs"
                  />
                </div>
              </div>

              {/* Tantos por chico */}
              <div>
                <label className="font-semibold text-white block mb-1">Piedras por Chico</label>
                <div className="flex gap-2">
                  {[30, 40].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSettingsTantos(t)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold cursor-pointer transition-all ${
                        settingsTantos === t
                          ? 'bg-sky-500 border-sky-400 text-white shadow'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {t} piedras {t === 40 ? '(8 amarracos)' : '(6 amarracos)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chicos por vaca */}
              <div>
                <label className="font-semibold text-white block mb-1">Chicos para ganar una Vaca</label>
                <div className="flex gap-2">
                  {[2, 3].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSettingsChicosPorVaca(c)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold cursor-pointer transition-all ${
                        settingsChicosPorVaca === c
                          ? 'bg-sky-500 border-sky-400 text-white shadow'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {c} chicos ({c === 3 ? 'Al mejor de 5' : 'Al mejor de 3'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Vacas objetivo */}
              <div>
                <label className="font-semibold text-white block mb-1">Vacas para ganar la partida</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSettingsVacasObjetivo(v)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold cursor-pointer transition-all ${
                        settingsVacasObjetivo === v
                          ? 'bg-sky-500 border-sky-400 text-white shadow'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {v} {v === 1 ? 'vaca' : 'vacas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPointChime();
                    haptics.point();
                    onChange({
                      ...game,
                      tantosPorJuego: settingsTantos,
                      juegosPorVaca: settingsChicosPorVaca,
                      vacasObjetivo: settingsVacasObjetivo,
                      pareja1: { ...game.pareja1, name: nameP1.trim() || 'Equipo 1' },
                      pareja2: { ...game.pareja2, name: nameP2.trim() || 'Equipo 2' },
                    });
                    setActiveTab('marcador');
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar y volver al Marcador</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODALS: ÓRDAGO, VACA WON, RESET CONFIRM                  */}
      {/* ======================================================== */}

      {/* Órdago Modal */}
      {ordagoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-zinc-900 border-2 border-red-500 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-red-400 animate-pulse">
              <Flame className="w-8 h-8 fill-red-500" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-wide">¡ÓRDAGO!</h3>
            <p className="text-xs text-zinc-300">
              Se juega el Chico entero en este lance. ¿Quién ha ganado el Órdago?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleExecuteOrdago('p1')}
                className="py-3 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer active:scale-95 shadow-lg"
              >
                {game.pareja1.name}
              </button>
              <button
                type="button"
                onClick={() => handleExecuteOrdago('p2')}
                className="py-3 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer active:scale-95 shadow-lg"
              >
                {game.pareja2.name}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOrdagoModalOpen(false)}
              className="text-xs text-zinc-400 hover:text-white pt-2 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Vaca Won Modal */}
      {vacaNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-sm bg-zinc-900 border-2 border-amber-500 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 animate-bounce">
              <Crown className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-amber-200">¡VACA GANADA!</h3>
            <p className="text-sm font-bold text-white">
              {vacaNotice.teamName} se anota la Vaca.
            </p>
            <p className="text-xs text-zinc-300">
              Marcador de vacas:{' '}
              <strong className="text-amber-300">
                {game.pareja1.name} {vacaNotice.v1} - {vacaNotice.v2} {game.pareja2.name}
              </strong>
            </p>
            <button
              type="button"
              onClick={() => setVacaNotice(null)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg"
            >
              Comenzar siguiente Vaca
            </button>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="¿Reiniciar partida de Mus?"
        message="Se pondrán a cero las piedras, chicos y vacas de ambos equipos."
        confirmText="Reiniciar todo"
        onConfirm={handleFullReset}
        onClose={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
