/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameType, EscobaGame, MusGame, ChinchonGame, TuteGame, LibreGame, PlayerProfile, AvatarSuit } from './types';
import {
  loadGame,
  saveGame,
  defaultEscobaGame,
  defaultMusGame,
  defaultChinchonGame,
  defaultTuteGame,
  defaultLibreGame,
  defaultProfiles,
} from './utils/storage';
import { sounds } from './utils/sound';
import { Navbar } from './components/Navbar';
import { TableBanner } from './components/TableBanner';
import { EscobaScorer } from './components/EscobaScorer';
import { MusScorer } from './components/MusScorer';
import { ChinchonScorer } from './components/ChinchonScorer';
import { TuteScorer } from './components/TuteScorer';
import { LibreScorer } from './components/LibreScorer';
import { ProfilesView } from './components/ProfilesView';
import { RulesModal } from './components/RulesModal';
import { MoreGamesModal } from './components/MoreGamesModal';
import { VictoryModal } from './components/VictoryModal';
import { SorteoModal } from './components/SorteoModal';
import { TurnTimerModal } from './components/TurnTimerModal';
import { FloatingTimerWidget } from './components/FloatingTimerWidget';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OrosIcon, CopasIcon, EspadasIcon, BastosIcon } from './components/SpanishDeckIcons';

