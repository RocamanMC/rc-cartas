import React, { useState } from 'react';
import { GameType } from '../types';
import { BookOpen, ChevronDown, ChevronUp, Award, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { OrosIcon, CopasIcon, EspadasIcon, BastosIcon } from './SpanishDeckIcons';
import { sounds } from '../utils/sound';

interface GameRulesCardProps {
  gameType: GameType;
  onOpenFullRules?: () => void;
}

export const GameRulesCard: React.FC<GameRulesCardProps> = ({ gameType, onOpenFullRules }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    sounds.playTap();
    setIsExpanded((prev) => !prev);
  };

  const getGameIcon = () => {
    switch (gameType) {
      case 'escoba':
        return <OrosIcon className="w-4 h-4 shrink-0 text-amber-400" />;
      case 'mus':
        return <CopasIcon className="w-4 h-4 shrink-0 text-amber-400" />;
      case 'chinchon':
        return <EspadasIcon className="w-4 h-4 shrink-0 text-amber-400" />;
      case 'tute':
        return <BastosIcon className="w-4 h-4 shrink-0 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />;
    }
  };

  const getQuickSummary = () => {
    switch (gameType) {
      case 'escoba':
        return 'Sumar 15 (As=1, Sota=8, Caballo=9, Rey=10) · Escoba (+1), 7 de Oros (+1), Oros (+1), Cartas (+1), Setenta (+1)';
      case 'mus':
        return '4 Lances: Grande (Reyes), Chica (Ases), Pares (1, 2, 3), Juego (31=3p) / Punto · 1 Amarraco = 5 piedras · Órdago';
      case 'chinchon':
        return 'Ligar 7 cartas · Cierre con ≤3 pts, con 0 pts o -10 pts (escalera) · Límite 101 pts · ¡Chinchón directo gana!';
      case 'tute':
        return 'Bazas (120 pts cartas + 10 últimas) · As=11, 3=10, Rey=4, Cab=3, Sota=2 · Las 40 (+40) · Las 20 (+20) · ¡Tute directo!';
      case 'libre':
        return 'Anotador libre para Pocha, Brisca, Guiñote, Cinquillo o Truco · Pincha en el número para editar el total';
      default:
        return 'Reglamento oficial de la baraja española';
    }
  };

  const renderExpandedContent = () => {
    switch (gameType) {
      case 'escoba':
        return (
          <div className="space-y-3 pt-3 border-t border-amber-900/40 text-xs text-emerald-100/90 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950">
                <span className="font-bold text-amber-300 block mb-1">🎯 Objetivo (Sumar 15):</span>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  Combina 1 carta de tu mano con 1 o más cartas de la mesa para sumar 15. Gana quien primero alcance 15 o 21 puntos al terminar una mano.
                </p>
              </div>
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950">
                <span className="font-bold text-amber-300 block mb-1">🃏 Valor numérico de cartas:</span>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  <strong>As:</strong> 1 · <strong>2 al 7:</strong> Su valor · <strong>Sota:</strong> 8 · <strong>Caballo:</strong> 9 · <strong>Rey:</strong> 10 (ej. Rey [10] + 5 = 15).
                </p>
              </div>
            </div>

            {/* Los 5 Lances */}
            <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950 space-y-1.5">
              <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                ⭐ Los 5 Lances Oficiales (+1 punto cada uno):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                <div className="p-1.5 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200">1. Escobas (+1):</strong> Al sumar 15 y limpiar toda la mesa.
                </div>
                <div className="p-1.5 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200">2. Siete de Oros (+1):</strong> Quien capture el 7 de Oros.
                </div>
                <div className="p-1.5 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200">3. Mayoría de Oros (+1):</strong> Mínimo 6 oros de los 10 en juego (empate 5-5 no puntúa).
                </div>
                <div className="p-1.5 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200">4. Mayoría de Cartas (+1):</strong> Mínimo 21 cartas en 2 jugadores (empate a 20 no puntúa).
                </div>
                <div className="p-1.5 bg-[#092b19] rounded-lg border border-emerald-900/50 col-span-1 sm:col-span-2 lg:col-span-1">
                  <strong className="text-amber-200">5. La Setenta (+1):</strong> La mejor combinación sumando la carta más alta de cada palo (los 7 valen más).
                </div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-300/70">
              * La última baza se la lleva el último jugador que haya hecho baza. La mano rota en sentido antihorario/derecha.
            </p>
          </div>
        );

      case 'mus':
        return (
          <div className="space-y-3 pt-3 border-t border-amber-900/40 text-xs text-emerald-100/90 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950">
                <span className="font-bold text-amber-300 block mb-1">🎯 Modalidad y Amarracos:</span>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  Parejas de 2 vs 2 a 30 o 40 piedras. <strong>1 Amarraco = 5 piedras</strong>. Habitualmente 3 chicos ganados forman 1 Vaca completa.
                </p>
              </div>
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950">
                <span className="font-bold text-amber-300 block mb-1">💥 Envites y Órdago:</span>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  Envite mínimo de 2 piedras. Con el <strong>Órdago</strong> se apuesta el chico entero; si se acepta, se descubren las cartas en ese lance.
                </p>
              </div>
            </div>

            {/* 4 Lances */}
            <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950 space-y-1.5">
              <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                👑 Los 4 Lances en Orden Riguroso:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200 block">1. Grande</strong> Cartas de más valor (Reyes y Treses valen como Reyes).
                </div>
                <div className="p-2 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200 block">2. Chica</strong> Cartas de menor valor (Ases y Doses valen como Ases).
                </div>
                <div className="p-2 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200 block">3. Pares</strong> Par simple (+1 piedra), Medias/Trío (+2 piedras), Duples/2 Parejas (+3 piedras).
                </div>
                <div className="p-2 bg-[#092b19] rounded-lg border border-emerald-900/50">
                  <strong className="text-amber-200 block">4. Juego o Punto</strong> La mejor jugada es 31 (+3 piedras). De 32 a 40 (+2 piedras). Si nadie llega a 31: Punto (+1 piedra al más cercano a 30).
                </div>
              </div>
            </div>
          </div>
        );

      case 'chinchon':
        return (
          <div className="space-y-3 pt-3 border-t border-amber-900/40 text-xs text-emerald-100/90 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950">
                <span className="font-bold text-amber-300 block mb-1">Cierre Tradicional:</span>
                <p className="text-[11px] text-emerald-200/80">
                  6 cartas ligadas y 1 carta de 3 pts o menos para tirar boca abajo. Sumas el valor de esa carta.
                </p>
              </div>
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950">
                <span className="font-bold text-amber-300 block mb-1">Cerrar con 0 Pts:</span>
                <p className="text-[11px] text-emerald-200/80">
                  Ligar las 7 cartas (un trío y un cuarteto). Anotas 0 pts en la mano.
                </p>
              </div>
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950">
                <span className="font-bold text-amber-300 block mb-1">Cerrar con -10 Pts:</span>
                <p className="text-[11px] text-emerald-200/80">
                  Ligar las 7 cartas en escalera completa del mismo palo. ¡Restas 10 puntos de tu marcador!
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong className="text-amber-300">🔥 ¡Chinchón Directo!:</strong> Escalera de 7 cartas consecutivas sin comodín. ¡Victoria automática de la partida!
              </div>
              <div>
                <strong className="text-amber-300">🔄 Reenganche:</strong> Al superar los 101 pts (o 50), si quedan 2 o más vivos, puedes reengancharte con los puntos del jugador peor clasificado.
              </div>
            </div>
          </div>
        );

      case 'tute':
        return (
          <div className="space-y-3 pt-3 border-t border-amber-900/40 text-xs text-emerald-100/90 animate-in fade-in duration-150">
            <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950 space-y-1">
              <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                Valor de cartas (120 pts cartas + 10 de últimas = 130 pts totales):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] text-center">
                <div className="p-1 bg-[#092b19] rounded border border-emerald-900/60 font-bold text-amber-200">
                  As: 11 pts
                </div>
                <div className="p-1 bg-[#092b19] rounded border border-emerald-900/60 font-bold text-amber-200">
                  Tres: 10 pts
                </div>
                <div className="p-1 bg-[#092b19] rounded border border-emerald-900/60 font-bold text-amber-200">
                  Rey: 4 pts
                </div>
                <div className="p-1 bg-[#092b19] rounded border border-emerald-900/60 font-bold text-amber-200">
                  Caballo: 3 pts
                </div>
                <div className="p-1 bg-[#092b19] rounded border border-emerald-900/60 font-bold text-amber-200">
                  Sota: 2 pts
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#061e11] rounded-xl border border-amber-950">
                <strong className="text-amber-300 block">Las Cuarenta (+40 pts):</strong> Rey y Caballo del triunfo al ganar una baza.
              </div>
              <div className="p-2 bg-[#061e11] rounded-xl border border-amber-950">
                <strong className="text-amber-300 block">Las Veinte (+20 pts):</strong> Rey y Caballo de cualquier otro palo.
              </div>
              <div className="p-2 bg-[#061e11] rounded-xl border border-amber-950">
                <strong className="text-amber-300 block">Diez de Últimas (+10 pts):</strong> Ganar la última baza de la mano.
              </div>
              <div className="p-2 bg-[#061e11] rounded-xl border border-amber-950">
                <strong className="text-amber-300 block">¡Tute Directo!:</strong> Tener los 4 Reyes o los 4 Caballos proclama la victoria inmediata.
              </div>
            </div>
          </div>
        );

      case 'libre':
        return (
          <div className="space-y-3 pt-3 border-t border-amber-900/40 text-xs text-emerald-100/90 animate-in fade-in duration-150">
            <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950 space-y-1 text-[11px]">
              <span className="font-bold text-amber-300 block text-xs">Mesa Libre Universal:</span>
              <p className="text-emerald-200/80 leading-relaxed">
                Úsala para cualquier juego: <strong>Pocha, Brisca, Guiñote, Cinquillo, Continental, Truco, Remigio, Canasta</strong> o tus propias reglas.
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-300/80 pt-1">
                <li><strong>Modo Suma o Cuenta Atrás:</strong> Configúralo desde "Ajustes".</li>
                <li><strong>Pinchar en el número:</strong> Toca cualquier marcador para escribir el número que quieras como en unas notas.</li>
                <li><strong>Teclado táctil:</strong> Pulsa el icono de calculadora para sumar o restar rápidamente sin tapar la pantalla.</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[#072415] rounded-xl border border-amber-900/50 shadow-md overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getGameIcon()}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-200 font-deck">
                Normas de la partida:
              </span>
              <span className="text-[10px] text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40 font-semibold">
                Oficial
              </span>
            </div>
            {!isExpanded && (
              <p className="text-[11px] text-emerald-300/80 truncate mt-0.5">
                {getQuickSummary()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenFullRules && (
            <button
              type="button"
              onClick={onOpenFullRules}
              className="min-h-[34px] px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:text-amber-100 bg-[#0a311c] hover:bg-emerald-800 rounded-lg border border-amber-900/40 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
              title="Abrir reglamento detallado completo"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reglamento completo</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleExpand}
            className="min-h-[34px] px-2.5 py-1 text-[11px] font-semibold text-emerald-200 hover:text-amber-200 bg-[#051c0f] hover:bg-emerald-950 rounded-lg border border-amber-950 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
            title={isExpanded ? 'Ocultar normas' : 'Mostrar normas detalladas'}
          >
            <span>{isExpanded ? 'Ocultar' : 'Ver normas'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          {renderExpandedContent()}
          {onOpenFullRules && (
            <div className="mt-3 pt-2 border-t border-amber-950 flex justify-end">
              <button
                type="button"
                onClick={onOpenFullRules}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Consultar el libro de reglas oficial al completo</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
