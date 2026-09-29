import React, { useState, useEffect } from 'react';
import { X, Dices, Shuffle, Coins, Trophy, RefreshCw, CheckCircle2, Users, Flame } from 'lucide-react';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';
import { PlayerProfile } from '../types';
import { OrosIcon, CopasIcon, EspadasIcon, BastosIcon } from './SpanishDeckIcons';

interface SorteoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayers: { id: string; name: string }[];
  profiles: PlayerProfile[];
  onSetManoPlayer?: (playerName: string) => void;
  onSetParejas?: (pareja1: string, pareja2: string) => void;
}

type SorteoTab = 'cartas' | 'ruleta' | 'moneda' | 'dados' | 'parejas';

interface SpanishCard {
  suit: 'oros' | 'copas' | 'espadas' | 'bastos';
  value: number; // 1 to 12 (skipping 8 and 9 in traditional 40-card deck)
  name: string;
}

const SUITS: ('oros' | 'copas' | 'espadas' | 'bastos')[] = ['oros', 'copas', 'espadas', 'bastos'];
const VALUES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]; // 40-card baraja española

function getCardName(value: number, suit: string): string {
  let valStr = `${value}`;
  if (value === 1) valStr = 'As';
  else if (value === 10) valStr = 'Sota';
  else if (value === 11) valStr = 'Caballo';
  else if (value === 12) valStr = 'Rey';

  const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);
  return `${valStr} de ${suitName}`;
}

