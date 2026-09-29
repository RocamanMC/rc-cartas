export type GameType = 'escoba' | 'mus' | 'chinchon' | 'tute' | 'libre' | 'perfiles';

export type AvatarSuit =
  | 'oros'
  | 'copas'
  | 'espadas'
  | 'bastos'
  | 'picas'
  | 'corazones'
  | 'treboles'
  | 'diamantes'
  | 'corona'
  | 'caballo'
  | 'comodin'
  | 'estrella'
  | 'fuego';

export interface PlayerProfile {
  id: string;
  name: string;
  nickname?: string;
  avatarSuit: AvatarSuit;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: number;
}

export interface BasePlayer {
  id: string;
  name: string;
  color?: string;
}

// =================== ESCOBA ===================
export interface EscobaPlayer {
  id: string;
  name: string;
}

export interface EscobaRound {
  id: string;
  timestamp: number;
  manoIndex: number;
  scores: {
    [playerId: string]: {
      escobas: number;
      cartas: boolean; // mayoría de cartas (+1)
      oros: boolean;   // mayoría de oros (+1)
      sieteVelos: boolean; // 7 de oros (+1)
      setenta: boolean;    // mayoría de sietes (+1)
      totalRound: number;
    };
  };
}

export interface EscobaGame {
  players: EscobaPlayer[];
  targetPoints: number; // 15 or 21
  manoIndex: number; // index of dealer/mano
  rounds: EscobaRound[];
  winner: string | null;
}

// =================== MUS ===================
export interface MusGame {
  pareja1: { id: string; name: string; avatar?: string };
  pareja2: { id: string; name: string; avatar?: string };
  tantosPorJuego: number; // 30 o 40 piedras (6 u 8 amarracos)
  vacasObjetivo: number;  // normalmente a 1, 2 o 3 vacas (juegos ganados por vaca: 3 o 2)
  juegosPorVaca: number;  // normalmente 3 chicos = 1 vaca
  // Estado actual del chico en curso:
  piedrasP1: number; // Tantos totales de este chico (0 a 30 o 40)
  piedrasP2: number;
  juegosGanadosP1: number; // Chicos ganados en la vaca actual
  juegosGanadosP2: number;
  vacasGanadasP1: number;
  vacasGanadasP2: number;
  manoIndex: number; // 0: Pareja 1, 1: Pareja 2
  historialTantos: {
    id: string;
    equipoId: string;
    cantidad: number;
    motivo: string; // "Grande", "Chica", "Pares", "Juego", "Punto", "Envite", "Amarraco", etc.
    timestamp: number;
  }[];
  winner: string | null;
}

// =================== CHINCHÓN ===================
export interface ChinchonPlayer {
  id: string;
  name: string;
  totalScore: number;
  rounds: number[]; // Puntos en cada mano
  isEliminated: boolean;
  reenganchesCount: number;
}

export interface ChinchonGame {
  players: ChinchonPlayer[];
  maxPoints: number; // Normalmente 101 o 50
  allowReenganche: boolean;
  dealerIndex: number;
  roundNumber: number;
  winner: string | null;
}

// =================== TUTE ===================
export interface TuteRound {
  id: string;
  timestamp: number;
  scores: {
    [teamId: string]: {
      cuarenta: number; // número de 40s (+40 c/u)
      veinte: number;   // número de 20s (+20 c/u)
      diezUltimas: boolean; // +10 por llevarse la última baza
      puntosBazas: number; // puntos sumados de las cartas (0-120)
      totalRound: number;
    };
  };
}

export interface TuteGame {
  teamA: { id: string; name: string };
  teamB: { id: string; name: string };
  targetPoints: number; // e.g. 100, 200, 300 o a chicos
  rounds: TuteRound[];
  winner: string | null;
}

// =================== MESA LIBRE ===================
export interface LibrePlayer {
  id: string;
  name: string;
  score: number;
  history: number[];
}

export interface LibreGame {
  title: string;
  targetScore: number;
  isCountdown: boolean; // Si cuenta hacia abajo a 0
  players: LibrePlayer[];
  winner: string | null;
}