export default function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('escoba');
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rulesTab, setRulesTab] = useState<GameType>('escoba');
  const [moreGamesOpen, setMoreGamesOpen] = useState(false);
  const [sorteoOpen, setSorteoOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  // Turn Timer & Wake Lock State
  const [timerDuration, setTimerDuration] = useState(60);
  const [timerTimeLeft, setTimerTimeLeft] = useState(60);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockSentinelRef = useState<{ release?: () => Promise<void> } | null>(null);

  // Timer Tick Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerIsRunning && timerTimeLeft > 0) {
      interval = setInterval(() => {
        setTimerTimeLeft((prev) => {
          if (prev <= 1) {
            sounds.playTimerEnd();
            return 0;
          }
          if (prev <= 6 && prev > 1) {
            sounds.playTimerTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerTimeLeft === 0 && timerIsRunning) {
      setTimerIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, timerTimeLeft]);

  // Screen Wake Lock Toggle
  const handleToggleWakeLock = async () => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      if (!wakeLockActive) {
        try {
          const sentinel = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
          wakeLockSentinelRef[1](sentinel);
          setWakeLockActive(true);
        } catch {
          // Fallback or permission rejection
        }
      } else {
        if (wakeLockSentinelRef[0]?.release) {
          await wakeLockSentinelRef[0].release();
          wakeLockSentinelRef[1](null);
        }
        setWakeLockActive(false);
      }
    } else {
      setWakeLockActive(!wakeLockActive);
    }
  };

  const handleOpenRules = (tab?: GameType) => {
    setRulesTab(tab || (currentGame === 'perfiles' ? 'escoba' : currentGame));
    setRulesOpen(true);
  };

  const handleOpenMoreGames = () => {
    sounds.playCardFlick();
    setMoreGamesOpen(true);
  };

  const handlePlayInLibre = (title: string, targetScore: number, isCountdown: boolean) => {
    sounds.playCardFlick();
    setLibreGame((prev) => ({
      ...prev,
      title,
      targetScore,
      isCountdown,
      winner: null,
      players: prev.players.map((p) => ({
        ...p,
        score: isCountdown ? targetScore : 0,
        history: [],
      })),
    }));
    setCurrentGame('libre');
  };

  // Player profiles state
  const [profiles, setProfiles] = useState<PlayerProfile[]>(() =>
    loadGame('PROFILES', defaultProfiles)
  );

  // Victory modal state
  const [victoryState, setVictoryState] = useState<{
    isOpen: boolean;
    winnerName: string;
    gameTitle: string;
    subtitle?: string;
  }>({
    isOpen: false,
    winnerName: '',
    gameTitle: '',
  });

  // Game states
  const [escobaGame, setEscobaGame] = useState<EscobaGame>(() =>
    loadGame('ESCOBA', defaultEscobaGame)
  );
  const [musGame, setMusGame] = useState<MusGame>(() =>
    loadGame('MUS', defaultMusGame)
  );
  const [chinchonGame, setChinchonGame] = useState<ChinchonGame>(() =>
    loadGame('CHINCHON', defaultChinchonGame)
  );
  const [tuteGame, setTuteGame] = useState<TuteGame>(() =>
    loadGame('TUTE', defaultTuteGame)
  );
  const [libreGame, setLibreGame] = useState<LibreGame>(() =>
    loadGame('LIBRE', defaultLibreGame)
  );

  // Save changes to localStorage
  useEffect(() => {
    saveGame('PROFILES', profiles);
  }, [profiles]);

  useEffect(() => {
    saveGame('ESCOBA', escobaGame);
  }, [escobaGame]);

  useEffect(() => {
    saveGame('MUS', musGame);
  }, [musGame]);

  useEffect(() => {
    saveGame('CHINCHON', chinchonGame);
  }, [chinchonGame]);

  useEffect(() => {
    saveGame('TUTE', tuteGame);
  }, [tuteGame]);

  useEffect(() => {
    saveGame('LIBRE', libreGame);
  }, [libreGame]);

  const handleAddNewProfile = (name: string, suit: AvatarSuit): PlayerProfile => {
    const newProf: PlayerProfile = {
      id: `prof-${Date.now()}`,
      name,
      avatarSuit: suit,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: Date.now(),
    };
    setProfiles((prev) => [...prev, newProf]);
    return newProf;
  };

  const handleToggleSound = () => {
    const updated = sounds.toggleSound();
    setSoundEnabled(updated);
  };

  const handleSelectGame = (game: GameType) => {
    sounds.playCardFlick();
    setCurrentGame(game);
  };

  const handleVictory = (winnerName: string, subtitle: string) => {
    const titleMap: Record<GameType, string> = {
      escoba: 'Escoba del 15',
      mus: 'Mus',
      chinchon: 'Chinchón',
      tute: 'Tute',
      libre: libreGame.title || 'Mesa Libre',
      perfiles: 'Perfiles',
    };

    setVictoryState({
      isOpen: true,
      winnerName,
      gameTitle: titleMap[currentGame],
      subtitle,
    });
  };

  const handleRestartCurrentGame = () => {
    setVictoryState((prev) => ({ ...prev, isOpen: false }));
    sounds.playCardFlick();

    if (currentGame === 'escoba') {
      setEscobaGame({ ...defaultEscobaGame, players: escobaGame.players });
    } else if (currentGame === 'mus') {
      setMusGame({ ...defaultMusGame, pareja1: musGame.pareja1, pareja2: musGame.pareja2 });
    } else if (currentGame === 'chinchon') {
      setChinchonGame({
        ...defaultChinchonGame,
        players: chinchonGame.players.map((p) => ({
          ...p,
          totalScore: 0,
          rounds: [],
          isEliminated: false,
          reenganchesCount: 0,
        })),
      });
    } else if (currentGame === 'tute') {
      setTuteGame({ ...defaultTuteGame, teamA: tuteGame.teamA, teamB: tuteGame.teamB });
    } else if (currentGame === 'libre') {
      setLibreGame({
        ...libreGame,
        winner: null,
        players: libreGame.players.map((p) => ({
          ...p,
          score: libreGame.isCountdown ? libreGame.targetScore : 0,
          history: [],
        })),
      });
    }
  };

  // Get active players list for Sorteo
  const getCurrentPlayersList = (): { id: string; name: string }[] => {
    if (currentGame === 'escoba') {
      return escobaGame.players;
    } else if (currentGame === 'mus') {
      return [
        { id: 'p1', name: musGame.pareja1.name },
        { id: 'p2', name: musGame.pareja2.name },
      ];
    } else if (currentGame === 'chinchon') {
      return chinchonGame.players.map((p) => ({ id: p.id, name: p.name }));
    } else if (currentGame === 'tute') {
      return [
        { id: 'tA', name: tuteGame.teamA.name },
        { id: 'tB', name: tuteGame.teamB.name },
      ];
    } else if (currentGame === 'libre') {
      return libreGame.players.map((p) => ({ id: p.id, name: p.name }));
    }
    return profiles.slice(0, 4).map((p) => ({ id: p.id, name: p.name }));
  };

  // Sorteo Handlers
  const handleSetManoPlayer = (playerName: string) => {
    if (currentGame === 'escoba') {
      const idx = escobaGame.players.findIndex((p) => p.name.toLowerCase() === playerName.toLowerCase());
      if (idx !== -1) {
        setEscobaGame((prev) => ({ ...prev, manoIndex: idx }));
      }
    } else if (currentGame === 'mus') {
      if (musGame.pareja1.name.toLowerCase().includes(playerName.toLowerCase())) {
        setMusGame((prev) => ({ ...prev, manoIndex: 0 }));
      } else if (musGame.pareja2.name.toLowerCase().includes(playerName.toLowerCase())) {
        setMusGame((prev) => ({ ...prev, manoIndex: 1 }));
      }
    } else if (currentGame === 'chinchon') {
      const idx = chinchonGame.players.findIndex((p) => p.name.toLowerCase() === playerName.toLowerCase());
      if (idx !== -1) {
        setChinchonGame((prev) => ({ ...prev, dealerIndex: idx }));
      }
    }
  };

  const handleSetParejas = (pareja1: string, pareja2: string) => {
    if (currentGame === 'mus') {
      setMusGame((prev) => ({
        ...prev,
        pareja1: { ...prev.pareja1, name: pareja1 },
        pareja2: { ...prev.pareja2, name: pareja2 },
      }));
    } else if (currentGame === 'tute') {
      setTuteGame((prev) => ({
        ...prev,
        teamA: { ...prev.teamA, name: pareja1 },
        teamB: { ...prev.teamB, name: pareja2 },
      }));
    }
  };

  // Generate shareable score summary text
  const getGameSummaryText = (): string => {
    if (currentGame === 'escoba') {
      const scores = escobaGame.players.map((p) => {
        const tot = escobaGame.rounds.reduce((acc, r) => acc + (r.scores[p.id]?.totalRound || 0), 0);
        return `${p.name}: ${tot} pts`;
      }).join(' | ');
      return `🃏 CartasRC - Escoba del 15 (Meta: ${escobaGame.targetPoints} pts)\n${scores}`;
    } else if (currentGame === 'mus') {
      return `🃏 CartasRC - Mus\n${musGame.pareja1.name}: ${musGame.piedrasP1} piedras (${musGame.juegosGanadosP1} chicos, ${musGame.vacasGanadasP1} vacas)\n${musGame.pareja2.name}: ${musGame.piedrasP2} piedras (${musGame.juegosGanadosP2} chicos, ${musGame.vacasGanadasP2} vacas)`;
    } else if (currentGame === 'chinchon') {
      const scores = chinchonGame.players.map((p) => `${p.name}: ${p.totalScore} pts`).join(' | ');
      return `🃏 CartasRC - Chinchón (límite ${chinchonGame.maxPoints} pts, Ronda ${chinchonGame.roundNumber})\n${scores}`;
    } else if (currentGame === 'tute') {
      const totA = tuteGame.rounds.reduce((acc, r) => acc + (r.scores['teamA']?.totalRound || 0), 0);
      const totB = tuteGame.rounds.reduce((acc, r) => acc + (r.scores['teamB']?.totalRound || 0), 0);
      return `🃏 CartasRC - Tute\n${tuteGame.teamA.name}: ${totA} pts | ${tuteGame.teamB.name}: ${totB} pts (Meta: ${tuteGame.targetPoints})`;
    } else if (currentGame === 'libre') {
      const scores = libreGame.players.map((p) => `${p.name}: ${p.score}`).join(' | ');
      return `🃏 CartasRC - ${libreGame.title || 'Mesa Libre'}\n${scores}`;
    }
    return '🃏 CartasRC - Anotador de Baraja Española';
  };

  return (
    <div className="min-h-screen bg-tapete text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Contract (Section 2) */}
      <Navbar
        currentGame={currentGame}
        onSelectGame={handleSelectGame}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenRules={() => handleOpenRules(currentGame)}
        onOpenSorteo={() => {
          sounds.playCardFlick();
          setSorteoOpen(true);
        }}
        onOpenTimer={() => {
          sounds.playCardFlick();
          setTimerOpen(true);
        }}
        timerRunning={timerIsRunning}
        timeLeft={timerTimeLeft}
        onOpenMoreGames={handleOpenMoreGames}
      />

      {/* PWA In-App Install Prompt Banner */}
      <PWAInstallBanner />

      {/* Main Table Felt Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2.5 sm:p-6 lg:p-8 space-y-3 sm:space-y-6 pb-28 md:pb-8">
        {/* Heraldic Card Banner */}
        <TableBanner
          currentGame={currentGame}
          onSelectGame={handleSelectGame}
          onOpenMoreGames={handleOpenMoreGames}
        />

        {/* Active Game Scorer */}
        <div className="transition-all duration-200">
          {currentGame === 'escoba' && (
            <EscobaScorer
              game={escobaGame}
              profiles={profiles}
              onChange={setEscobaGame}
              onAddNewProfile={handleAddNewProfile}
              onVictory={handleVictory}
              onOpenRules={() => handleOpenRules('escoba')}
            />
          )}

          {currentGame === 'mus' && (
            <MusScorer
              game={musGame}
              profiles={profiles}
              onChange={setMusGame}
              onVictory={handleVictory}
              onOpenRules={() => handleOpenRules('mus')}
            />
          )}

          {currentGame === 'chinchon' && (
            <ChinchonScorer
              game={chinchonGame}
              profiles={profiles}
              onChange={setChinchonGame}
              onVictory={handleVictory}
              onOpenRules={() => handleOpenRules('chinchon')}
            />
          )}

          {currentGame === 'tute' && (
            <TuteScorer
              game={tuteGame}
              onChange={setTuteGame}
              onVictory={handleVictory}
              onOpenRules={() => handleOpenRules('tute')}
            />
          )}

          {currentGame === 'libre' && (
            <LibreScorer
              game={libreGame}
              profiles={profiles}
              onChange={setLibreGame}
              onVictory={handleVictory}
              onOpenRules={() => handleOpenRules('libre')}
              onOpenMoreGames={handleOpenMoreGames}
            />
          )}

          {currentGame === 'perfiles' && (
            <ProfilesView
              profiles={profiles}
              onSaveProfiles={setProfiles}
              onSelectGameWithPlayers={(targetGame, selectedProfiles) => {
                if (targetGame === 'escoba') {
                  setEscobaGame({
                    ...escobaGame,
                    players: selectedProfiles.map((p) => ({ id: p.id, name: p.name })),
                    rounds: [],
                    winner: null,
                    manoIndex: 0,
                  });
                } else if (targetGame === 'chinchon') {
                  setChinchonGame({
                    ...chinchonGame,
                    players: selectedProfiles.map((p) => ({
                      id: p.id,
                      name: p.name,
                      totalScore: 0,
                      rounds: [],
                      isEliminated: false,
                      reenganchesCount: 0,
                    })),
                    roundNumber: 1,
                    winner: null,
                  });
                } else if (targetGame === 'mus') {
                  if (selectedProfiles.length >= 2) {
                    setMusGame({
                      ...musGame,
                      pareja1: { ...musGame.pareja1, name: selectedProfiles[0].name },
                      pareja2: { ...musGame.pareja2, name: selectedProfiles[1].name },
                      piedrasP1: 0,
                      piedrasP2: 0,
                    });
                  }
                } else if (targetGame === 'libre') {
                  setLibreGame({
                    ...libreGame,
                    players: selectedProfiles.map((p) => ({
                      id: p.id,
                      name: p.name,
                      score: libreGame.isCountdown ? libreGame.targetScore : 0,
                      history: [],
                    })),
                    winner: null,
                  });
                }
                setCurrentGame(targetGame);
              }}
            />
          )}
        </div>
      </main>

      {/* Footer (hidden on small mobile to give room to bottom nav) */}
      <footer className="mt-auto border-t border-amber-950/60 bg-[#05170d]/90 py-4 px-4 text-center text-xs text-emerald-300/50 space-y-1.5 hidden md:block">
        <div className="flex items-center justify-center gap-3">
          <OrosIcon className="w-4 h-4 opacity-40 hover:opacity-80 transition-opacity" />
          <CopasIcon className="w-4 h-4 opacity-40 hover:opacity-80 transition-opacity" />
          <EspadasIcon className="w-4 h-4 opacity-40 hover:opacity-80 transition-opacity" />
          <BastosIcon className="w-4 h-4 opacity-40 hover:opacity-80 transition-opacity" />
        </div>
        <p className="font-deck text-[11px] text-amber-200/60">
          CartasRC · Anotador clásico de cartas para baraja española
        </p>
      </footer>

      {/* Floating Timer Widget on Table (active when timer running or not full) */}
      {timerIsRunning && (
        <FloatingTimerWidget
          timeLeft={timerTimeLeft}
          duration={timerDuration}
          isRunning={timerIsRunning}
          onTogglePlay={() => setTimerIsRunning(!timerIsRunning)}
          onNextTurn={() => {
            sounds.playCardFlick();
            setTimerTimeLeft(timerDuration);
            setTimerIsRunning(true);
          }}
          onOpenModal={() => setTimerOpen(true)}
        />
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav currentGame={currentGame} onSelectGame={handleSelectGame} />

      {/* Sorteo de Mesa Modal */}
      <SorteoModal
        isOpen={sorteoOpen}
        onClose={() => setSorteoOpen(false)}
        currentPlayers={getCurrentPlayersList()}
        profiles={profiles}
        onSetManoPlayer={handleSetManoPlayer}
        onSetParejas={handleSetParejas}
      />

      {/* Reloj de Turno / Temporizador Modal */}
      <TurnTimerModal
        isOpen={timerOpen}
        onClose={() => setTimerOpen(false)}
        timeLeft={timerTimeLeft}
        setTimeLeft={setTimerTimeLeft}
        isRunning={timerIsRunning}
        setIsRunning={setTimerIsRunning}
        duration={timerDuration}
        setDuration={setTimerDuration}
        wakeLockActive={wakeLockActive}
        onToggleWakeLock={handleToggleWakeLock}
        gameSummaryText={getGameSummaryText()}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
        initialTab={rulesTab}
        onOpenMoreGames={handleOpenMoreGames}
      />

      {/* More Games & Rules Catalog Modal */}
      <MoreGamesModal
        isOpen={moreGamesOpen}
        onClose={() => setMoreGamesOpen(false)}
        onPlayInLibre={handlePlayInLibre}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={victoryState.isOpen}
        winnerName={victoryState.winnerName}
        gameTitle={victoryState.gameTitle}
        subtitle={victoryState.subtitle}
        onRestart={handleRestartCurrentGame}
        onClose={() => setVictoryState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
