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
import { MobileBottomNav } from './components/MobileBottomNav';
import { OrosIcon, CopasIcon, EspadasIcon, BastosIcon } from './components/SpanishDeckIcons';

export default function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('escoba');
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rulesTab, setRulesTab] = useState<GameType>('escoba');
  const [moreGamesOpen, setMoreGamesOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-tapete text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Contract (Section 2) */}
      <Navbar
        currentGame={currentGame}
        onSelectGame={handleSelectGame}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenRules={() => handleOpenRules(currentGame)}
        onOpenMoreGames={handleOpenMoreGames}
      />

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
          El Tantador Español · Anotador clásico de cartas para baraja española
        </p>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav currentGame={currentGame} onSelectGame={handleSelectGame} />

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
