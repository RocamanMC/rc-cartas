import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Sparkles, ChevronDown, ChevronUp, Play, Users, Layers, Award, Lightbulb, ShieldCheck } from 'lucide-react';
import { EXTRA_GAMES_RULES, ExtraGameRule } from '../data/extraGamesRules';
import { sounds } from '../utils/sound';

interface MoreGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayInLibre?: (title: string, targetScore: number, isCountdown: boolean) => void;
}

export const MoreGamesModal: React.FC<MoreGamesModalProps> = ({ isOpen, onClose, onPlayInLibre }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los juegos' },
    { id: 'bazas', label: 'Bazas y Triunfos' },
    { id: 'descarte', label: 'Descarte y Ligas' },
    { id: 'apuestas', label: 'Farol y Apuestas' },
    { id: 'familia', label: 'Fiesta y Reflejos' },
  ];

  const filteredGames = useMemo(() => {
    return EXTRA_GAMES_RULES.filter((game) => {
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.subtitle.toLowerCase().includes(q) ||
        game.objective.toLowerCase().includes(q) ||
        game.categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    sounds.playTap();
    setExpandedGameId((prev) => (prev === id ? null : id));
  };

  const handleLaunchLibre = (game: ExtraGameRule) => {
    sounds.playCardFlick();
    if (onPlayInLibre) {
      onPlayInLibre(game.title, game.suggestedTargetScore || 0, !!game.isCountdown);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0a2b1b] border-2 border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-900/50 bg-[#072013]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-inner">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-amber-200 font-deck leading-tight flex items-center gap-2">
                Más Juegos y Normas
                <span className="text-xs font-sans font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {EXTRA_GAMES_RULES.length} juegos
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-300/80">
                Reglamentos oficiales de la baraja española con puntuación y consejos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-emerald-300/70 hover:text-amber-200 hover:bg-emerald-950/60 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Category Filter Toolbar */}
        <div className="p-3 sm:px-5 border-b border-amber-950/80 bg-[#061c10] space-y-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar juego (ej. El Culo, Brisca, Pocha, Cinquillo, Truco...)"
              className="w-full pl-9 pr-8 py-2 bg-[#092e1b] border border-emerald-800/60 focus:border-amber-400 rounded-xl text-xs sm:text-sm text-emerald-100 placeholder-emerald-400/50 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-amber-300 text-xs cursor-pointer p-1"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedCategory(cat.id);
                }}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-amber-950 font-bold shadow'
                    : 'bg-[#092b19] text-emerald-200/80 hover:bg-[#0e3b23] hover:text-amber-200 border border-emerald-900/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm leading-relaxed scrollbar-thin">
          {filteredGames.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto" />
              <p className="text-emerald-200 font-semibold text-sm">
                No se encontraron juegos con "{searchQuery}"
              </p>
              <p className="text-emerald-300/60 text-xs">
                Prueba con otro nombre o pulsa en "Todos los juegos"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 px-4 py-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg text-xs hover:bg-amber-400/30 transition-colors cursor-pointer"
              >
                Mostrar todos los juegos
              </button>
            </div>
          ) : (
            filteredGames.map((game) => {
              const isExpanded = expandedGameId === game.id;
              return (
                <div
                  key={game.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-[#072415] border-amber-500/70 shadow-lg ring-1 ring-amber-500/20'
                      : 'bg-[#072013]/90 border-emerald-900/70 hover:border-amber-600/50'
                  }`}
                >
                  {/* Card Header Summary */}
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-amber-200 font-deck">
                            {game.title}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                            {game.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-amber-100/70 mt-0.5">
                          {game.subtitle}
                        </p>
                      </div>

                      {/* Quick Meta Badges & Action Buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                        {onPlayInLibre && (
                          <button
                            onClick={() => handleLaunchLibre(game)}
                            className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-transform active:scale-95 shadow cursor-pointer font-deck"
                            title={`Abrir Mesa Libre para anotar ${game.title}`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Puntuar</span>
                          </button>
                        )}
                        <button
                          onClick={() => toggleExpand(game.id)}
                          className="min-h-[36px] flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-200 bg-[#0a2f1b] hover:bg-[#0f4427] hover:text-amber-200 rounded-lg border border-emerald-800/70 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Ocultar normas' : 'Ver normas'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Specs (Players & Deck) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2.5 pt-2.5 border-t border-emerald-950 text-[11px] text-emerald-300/80">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Jugadores:</strong> {game.players}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Baraja:</strong> {game.deck}</span>
                      </div>
                    </div>

                    {/* Short Objective */}
                    <p className="text-xs text-emerald-100/90 mt-2 bg-[#051c10] p-2 rounded-lg border border-emerald-950">
                      <strong className="text-amber-300">🎯 Objetivo:</strong> {game.objective}
                    </p>
                  </div>

                  {/* Expanded Full Rules Section */}
                  {isExpanded && (
                    <div className="px-3 pb-4 sm:px-4 space-y-3.5 border-t border-amber-900/40 bg-[#051a0e] pt-3 text-xs animate-in fade-in duration-150">
                      {/* Card values if defined */}
                      {game.cardValues && game.cardValues.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                            Valor y jerarquía de las cartas:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-[11px]">
                            {game.cardValues.map((cv, idx) => (
                              <div
                                key={idx}
                                className="p-2 sm:p-1.5 bg-[#092c1a] rounded-lg border border-emerald-900/60 flex items-center justify-between gap-2"
                              >
                                <span className="font-semibold text-amber-200">{cv.card}</span>
                                <span className="text-emerald-300/80 text-right shrink-0">{cv.points}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step by step rules */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                          Cómo se juega (paso a paso):
                        </span>
                        <div className="space-y-2">
                          {game.rules.map((r, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-[#082215] rounded-xl border border-emerald-900/60"
                            >
                              <strong className="text-amber-200 block mb-0.5 text-xs">
                                {idx + 1}. {r.heading}
                              </strong>
                              <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                                {r.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Scoring & Winning */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-[#062012] rounded-xl border border-amber-900/50 space-y-1">
                          <strong className="text-amber-300 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-400" /> Tanteo y Puntuación:
                          </strong>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-200/80">
                            {game.scoring.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-2.5 bg-[#062012] rounded-xl border border-amber-900/50 space-y-1">
                          <strong className="text-amber-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cómo Ganar:
                          </strong>
                          <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                            {game.howToWin}
                          </p>
                        </div>
                      </div>

                      {/* Strategic Tips */}
                      {game.tips && game.tips.length > 0 && (
                        <div className="p-2.5 bg-[#092a19] rounded-xl border border-emerald-800/50 space-y-1">
                          <strong className="text-amber-300 flex items-center gap-1 text-[11px]">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Consejos y picardía:
                          </strong>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-200/80">
                            {game.tips.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Launch button inside expanded section */}
                      {onPlayInLibre && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-300/60">
                            Sugerencia de partida: {game.suggestedTargetScore ? `${game.suggestedTargetScore} pts` : 'Libre'}
                          </span>
                          <button
                            onClick={() => handleLaunchLibre(game)}
                            className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow flex items-center gap-1.5 cursor-pointer font-deck"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Abrir tanteador para {game.title}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-amber-900/50 bg-[#072013] flex items-center justify-between">
          <span className="text-[11px] text-emerald-300/60 hidden sm:inline">
            El Tantador Español · Gran enciclopedia de naipes
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow cursor-pointer font-deck"
          >
            Cerrar lista de juegos
          </button>
        </div>
      </div>
    </div>
  );
};
