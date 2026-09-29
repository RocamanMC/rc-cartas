import React, { useState, useEffect } from 'react';
import { X, Award, HelpCircle, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameType } from '../types';
import { OrosIcon, CopasIcon, EspadasIcon, BastosIcon } from './SpanishDeckIcons';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: GameType;
  onOpenMoreGames?: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, initialTab = 'escoba', onOpenMoreGames }) => {
  const [activeTab, setActiveTab] = useState<GameType>(initialTab === 'perfiles' ? 'escoba' : initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'perfiles' ? 'escoba' : initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a2b1b] border-2 border-amber-600/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-900/50 bg-[#072013]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-200 font-deck leading-tight">
                Reglamento y Tanteo Oficial
              </h2>
              <p className="text-[11px] text-emerald-300/70">
                Normas de la baraja española tradicional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-950/60 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game tabs */}
        <div className="flex items-center justify-between border-b border-amber-950/80 bg-[#061c10] px-3 gap-1 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 shrink-0">
            {[
              { id: 'escoba', label: 'Escoba del 15', icon: <OrosIcon className="w-3.5 h-3.5" /> },
              { id: 'mus', label: 'Mus', icon: <CopasIcon className="w-3.5 h-3.5" /> },
              { id: 'chinchon', label: 'Chinchón', icon: <EspadasIcon className="w-3.5 h-3.5" /> },
              { id: 'tute', label: 'Tute', icon: <BastosIcon className="w-3.5 h-3.5" /> },
              { id: 'libre', label: 'Mesa Libre', icon: <Sparkles className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GameType)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold'
                    : 'border-transparent text-emerald-200/60 hover:text-amber-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          {onOpenMoreGames && (
            <button
              onClick={() => {
                onClose();
                onOpenMoreGames();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 rounded-lg whitespace-nowrap cursor-pointer my-1 shadow-sm shrink-0 ml-2"
              title="Abrir catálogo completo de más juegos y sus normas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Más Juegos</span>
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
          {/* ===================== ESCOBA DEL 15 ===================== */}
          {activeTab === 'escoba' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/50 border border-amber-700/40 rounded-xl">
                <h3 className="font-semibold text-amber-300 font-deck mb-1 flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-amber-400" /> Objetivo del Juego
                </h3>
                <p className="text-xs text-emerald-100/90">
                  El objetivo es sumar <strong>exactamente 15</strong> combinando 1 carta de tu mano con 1 o más cartas del tapete. Se suele jugar a una meta de <strong>15 o 21 puntos</strong>. Gana quien primero alcance o supere la meta al final de una mano completa.
                </p>
              </div>

              {/* Valores de las cartas */}
              <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Valor numérico de las cartas (para sumar 15):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-1.5 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-200 font-bold">As:</span> 1 punto
                  </div>
                  <div className="p-1.5 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-200 font-bold">2 al 7:</span> Su valor
                  </div>
                  <div className="p-1.5 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-200 font-bold">Sota (10):</span> 8 puntos
                  </div>
                  <div className="p-1.5 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-200 font-bold">Caballo (11):</span> 9 puntos
                  </div>
                  <div className="p-1.5 bg-[#0a2f1b] rounded border border-emerald-900/60 col-span-2 sm:col-span-4">
                    <span className="text-amber-200 font-bold">Rey (12):</span> 10 puntos (ejemplo: Rey [10] + 5 = 15)
                  </div>
                </div>
              </div>

              {/* Tanteo al final de cada mano */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Los 5 Lances que Puntúan al Final de la Mano:
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300">1. Escobas (+1 punto cada una):</strong> Cuando un jugador suma 15 levantando <em>todas</em> las cartas que había sobre el tapete. Se deja una carta cruzada para contarlas.
                  </li>
                  <li className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60 flex items-start gap-2">
                    <OrosIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">2. El Siete de Oros (+1 punto):</strong> El jugador que haya ganado el <strong>7 de Oros</strong> en sus bazas.
                    </div>
                  </li>
                  <li className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300">3. Mayoría de Oros (+1 punto):</strong> Quien tenga más cartas del palo de oros. En baraja de 40 cartas, hay 10 oros. Debe tener al menos 6 oros. Si empatan (5 a 5), no puntúa nadie.
                  </li>
                  <li className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300">4. Mayoría de Cartas (+1 punto):</strong> Quien haya acumulado más cartas en total (al menos 21 cartas en partidas de 2). En caso de empate a 20, no se anota.
                  </li>
                  <li className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300">5. La Setenta (+1 punto):</strong> Quien tenga la mejor combinación sumando su carta más alta de cada uno de los 4 palos (los 7 valen más, seguidos de 6, As, 5...). En caso de empate no suma nadie.
                  </li>
                </ul>
              </div>

              {/* Baza final y mano */}
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950 text-xs text-emerald-300/80">
                <span className="font-bold text-amber-200">Última baza:</span> Las cartas que queden en la mesa al terminar la última ronda se las lleva el último jugador que haya hecho baza (no cuenta como escoba). El turno de ser "Mano" rota a la derecha en cada mano.
              </div>
            </div>
          )}

          {/* ===================== MUS ===================== */}
          {activeTab === 'mus' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/50 border border-amber-700/40 rounded-xl">
                <h3 className="font-semibold text-amber-300 font-deck mb-1 flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-amber-400" /> El Arte del Mus y los Amarracos
                </h3>
                <p className="text-xs text-emerald-100/90">
                  Se juega en parejas de 2 contra 2. Se pacta a <strong>30 o 40 tantos</strong> (piedras). Quien gana un chico anota 1 juego; habitualmente <strong>3 chicos forman 1 Vaca</strong>.
                  <br />
                  <strong>1 Amarraco = 5 piedras</strong>. Se usan garbanzos o monedas para llevar la cuenta sin errores.
                </p>
              </div>

              {/* Los 4 lances en orden */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Los 4 Lances en Orden Riguroso:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">1. Grande</strong>
                    Gana quien tenga las cartas de mayor valor (Reyes y Treses valen igual como Reyes). Si se pasa sin envites: +1 piedra al recoger.
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">2. Chica</strong>
                    Gana quien tenga las cartas más bajas (Ases y Doses valen igual como Ases). Si nadie entra: +1 piedra al recoger.
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">3. Pares</strong>
                    Primero se pregunta si hay pares. Quien gane suma según los pares de su pareja:
                    <ul className="list-disc list-inside mt-1 text-[11px] text-emerald-200/80">
                      <li>Par simple: +1 piedra</li>
                      <li>Medias (trío): +2 piedras</li>
                      <li>Duples (2 parejas): +3 piedras</li>
                    </ul>
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">4. Juego o Punto</strong>
                    Sumando el valor de las 4 cartas (Figuras=10):
                    <ul className="list-disc list-inside mt-1 text-[11px] text-emerald-200/80">
                      <li>El mejor juego es <strong>31</strong> (+3 piedras).</li>
                      <li>Luego 32, 40, 37, 36, 35, 34 (+2 piedras).</li>
                      <li>Si nadie llega a 31, hay <strong>Punto</strong> (gana el más cercano a 30, +1 piedra).</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Envites y Órdago */}
              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-600/40 text-xs space-y-1.5">
                <span className="font-bold text-amber-300 block">El Órdago y los Envites:</span>
                <p className="text-emerald-100/80">
                  Un <strong>Envite</strong> mínimo son 2 piedras ("envido"). Si el rival no quiere, el que envidó se lleva 1 piedra inmediatamente ("al no").
                </p>
                <p className="text-amber-200 font-semibold">
                  ¡Órdago!: Se apuesta todo el chico en ese lance concreto. Si se acepta ("quiero"), se paran las cartas y se enseñan inmediatamente. La pareja con mejor jugada en ese lance gana el chico completo.
                </p>
              </div>

              {/* Señas permitidas */}
              <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 text-xs">
                <span className="font-bold text-amber-300 block mb-1">Señas Tradicionales del Mus:</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-emerald-200/80">
                  <div>· Morder labio inferior: <strong>2 Ases</strong></div>
                  <div>· Sacar punta de lengua: <strong>2 Reyes</strong></div>
                  <div>· Guiñar un ojo: <strong>31 al Juego</strong></div>
                  <div>· Fruncir los labios / beso: <strong>Duples</strong></div>
                  <div>· Torcer la boca a un lado: <strong>Medias</strong></div>
                  <div>· Levantar las cejas: <strong>32 al Juego</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== CHINCHÓN ===================== */}
          {activeTab === 'chinchon' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/50 border border-amber-700/40 rounded-xl">
                <h3 className="font-semibold text-amber-300 font-deck mb-1 flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-amber-400" /> Dinámica del Chinchón
                </h3>
                <p className="text-xs text-emerald-100/90">
                  Cada jugador recibe 7 cartas. El objetivo es ligar todas las cartas en series (mínimo 3 cartas del mismo número) o escaleras del mismo palo. Al final de la mano, los puntos de las cartas sin ligar se <strong>suman al marcador personal</strong>. Al superar los <strong>101 puntos</strong> (o 50), el jugador queda eliminado. ¡Gana el último superviviente!
                </p>
              </div>

              {/* Opciones de cierre */}
              <div className="space-y-2 text-xs">
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Condiciones para Cerrar la Mano:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">Cierre Tradicional</strong>
                    Tener 6 cartas ligadas y 1 carta suelta de 3 o menos puntos (o 5 según variantes). Esa carta se coloca boca abajo en el descarte y sumas los puntos de la carta suelta.
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">Cerrar con 0 Puntos</strong>
                    Ligar las 7 cartas (ej. un trío y un cuarteto). Anotas <strong>0 puntos</strong> en esa mano, mientras los rivales suman todos sus puntos no ligados.
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">Cerrar con -10 Puntos</strong>
                    Ligar las 7 cartas en una <strong>escalera completa de 7</strong> (o dos combinaciones cerradas según mesa). ¡Restas <strong>10 puntos</strong> de tu marcador!
                  </div>
                </div>
              </div>

              {/* El Chinchon y Reenganche */}
              <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-2 text-xs">
                <div>
                  <strong className="text-amber-300 flex items-center gap-1">
                    <span>🔥</span> ¡Chinchón Directo!:
                  </strong>
                  <p className="text-emerald-100/80 mt-0.5">
                    Hacer una escalera de 7 cartas consecutivas del mismo palo (ej. As, 2, 3, 4, 5, 6, 7). Si se logra <em>sin comodín</em>, <strong>gana la partida inmediatamente</strong> independientemente de los puntos que lleven los demás.
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-950/80">
                  <strong className="text-amber-300 flex items-center gap-1">
                    <span>🔄</span> Regla del Reenganche:
                  </strong>
                  <p className="text-emerald-100/80 mt-0.5">
                    Cuando un jugador supera los 101 puntos queda eliminado, pero si quedan 2 o más jugadores vivos, tiene la opción de <strong>reengancharse</strong>: vuelve al juego asignándose la puntuación del jugador vivo que más puntos tenga en ese momento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TUTE ===================== */}
          {activeTab === 'tute' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/50 border border-amber-700/40 rounded-xl">
                <h3 className="font-semibold text-amber-300 font-deck mb-1 flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-amber-400" /> Bazas y Cantos del Tute
                </h3>
                <p className="text-xs text-emerald-100/90">
                  Juego de bazas por parejas o individual. El objetivo es alcanzar los tantos acordados (habitualmente <strong>101 puntos</strong> o ganar un número fijo de juegos/chicos). Hay 120 puntos en juego en las cartas + 10 de últimas = <strong>130 puntos por mano</strong> más los cánticos.
                </p>
              </div>

              {/* Valor de las cartas en el Tute */}
              <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Valor de las cartas en las bazas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                  <div className="p-2 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-300 font-bold block">As</span> 11 pts
                  </div>
                  <div className="p-2 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-300 font-bold block">Tres</span> 10 pts
                  </div>
                  <div className="p-2 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-300 font-bold block">Rey</span> 4 pts
                  </div>
                  <div className="p-2 bg-[#0a2f1b] rounded border border-emerald-900/60">
                    <span className="text-amber-300 font-bold block">Caballo</span> 3 pts
                  </div>
                  <div className="p-2 bg-[#0a2f1b] rounded border border-emerald-900/60 col-span-2 sm:col-span-1">
                    <span className="text-amber-300 font-bold block">Sota</span> 2 pts
                  </div>
                </div>
                <p className="text-[11px] text-emerald-400/60 mt-1">
                  Las cartas blancas (2, 4, 5, 6, 7) no tienen valor en puntos pero sirven para ganar bazas.
                </p>
              </div>

              {/* Los Cánticos */}
              <div className="space-y-2 text-xs">
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Cánticos tras ganar una baza:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-0.5">Las Cuarenta (+40 puntos)</strong>
                    Poseer el <strong>Rey y el Caballo</strong> del palo del triunfo. Se cantan inmediatamente tras ganar tu primera baza.
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-0.5">Las Veinte (+20 puntos)</strong>
                    Poseer el <strong>Rey y el Caballo</strong> de cualquiera de los otros tres palos (no triunfo).
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-0.5">Diez de Últimas (+10 puntos)</strong>
                    Llevarse la última baza de la mano. Se suman al total de cartas recogidas.
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-0.5">¡Tute de Reyes o Caballos!</strong>
                    Tener los 4 Reyes o los 4 Caballos. Proclama la <strong>victoria inmediata</strong> de la mano o partida.
                  </div>
                </div>
              </div>

              {/* Obligaciones del juego */}
              <div className="p-2.5 bg-[#061e11] rounded-xl border border-amber-950 text-xs text-emerald-300/80">
                <strong className="text-amber-200">Leyes del arrastre:</strong> Es obligatorio <em>asistir</em> al palo de salida, <em>montar</em> (superar la carta con una más alta si la tienes) y <em>fallar</em> con triunfo si no tienes del palo jugado.
              </div>
            </div>
          )}

          {/* ===================== MESA LIBRE ===================== */}
          {activeTab === 'libre' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-950/50 border border-amber-700/40 rounded-xl">
                <h3 className="font-semibold text-amber-300 font-deck mb-1 text-sm">
                  Anotador Universal para Cualquier Juego
                </h3>
                <p className="text-emerald-100/90">
                  La Mesa Libre te permite llevar el tanteo de cualquier juego de naipes de la baraja española o internacional: <strong>Pocha, Brisca, Guiñote, Cinquillo, Continental, Truco, Cuarenta, Continental, Remigio, Canasta</strong> y muchos más.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Opciones Disponibles:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">Por Suma Acumulativa</strong>
                    Los jugadores empiezan en 0 y van acumulando puntos. Gana quien primero alcance el objetivo fijado (ej. 100 puntos en Brisca).
                  </div>
                  <div className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60">
                    <strong className="text-amber-300 block mb-1">Por Cuenta Atrás</strong>
                    Los jugadores empiezan con una cantidad fija de puntos (ej. 501 o 50) y se les van restando los puntos.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#061e11] rounded-xl border border-amber-950 space-y-1.5">
                <strong className="text-amber-300 block">Herramientas en Mesa Libre:</strong>
                <ul className="list-disc list-inside space-y-1 text-emerald-200/80">
                  <li><strong>Teclado táctil rápido:</strong> Pulsa el icono de calculadora para abrir el teclado numérico de pantalla sin que salte el teclado del móvil.</li>
                  <li><strong>Pinchar en el número:</strong> Toca directamente sobre cualquier puntuación para escribir la cifra exacta que quieras como en unas notas.</li>
                  <li><strong>Ajustes de partida:</strong> Cambia el título de la partida y la puntuación meta en cualquier momento desde el botón de ajustes.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-amber-900/50 bg-[#072013] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {onOpenMoreGames ? (
            <button
              onClick={() => {
                onClose();
                onOpenMoreGames();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver normas de más juegos (El Culo, Brisca, Guiñote, Pocha, Cinquillo...)</span>
            </button>
          ) : (
            <span className="text-[11px] text-emerald-300/60 hidden sm:inline">
              El Tantador Español · Baraja de 40 cartas
            </span>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow cursor-pointer font-deck"
          >
            Entendido, volver a la partida
          </button>
        </div>
      </div>
    </div>
  );
};
