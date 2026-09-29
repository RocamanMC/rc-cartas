import { EscobaGame, MusGame, ChinchonGame, TuteGame, LibreGame, PlayerProfile } from '../types';

const STORAGE_KEYS = {
  ESCOBA: 'tantador_escoba_game_v1',
  MUS: 'tantador_mus_game_v1',
  CHINCHON: 'tantador_chinchon_game_v1',
  TUTE: 'tantador_tute_game_v1',
  LIBRE: 'tantador_libre_game_v1',
  PROFILES: 'tantador_player_profiles_v1',
};

export const defaultProfiles: PlayerProfile[] = [
  { id: 'prof-1', name: 'Rodrigo', nickname: 'El As', avatarSuit: 'oros', gamesPlayed: 0, gamesWon: 0, createdAt: Date.now() - 5000 },
  { id: 'prof-2', name: 'María', nickname: 'La Reina', avatarSuit: 'corazones', gamesPlayed: 0, gamesWon: 0, createdAt: Date.now() - 4000 },
  { id: 'prof-3', name: 'Carlos', nickname: 'El Músico', avatarSuit: 'picas', gamesPlayed: 0, gamesWon: 0, createdAt: Date.now() - 3000 },
  { id: 'prof-4', name: 'David', nickname: 'El Capi', avatarSuit: 'bastos', gamesPlayed: 0, gamesWon: 0, createdAt: Date.now() - 2000 },
  { id: 'prof-5', name: 'Elena', nickname: 'La Furia', avatarSuit: 'fuego', gamesPlayed: 0, gamesWon: 0, createdAt: Date.now() - 1000 },
  { id: 'prof-6', name: 'Javier', nickname: 'El Rey', avatarSuit: 'corona', gamesPlayed: 0, gamesWon: 0, createdAt: Date.now() },
];

// Initial default templates
export const defaultEscobaGame: EscobaGame = {
  players: [
    { id: 'p1', name: 'Rodrigo' },
    { id: 'p2', name: 'María' },
  ],
  targetPoints: 21,
  manoIndex: 0,
  rounds: [],
  winner: null,
};

export const defaultMusGame: MusGame = {
  pareja1: { id: 'p1', name: 'Pareja 1' },
  pareja2: { id: 'p2', name: 'Pareja 2' },
  tantosPorJuego: 40, // 40 tantos (8 amarracos)
  vacasObjetivo: 1,   // Ganar 1 vaca
  juegosPorVaca: 3,   // 3 chicos ganados = 1 vaca
  piedrasP1: 0,
  piedrasP2: 0,
  juegosGanadosP1: 0,
  juegosGanadosP2: 0,
  vacasGanadasP1: 0,
  vacasGanadasP2: 0,
  manoIndex: 0,
  historialTantos: [],
  winner: null,
};

export const defaultChinchonGame: ChinchonGame = {
  players: [
    { id: '1', name: 'Jugador 1', totalScore: 0, rounds: [], isEliminated: false, reenganchesCount: 0 },
    { id: '2', name: 'Jugador 2', totalScore: 0, rounds: [], isEliminated: false, reenganchesCount: 0 },
    { id: '3', name: 'Jugador 3', totalScore: 0, rounds: [], isEliminated: false, reenganchesCount: 0 },
    { id: '4', name: 'Jugador 4', totalScore: 0, rounds: [], isEliminated: false, reenganchesCount: 0 },
  ],
  maxPoints: 101,
  allowReenganche: true,
  dealerIndex: 0,
  roundNumber: 1,
  winner: null,
};

export const defaultTuteGame: TuteGame = {
  teamA: { id: 'tuteA', name: 'Nosotros' },
  teamB: { id: 'tuteB', name: 'Ellos' },
  targetPoints: 100,
  rounds: [],
  winner: null,
};

export const defaultLibreGame: LibreGame = {
  title: 'Mesa Libre',
  targetScore: 100,
  isCountdown: false,
  players: [
    { id: 'l1', name: 'Jugador 1', score: 0, history: [] },
    { id: 'l2', name: 'Jugador 2', score: 0, history: [] },
    { id: 'l3', name: 'Jugador 3', score: 0, history: [] },
  ],
  winner: null,
};

export function loadGame<T>(key: keyof typeof STORAGE_KEYS, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEYS[key]);
    if (item) {
      const parsed = JSON.parse(item);
      // Migrate legacy escoba with teamA/teamB to players array or cleanse Nosotros/Ellos
      if (key === 'ESCOBA' && parsed) {
        let players = parsed.players;
        if (!players || !Array.isArray(players) || players.length === 0) {
          players = [
            { id: 'p1', name: 'Rodrigo' },
            { id: 'p2', name: 'María' },
          ];
        } else {
          // If names are legacy 'Nosotros' or 'Ellos', replace them with clean names
          players = players.map((p: { id: string; name: string }, i: number) => {
            if (p.name === 'Nosotros' || p.name === 'Ellos') {
              return { ...p, name: i === 0 ? 'Rodrigo' : 'María' };
            }
            return p;
          });
        }
        return {
          players,
          targetPoints: parsed.targetPoints || 21,
          manoIndex: parsed.manoIndex || 0,
          rounds: parsed.rounds || [],
          winner: parsed.winner || null,
        } as unknown as T;
      }
      return parsed;
    }
  } catch (err) {
    console.warn(`Error loading game ${key}:`, err);
  }
  return fallback;
}

export function saveGame<T>(key: keyof typeof STORAGE_KEYS, state: T): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(state));
  } catch (err) {
    console.warn(`Error saving game ${key}:`, err);
  }
}

export function clearGame(key: keyof typeof STORAGE_KEYS): void {
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
  } catch {}
}