export const SorteoModal: React.FC<SorteoModalProps> = ({
  isOpen,
  onClose,
  currentPlayers,
  profiles,
  onSetManoPlayer,
  onSetParejas,
}) => {
  const [activeTab, setActiveTab] = useState<SorteoTab>('cartas');

  // ============ TAB 1: SACAR CARTA ============
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [drawnCards, setDrawnCards] = useState<{
    player: string;
    card: SpanishCard | null;
    isRevealed: boolean;
  }[]>([]);
  const [cardWinner, setCardWinner] = useState<{ player: string; cardName: string } | null>(null);

  // Initialize player list when modal opens or current players change
  useEffect(() => {
    if (isOpen) {
      const names = currentPlayers.length > 0
        ? currentPlayers.map((p) => p.name)
        : ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'];
      setPlayerList(names);
      resetCardDraw(names);
    }
  }, [isOpen, currentPlayers]);

  const resetCardDraw = (names: string[] = playerList) => {
    setDrawnCards(names.map((name) => ({ player: name, card: null, isRevealed: false })));
    setCardWinner(null);
  };

  const handleDrawAllCards = () => {
    sounds.playCardFlick();
    // Build a shuffled deck of 40 cards
    const deck: SpanishCard[] = [];
    SUITS.forEach((suit) => {
      VALUES.forEach((val) => {
        deck.push({ suit, value: val, name: getCardName(val, suit) });
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const assigned = playerList.map((player, idx) => ({
      player,
      card: deck[idx % deck.length],
      isRevealed: true,
    }));

    setDrawnCards(assigned);

    // Determine winner (highest card value, in traditional Spanish deck: Rey (12) > Caballo (11) > Sota (10) > 7 > 6 ... > As (1))
    // If tied in value, suit hierarchy: Oros (4) > Copas (3) > Espadas (2) > Bastos (1)
    const suitRank: Record<string, number> = { oros: 4, copas: 3, espadas: 2, bastos: 1 };
    let best = assigned[0];
    let bestScore = best.card.value * 10 + suitRank[best.card.suit];

    for (let i = 1; i < assigned.length; i++) {
      const item = assigned[i];
      const score = item.card.value * 10 + suitRank[item.card.suit];
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    }

    setCardWinner({ player: best.player, cardName: best.card.name });
    sounds.playVictory();
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
  };

  // ============ TAB 2: RULETA DE JUGADORES ============
  const [roulettePlayers, setRoulettePlayers] = useState<string[]>([]);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteWinner, setRouletteWinner] = useState<string | null>(null);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [customNameInput, setCustomNameInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initial = currentPlayers.length > 0
        ? currentPlayers.map((p) => p.name)
        : profiles.slice(0, 4).map((p) => p.name);
      setRoulettePlayers(initial.length > 0 ? initial : ['Jugador 1', 'Jugador 2']);
      setRouletteWinner(null);
    }
  }, [isOpen, currentPlayers, profiles]);

  const handleSpinRoulette = () => {
    if (roulettePlayers.length < 2 || rouletteSpinning) return;
    setRouletteSpinning(true);
    setRouletteWinner(null);
    sounds.playCardFlick();

    let counter = 0;
    const totalSpins = 24 + Math.floor(Math.random() * 8);
    let speed = 60;

    const spin = () => {
      const current = counter % roulettePlayers.length;
      setHighlightIdx(current);
      sounds.playTap();
      counter++;

      if (counter < totalSpins) {
        speed += 12; // slow down gradually
        setTimeout(spin, speed);
      } else {
        const winner = roulettePlayers[current];
        setRouletteWinner(winner);
        setRouletteSpinning(false);
        sounds.playVictory();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    };

    spin();
  };

  const addRoulettePlayer = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !roulettePlayers.includes(trimmed)) {
      setRoulettePlayers((prev) => [...prev, trimmed]);
      setCustomNameInput('');
    }
  };

  const removeRoulettePlayer = (index: number) => {
    setRoulettePlayers((prev) => prev.filter((_, i) => i !== index));
    if (rouletteWinner) setRouletteWinner(null);
  };

  // ============ TAB 3: MONEDA (CARA O CRUZ) ============
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<'CARA' | 'CRUZ' | null>(null);

  const handleFlipCoin = () => {
    if (coinFlipping) return;
    setCoinFlipping(true);
    setCoinResult(null);
    sounds.playCoin();

    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'CARA' : 'CRUZ';
      setCoinResult(outcome);
      setCoinFlipping(false);
      sounds.playStoneClick();
    }, 1200);
  };

  // ============ TAB 4: DADOS ============
  const [diceCount, setDiceCount] = useState<1 | 2>(1);
  const [diceValues, setDiceValues] = useState<number[]>([6]);
  const [rollingDice, setRollingDice] = useState(false);

  const handleRollDice = () => {
    if (rollingDice) return;
    setRollingDice(true);
    sounds.playDice();

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValues(
        Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
      );
      rolls++;
      if (rolls > 8) {
        clearInterval(interval);
        setRollingDice(false);
        sounds.playPointChime();
      }
    }, 80);
  };

  // ============ TAB 5: SORTEO DE PAREJAS ============
  const [parejaCandidates, setParejaCandidates] = useState<string[]>([
    'Jugador 1',
    'Jugador 2',
    'Jugador 3',
    'Jugador 4',
  ]);
  const [sortedTeams, setSortedTeams] = useState<{ team1: [string, string]; team2: [string, string] } | null>(null);

  useEffect(() => {
    if (isOpen && currentPlayers.length >= 4) {
      setParejaCandidates(currentPlayers.slice(0, 4).map((p) => p.name));
    }
  }, [isOpen, currentPlayers]);

  const handleSortParejas = () => {
    sounds.playCardFlick();
    const shuffled = [...parejaCandidates].sort(() => Math.random() - 0.5);
    setSortedTeams({
      team1: [shuffled[0], shuffled[1]],
      team2: [shuffled[2], shuffled[3]],
    });
    sounds.playVictory();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#092b19] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-900/60 bg-[#062113]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-deck text-amber-200 flex items-center gap-2">
                El Sorteo de Mesa
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider font-sans font-semibold">
                  Echar a suertes
                </span>
              </h2>
              <p className="text-xs text-emerald-200/70">
                Sortea quién reparte, quién es mano o forma parejas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-900/50 bg-[#072516] px-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { sounds.playTap(); setActiveTab('cartas'); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'cartas'
                ? 'border-amber-400 text-amber-200 bg-amber-950/30'
                : 'border-transparent text-emerald-200/70 hover:text-amber-200'
            }`}
          >
            <OrosIcon className="w-4 h-4" />
            <span>Sacar Carta</span>
          </button>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('ruleta'); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ruleta'
                ? 'border-amber-400 text-amber-200 bg-amber-950/30'
                : 'border-transparent text-emerald-200/70 hover:text-amber-200'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Ruleta Jugador</span>
          </button>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('moneda'); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'moneda'
                ? 'border-amber-400 text-amber-200 bg-amber-950/30'
                : 'border-transparent text-emerald-200/70 hover:text-amber-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Moneda</span>
          </button>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('dados'); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dados'
                ? 'border-amber-400 text-amber-200 bg-amber-950/30'
                : 'border-transparent text-emerald-200/70 hover:text-amber-200'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Dados</span>
          </button>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('parejas'); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'parejas'
                ? 'border-amber-400 text-amber-200 bg-amber-950/30'
                : 'border-transparent text-emerald-200/70 hover:text-amber-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parejas (2v2)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* ============ TAB 1: SACAR CARTA ============ */}
          {activeTab === 'cartas' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-emerald-200/80">
                  Cada jugador descubre una carta de la baraja española. <strong className="text-amber-300">Gana la carta más alta</strong> (Rey &gt; Caballo &gt; Sota &gt; 7...). En caso de empate en número, desempata el palo (Oros &gt; Copas &gt; Espadas &gt; Bastos).
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {drawnCards.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      cardWinner?.player === item.player
                        ? 'border-amber-400 bg-amber-500/20 shadow-lg ring-2 ring-amber-400/50 scale-[1.03]'
                        : 'border-amber-900/60 bg-[#062113]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-emerald-200 truncate max-w-full mb-2">
                      {item.player}
                    </span>

                    {/* Card Graphic */}
                    <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg bg-amber-50 border-2 border-amber-700/80 shadow-md flex flex-col justify-between p-1.5 text-amber-950 relative overflow-hidden select-none">
                      {item.card ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold font-deck">
                              {item.card.value === 1 ? '1' : item.card.value}
                            </span>
                            <div className="w-3.5 h-3.5">
                              {item.card.suit === 'oros' && <OrosIcon className="w-full h-full" />}
                              {item.card.suit === 'copas' && <CopasIcon className="w-full h-full" />}
                              {item.card.suit === 'espadas' && <EspadasIcon className="w-full h-full" />}
                              {item.card.suit === 'bastos' && <BastosIcon className="w-full h-full" />}
                            </div>
                          </div>

                          <div className="flex items-center justify-center my-auto">
                            <div className="w-8 h-8 sm:w-10 sm:h-10">
                              {item.card.suit === 'oros' && <OrosIcon className="w-full h-full" />}
                              {item.card.suit === 'copas' && <CopasIcon className="w-full h-full" />}
                              {item.card.suit === 'espadas' && <EspadasIcon className="w-full h-full" />}
                              {item.card.suit === 'bastos' && <BastosIcon className="w-full h-full" />}
                            </div>
                          </div>

                          <div className="flex items-center justify-between rotate-180">
                            <span className="text-xs sm:text-sm font-bold font-deck">
                              {item.card.value === 1 ? '1' : item.card.value}
                            </span>
                            <div className="w-3.5 h-3.5">
                              {item.card.suit === 'oros' && <OrosIcon className="w-full h-full" />}
                              {item.card.suit === 'copas' && <CopasIcon className="w-full h-full" />}
                              {item.card.suit === 'espadas' && <EspadasIcon className="w-full h-full" />}
                              {item.card.suit === 'bastos' && <BastosIcon className="w-full h-full" />}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full rounded border border-dashed border-amber-800/40 bg-amber-900/10 flex flex-col items-center justify-center text-amber-800/50">
                          <span className="text-2xl font-deck">?</span>
                          <span className="text-[9px] uppercase font-semibold">Tapa</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-amber-200/90 text-center mt-2 leading-tight">
                      {item.card ? item.card.name : 'Boca abajo'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Winner Announcement */}
              {cardWinner && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border border-amber-400/60 rounded-xl text-center shadow-md animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>¡Gana el sorteo: <strong className="text-white font-extrabold">{cardWinner.player}</strong> con {cardWinner.cardName}!</span>
                  </div>
                  <p className="text-xs text-amber-200/80 mt-1">
                    Es la mano o le corresponde repartir en la mesa.
                  </p>
                  {onSetManoPlayer && (
                    <button
                      onClick={() => {
                        onSetManoPlayer(cardWinner.player);
                        sounds.playPointChime();
                        onClose();
                      }}
                      className="mt-2.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fijar a {cardWinner.player} como Mano</span>
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDrawAllCards}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>¡Sacar Cartas!</span>
                </button>
                <button
                  onClick={() => resetCardDraw()}
                  className="px-3.5 py-2.5 bg-[#062113] hover:bg-[#0c3820] text-emerald-200 border border-amber-800/60 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          )}

          {/* ============ TAB 2: RULETA DE JUGADORES ============ */}
          {activeTab === 'ruleta' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-emerald-200/80 text-center">
                Elige un jugador al azar de la lista. Ideal para decidir turnos, quién pide las bebidas o quién corta la baraja.
              </p>

              {/* Players chips */}
              <div className="bg-[#062113] p-3 rounded-xl border border-amber-900/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-200">
                    Participantes ({roulettePlayers.length}):
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roulettePlayers.map((name, idx) => {
                    const isHigh = highlightIdx === idx;
                    const isWin = rouletteWinner === name;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isWin
                            ? 'bg-amber-400 text-amber-950 border-amber-300 ring-2 ring-amber-400 font-bold scale-105'
                            : isHigh
                            ? 'bg-amber-500/40 text-amber-100 border-amber-400 scale-105'
                            : 'bg-[#0a2f1b] text-emerald-100 border-amber-900/40'
                        }`}
                      >
                        <span>{name}</span>
                        {roulettePlayers.length > 2 && !rouletteSpinning && (
                          <button
                            onClick={() => removeRoulettePlayer(idx)}
                            className="text-emerald-400/60 hover:text-red-400 ml-1 cursor-pointer"
                            title="Eliminar"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add participant input */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-amber-900/40">
                  <input
                    type="text"
                    placeholder="Añadir jugador..."
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addRoulettePlayer(customNameInput);
                    }}
                    maxLength={20}
                    className="flex-1 bg-[#092b19] border border-amber-700/60 rounded-lg px-3 py-1.5 text-xs text-amber-100 placeholder-emerald-400/40 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => addRoulettePlayer(customNameInput)}
                    disabled={!customNameInput.trim()}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              {/* Winner showcase */}
              {rouletteWinner && (
                <div className="p-4 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-2 border-amber-400 rounded-2xl text-center shadow-lg animate-in zoom-in-95 duration-200">
                  <div className="text-3xl font-extrabold font-deck text-white flex items-center justify-center gap-2">
                    <Flame className="w-7 h-7 text-amber-400 animate-bounce" />
                    <span>{rouletteWinner}</span>
                    <Flame className="w-7 h-7 text-amber-400 animate-bounce" />
                  </div>
                  <p className="text-xs font-semibold text-amber-200 mt-1 uppercase tracking-wider">
                    ¡Elegido por la suerte!
                  </p>
                  {onSetManoPlayer && (
                    <button
                      onClick={() => {
                        onSetManoPlayer(rouletteWinner);
                        sounds.playPointChime();
                        onClose();
                      }}
                      className="mt-3 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fijar a {rouletteWinner} como Mano</span>
                    </button>
                  )}
                </div>
              )}

              {/* Action Spin */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSpinRoulette}
                  disabled={rouletteSpinning || roulettePlayers.length < 2}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                >
                  <Shuffle className={`w-5 h-5 ${rouletteSpinning ? 'animate-spin' : ''}`} />
                  <span>{rouletteSpinning ? 'Girando la suerte...' : '¡Girar Ruleta!'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ============ TAB 3: MONEDA (CARA O CRUZ) ============ */}
          {activeTab === 'moneda' && (
            <div className="space-y-6 py-4 flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm text-emerald-200/80 text-center max-w-sm">
                Lanza al aire el doblón español para resolver cualquier empate rápido.
              </p>

              {/* 3D Coin Graphic */}
              <div className="relative py-4">
                <div
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-2xl flex flex-col items-center justify-center text-amber-950 font-deck select-none cursor-pointer transition-transform duration-500 ${
                    coinFlipping ? 'animate-[spin_0.3s_infinite]' : 'hover:scale-105'
                  }`}
                  onClick={handleFlipCoin}
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-amber-700/60 flex flex-col items-center justify-center p-2 text-center">
                    {coinResult ? (
                      <>
                        <span className="text-2xl sm:text-3xl font-black tracking-widest">
                          {coinResult}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider mt-0.5">
                          {coinResult === 'CARA' ? 'Escudo Real' : 'Cruz de Tantos'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-8 h-8 text-amber-900 opacity-70" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-900 mt-1">
                          Tocar para lanzar
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Result text */}
              {coinResult && !coinFlipping && (
                <div className="text-center animate-in fade-in duration-200">
                  <span className="text-xl sm:text-2xl font-bold font-deck text-amber-200">
                    ¡Ha salido {coinResult}!
                  </span>
                </div>
              )}

              <button
                onClick={handleFlipCoin}
                disabled={coinFlipping}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                <Coins className="w-4 h-4" />
                <span>{coinFlipping ? 'En el aire...' : '¡Lanzar Moneda!'}</span>
              </button>
            </div>
          )}

          {/* ============ TAB 4: DADOS ============ */}
          {activeTab === 'dados' && (
            <div className="space-y-6 py-4 flex flex-col items-center justify-center">
              {/* Select 1 or 2 dice */}
              <div className="flex items-center gap-2 bg-[#062113] p-1.5 rounded-xl border border-amber-900/60">
                <button
                  onClick={() => { setDiceCount(1); setDiceValues([diceValues[0] || 6]); }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    diceCount === 1 ? 'bg-amber-400 text-amber-950 font-bold' : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  1 Dado
                </button>
                <button
                  onClick={() => { setDiceCount(2); setDiceValues([diceValues[0] || 6, 6]); }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    diceCount === 2 ? 'bg-amber-400 text-amber-950 font-bold' : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  2 Dados
                </button>
              </div>

              {/* Dice Visuals */}
              <div className="flex items-center justify-center gap-6 py-2">
                {diceValues.map((val, idx) => (
                  <div
                    key={idx}
                    onClick={handleRollDice}
                    className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-700/80 rounded-2xl shadow-xl flex flex-col items-center justify-center cursor-pointer select-none transition-transform ${
                      rollingDice ? 'rotate-12 scale-95' : 'hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl font-black font-deck text-amber-950">
                      {val}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 uppercase">
                      Puntos
                    </span>
                  </div>
                ))}
              </div>

              {diceCount === 2 && (
                <div className="text-center">
                  <span className="text-sm font-semibold text-emerald-200/80">
                    Suma total:{' '}
                    <strong className="text-lg text-amber-300 font-deck">
                      {diceValues.reduce((a, b) => a + b, 0)}
                    </strong>
                  </span>
                </div>
              )}

              <button
                onClick={handleRollDice}
                disabled={rollingDice}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                <Dices className="w-5 h-5" />
                <span>{rollingDice ? 'Rodando...' : '¡Tirar Dados!'}</span>
              </button>
            </div>
          )}

          {/* ============ TAB 5: SORTEO DE PAREJAS ============ */}
          {activeTab === 'parejas' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-emerald-200/80 text-center">
                Introduce a los 4 jugadores y forma las parejas al azar de forma justa para Mus o Tute.
              </p>

              {/* 4 players inputs */}
              <div className="grid grid-cols-2 gap-2.5">
                {parejaCandidates.map((name, idx) => (
                  <div key={idx} className="bg-[#062113] p-2.5 rounded-xl border border-amber-900/60">
                    <label className="block text-[10px] font-semibold text-emerald-300/70 uppercase mb-1">
                      Jugador {idx + 1}
                    </label>
                    <input
                      type="text"
                      value={name}
                      maxLength={18}
                      onChange={(e) => {
                        const updated = [...parejaCandidates];
                        updated[idx] = e.target.value;
                        setParejaCandidates(updated);
                      }}
                      className="w-full bg-[#092b19] border border-amber-800/60 rounded-lg px-2.5 py-1 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>

              {/* Sorted Teams Result */}
              {sortedTeams && (
                <div className="p-4 bg-[#062113] border-2 border-amber-500/60 rounded-xl space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="text-center font-bold text-amber-200 text-sm font-deck">
                    ¡Parejas Asignadas por Sorteo!
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                        Pareja 1
                      </span>
                      <div className="text-sm font-semibold text-white">
                        {sortedTeams.team1[0]} &amp; {sortedTeams.team1[1]}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/30">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                        Pareja 2
                      </span>
                      <div className="text-sm font-semibold text-white">
                        {sortedTeams.team2[0]} &amp; {sortedTeams.team2[1]}
                      </div>
                    </div>
                  </div>

                  {onSetParejas && (
                    <div className="flex justify-center pt-1">
                      <button
                        onClick={() => {
                          const p1 = `${sortedTeams.team1[0]} & ${sortedTeams.team1[1]}`;
                          const p2 = `${sortedTeams.team2[0]} & ${sortedTeams.team2[1]}`;
                          onSetParejas(p1, p2);
                          sounds.playPointChime();
                          onClose();
                        }}
                        className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Cargar estas parejas en el juego actual</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSortParejas}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>¡Sortear Parejas!</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#062113] border-t border-amber-900/60 flex items-center justify-between text-xs text-emerald-300/60">
          <span>Baraja española tradicional (40 cartas)</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#092b19] hover:bg-[#0f4025] text-amber-200 border border-amber-700/40 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
