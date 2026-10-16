import { useModalAccessibility } from '../utils/useModalAccessibility';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BookOpen, Trash2, Calendar, Search, Edit3, Check, Feather, BarChart3, Flame, Droplets, Wind, Mountain, Layers, Star } from './icons/ArcaneIcons';
import { CardArt } from './CardArt';
import { historyService } from '../utils/history';
import { audio } from '../utils/audio';

export const ReadingHistoryModal = ({ 
  isOpen, 
  onClose, 
  onOpenCardDetail 
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  const [readings, setReadings] = useState(() => historyService.getReadings());
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'stats'
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [selectedReading, setSelectedReading] = useState(null);

  // Synchronize readings dynamically on open and whenever a new reading is saved
  useEffect(() => {
    const refresh = () => setReadings(historyService.getReadings());
    if (isOpen) {
      refresh();
    }
    window.addEventListener('lumina_history_updated', refresh);
    return () => window.removeEventListener('lumina_history_updated', refresh);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  const stats = historyService.getReadingStats();

  const handleDelete = (id, e) => {
    e.stopPropagation();
    audio.playRemoveCard();
    const updated = historyService.deleteReading(id);
    setReadings(updated);
    if (selectedReading?.id === id) {
      setSelectedReading(null);
    }
  };

  const handleStartEdit = (reading, e) => {
    e.stopPropagation();
    setEditingId(reading.id);
    setEditingText(reading.notes || '');
  };

  const handleSaveNotes = (id, e) => {
    e.stopPropagation();
    audio.playSelect();
    const updated = historyService.updateReadingNotes(id, editingText);
    setReadings(updated);
    setEditingId(null);
  };

  const filteredReadings = readings.filter(r => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchQuestion = r.userQuestion?.toLowerCase().includes(query);
    const matchSpread = r.spreadName?.toLowerCase().includes(query);
    const matchCards = r.cards?.some(c => c.name?.toLowerCase().includes(query));
    const matchNotes = r.notes?.toLowerCase().includes(query);
    return matchQuestion || matchSpread || matchCards || matchNotes;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Outer Click Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <motion.div 
        ref={modalRef}
        aria-label="Diário de leituras"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-sm glass-panel border border-amber-500/40 shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-300">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-lg sm:text-2xl font-bold text-slate-100 gold-gradient-text">
              Diário Oracular & Autoconhecimento
            </h3>
          </div>

          <button
            type="button"
            aria-label="Fechar" onClick={handleClose}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Diário vs Estatísticas) */}
        <div className="my-3.5 flex items-center gap-2 border-b border-stone-900/40 pb-2">
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setActiveTab('journal');
            }}
            className={`px-4 py-2 rounded-sm text-xs font-cinzel font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Diário de Leituras ({readings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setActiveTab('stats');
            }}
            className={`px-4 py-2 rounded-sm text-xs font-cinzel font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Estatísticas & Autoconhecimento</span>
          </button>
        </div>

        {/* Tab 1: Diário de Leituras */}
        {activeTab === 'journal' && (
          <>
            {/* Search & Filter Bar */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por carta, pergunta, tiragem ou notas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-sm bg-slate-950/70 border border-amber-500/30 focus:border-amber-400/70 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>

            {/* Main List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {readings.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-cinzel">
                  <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm font-semibold">Seu Diário Oracular está vazio.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Ao concluir uma tiragem no altar, ela será gravada aqui para você revisitar suas reflexões.
                  </p>
                </div>
              ) : filteredReadings.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-cinzel text-xs">
                  Nenhuma leitura encontrada para a busca informada.
                </div>
              ) : (
                filteredReadings.map((reading) => {
                  const isSelected = selectedReading?.id === reading.id;
                  const isEditing = editingId === reading.id;

                  return (
                    <motion.div
                      key={reading.id}
                      layout
                      className={`rounded-sm border transition-all p-4 ${
                        isSelected 
                          ? 'bg-stone-950/50 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                          : 'bg-slate-950/60 border-amber-500/20 hover:border-amber-500/40'
                      }`}
                    >
                      {/* Top Row: Spread name, Date & Delete */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-cinzel font-bold text-amber-300">
                            {reading.deckName || 'Tarot'} · {reading.spreadName}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {reading.formattedDate}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(reading.id, e)}
                          title="Excluir leitura"
                          className="p-1.5 rounded-sm text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Question / Intention */}
                      {reading.userQuestion && (
                        <p className="text-xs sm:text-sm text-amber-200 font-serif italic mb-3">
                          "{reading.userQuestion}"
                        </p>
                      )}

                      {/* Cards Mini Thumbnails */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 my-2">
                        {reading.cards?.map((card, idx) => (
                          <button type="button" aria-label={`Ver detalhes de ${card.name}`}
                            key={idx}
                            onClick={() => onOpenCardDetail && onOpenCardDetail(card)}
                            className="p-2 rounded-sm bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 cursor-pointer flex flex-col items-center text-center transition-all group"
                          >
                            <span className="text-[9px] text-amber-400/80 font-cinzel truncate w-full mb-1">
                              {card.positionName}
                            </span>
                            <div className="w-16 aspect-[7/12] my-1 pointer-events-none group-hover:scale-105 transition-transform">
                              <CardArt card={card} isMini={true} showKeywords={false} />
                            </div>
                            <span className="text-[10px] font-cinzel font-bold text-slate-200 truncate w-full">
                              {card.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Saved Oracle Synthesis & AI Response */}
                      {(reading.aiReading || reading.oracleSynthesis) && (
                        <div className="mt-3 p-3 sm:p-4 rounded-sm bg-stone-950/40 border border-amber-500/30 text-left">
                          <div className="flex items-center gap-1.5 text-amber-300 font-cinzel text-xs font-bold mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Revelação do Oráculo:</span>
                          </div>

                          {reading.aiReading?.diagnosis ? (
                            <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
                              <p><strong className="text-amber-300 font-cinzel text-[11px] block">🌌 Diagnóstico:</strong> {reading.aiReading.diagnosis}</p>
                              <p><strong className="text-amber-300 font-cinzel text-[11px] block">🔮 Forças Ocultas:</strong> {reading.aiReading.dynamics}</p>
                              <p className="p-2 rounded-sm bg-slate-900/80 border border-amber-500/20 text-amber-100 italic">
                                <strong className="text-amber-300 font-cinzel text-[11px] not-italic block mb-0.5">🗝️ Conselho Sagrado:</strong>
                                "{reading.aiReading.advice}"
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                              {reading.oracleSynthesis || reading.aiReading?.text}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Notes Section */}
                      <div className="mt-3 pt-3 border-t border-stone-900/30 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-cinzel font-semibold text-slate-400 flex items-center gap-1">
                            <Feather className="w-3 h-3 text-amber-400" />
                            Anotações Pessoais:
                          </span>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={(e) => handleStartEdit(reading, e)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{reading.notes ? 'Editar' : 'Adicionar Nota'}</span>
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              placeholder="Digite suas percepções, sentimentos ou insights sobre esta tiragem..."
                              className="flex-1 px-3 py-1.5 rounded-sm bg-slate-900 border border-amber-400/50 text-xs text-slate-100 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={(e) => handleSaveNotes(reading.id, e)}
                              className="px-3 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Salvar</span>
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300 italic">
                            {reading.notes || <span className="text-slate-600 not-italic">Nenhuma anotação inserida.</span>}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Tab 2: Estatísticas & Autoconhecimento */}
        {activeTab === 'stats' && (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 animate-fade-in">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-sm bg-stone-950/50 border border-amber-500/30 text-center">
                <span className="text-2xl sm:text-3xl font-cinzel font-bold text-amber-300">
                  {stats.totalReadings}
                </span>
                <span className="block text-[11px] font-cinzel text-slate-400 mt-1">
                  Tiragens Realizadas
                </span>
              </div>

              <div className="p-4 rounded-sm bg-stone-950/50 border border-amber-500/30 text-center">
                <span className="text-2xl sm:text-3xl font-cinzel font-bold text-amber-300">
                  {stats.totalCardsDrawn}
                </span>
                <span className="block text-[11px] font-cinzel text-slate-400 mt-1">
                  Cartas Consagradas
                </span>
              </div>

              <div className="p-4 rounded-sm bg-stone-950/50 border border-amber-500/30 text-center">
                <span className="text-2xl sm:text-3xl font-cinzel font-bold text-amber-400">
                  {stats.elementalPercentages.major}%
                </span>
                <span className="block text-[11px] font-cinzel text-slate-400 mt-1">
                  Arcanos Maiores
                </span>
              </div>

              <div className="p-4 rounded-sm bg-stone-950/50 border border-amber-500/30 text-center">
                <span className="text-2xl sm:text-3xl font-cinzel font-bold text-emerald-400">
                  {stats.topCards[0]?.name?.split(' ')[1] || stats.topCards[0]?.name || '—'}
                </span>
                <span className="block text-[11px] font-cinzel text-slate-400 mt-1 truncate">
                  Arcano Guia Dominante
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-200">Baralho Cigano: {stats.elementalCounts.lenormand || 0} cartas no histórico. As demais categorias representam o Tarot.</p>
            {/* Top 5 Most Frequent Cards */}
            <div className="p-5 rounded-sm bg-slate-950/70 border border-amber-500/25">
              <h4 className="font-cinzel text-sm font-bold text-amber-200 flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Seus 5 Arcanos Mais Frequentes</span>
              </h4>

              {stats.topCards.length === 0 ? (
                <p className="text-xs text-slate-500 font-cinzel text-center py-4">
                  Realize tiragens no altar para traçar seu mapa arquetípico.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topCards.map((c, i) => {
                    const pct = Math.round((c.count / stats.totalCardsDrawn) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-cinzel">
                          <span className="text-slate-200 flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold">{i + 1}.</span>
                            <span>{c.name} · {c.arcana === 'Lenormand' ? 'Cigano' : 'Tarot'}</span>
                          </span>
                          <span className="text-amber-300 font-semibold">
                            {c.count}x ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300"
                            style={{ width: `${Math.min(pct * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Elemental Balance */}
            <div className="p-5 rounded-sm bg-slate-950/70 border border-amber-500/25">
              <h4 className="font-cinzel text-sm font-bold text-amber-200 flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Balanço Elemental da Sua Jornada</span>
              </h4>

              <div className="space-y-3 text-xs font-cinzel">
                {/* Fogo (Paus) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-orange-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-400" /> Fogo / Paus (Ação & Vontade)
                    </span>
                    <span className="text-orange-300 font-bold">{stats.elementalPercentages.wands}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${stats.elementalPercentages.wands}%` }} />
                  </div>
                </div>

                {/* Água (Copas) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-cyan-300 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Água / Copas (Emoções & Intuição)
                    </span>
                    <span className="text-cyan-300 font-bold">{stats.elementalPercentages.cups}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${stats.elementalPercentages.cups}%` }} />
                  </div>
                </div>

                {/* Ar (Espadas) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-slate-400" /> Ar / Espadas (Mente & Verdade)
                    </span>
                    <span className="text-slate-300 font-bold">{stats.elementalPercentages.swords}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full rounded-full bg-slate-400" style={{ width: `${stats.elementalPercentages.swords}%` }} />
                  </div>
                </div>

                {/* Terra (Ouros) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-300 flex items-center gap-1.5">
                      <Mountain className="w-3.5 h-3.5 text-emerald-400" /> Terra / Ouros (Matéria & Realização)
                    </span>
                    <span className="text-emerald-300 font-bold">{stats.elementalPercentages.pentacles}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.elementalPercentages.pentacles}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
