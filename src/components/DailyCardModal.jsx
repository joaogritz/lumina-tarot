import { useModalAccessibility } from '../utils/useModalAccessibility';
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Flame, Bell, Check } from './icons/ArcaneIcons';
import { CardArt } from './CardArt';
import { TAROT_DECK, SUITS } from '../data/tarotDeck';
import { audio } from '../utils/audio';

export const DailyCardModal = ({ 
  cards = TAROT_DECK,
  isOpen, 
  onClose, 
  onOpenCardDetail 
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });
  const [notifyFeedback, setNotifyFeedback] = useState(null);

  // Deterministic Daily Seed calculation & Daily Streak tracking (Top-level Hook)
  const { dailyCard, streak } = useMemo(() => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Hash function for date string
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    
    const index = Math.abs(hash) % cards.length;
    const card = cards[index];

    // Compute Streak
    let currentStreak = 1;
    try {
      const lastDate = localStorage.getItem('lumina_last_daily_date');
      const savedStreak = parseInt(localStorage.getItem('lumina_daily_streak') || '0', 10);
      
      if (lastDate === dateStr) {
        currentStreak = Math.max(1, savedStreak);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        
        if (lastDate === yStr) {
          currentStreak = savedStreak + 1;
        } else {
          currentStreak = 1;
        }
        if (isOpen) localStorage.setItem('lumina_last_daily_date', dateStr);
        if (isOpen) localStorage.setItem('lumina_daily_streak', String(currentStreak));
      }
    } catch (e) {}

    return { dailyCard: card, streak: currentStreak };
  }, [cards, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  const handleToggleNotifications = async () => {
    audio.playSelect();
    if (!('Notification' in window)) {
      setNotifyFeedback('Notificações não são suportadas neste navegador.');
      setTimeout(() => setNotifyFeedback(null), 3000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationEnabled(true);
        setNotifyFeedback('Lembrete diário ativado com sucesso!');
        new Notification('Lumina Tarot • Conselho Sagrado', {
          body: 'Seu lembrete oracular matinal está pronto para despertar sua clareza todos os dias.',
          icon: './icon.svg'
        });
      } else {
        setNotificationEnabled(false);
        setNotifyFeedback('Permissão para notificações foi recusada.');
      }
      setTimeout(() => setNotifyFeedback(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const suitConfig = SUITS[dailyCard.suit?.toUpperCase()] || SUITS.MAJOR;

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
        aria-label="Carta do dia"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-sm glass-panel border border-amber-500/40 shadow-2xl overflow-y-auto p-4 sm:p-6 md:p-8 text-center"
      >
        {/* Close Button */}
        <button
          type="button"
          aria-label="Fechar" onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer z-20"
        >
          <X aria-hidden="true" className="w-5 h-5" />
        </button>

        {/* Date, Streak & Title */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-cinzel font-semibold">
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="capitalize">{todayFormatted}</span>
            </div>

            {streak > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 border border-amber-400/40 text-amber-200 text-xs font-cinzel font-semibold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>{streak} {streak === 1 ? 'Dia de Conexão' : 'Dias Consecutivos'}</span>
              </div>
            )}
          </div>

          <h3 className="font-cinzel text-xl sm:text-3xl font-black text-slate-100 gold-gradient-text tracking-wide">
            Carta do Dia • Oráculo Diário
          </h3>
          <p className="text-xs text-amber-200/80 mt-1 max-w-md">
            Sua frequência energética e arquétipo guia para reflexão, presença e foco nas próximas 24 horas.
          </p>
        </div>

        {/* Card Artwork & Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-2 text-left">
          
          {/* Card Presentation */}
          <div className="md:col-span-5 flex justify-center">
            <motion.button type="button" aria-label={`Ver detalhes de ${dailyCard.name}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => onOpenCardDetail && onOpenCardDetail(dailyCard, null)}
              className="w-44 sm:w-52 aspect-[7/12] transform-gpu cursor-pointer shadow-2xl"
              title="Clique para ver detalhes completos"
            >
              <CardArt card={dailyCard} size="lg" priority showKeywords={false} />
            </motion.button>
          </div>

          {/* Meaning & Daily Alignment */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-cinzel tracking-widest uppercase text-amber-400 font-bold">
                {dailyCard.deckId === 'lenormand' ? `Baralho Cigano · Carta ${dailyCard.number}` : (dailyCard.arcana === 'Major' ? `Arcano Maior ${dailyCard.roman}` : suitConfig.name)}
              </span>
              <h4 className="font-cinzel text-2xl font-bold text-slate-100 mt-0.5">
                {dailyCard.name}
              </h4>
              <p className="text-xs font-cinzel text-amber-300/80">
                {dailyCard.nameEn} • {dailyCard.archetype}
              </p>
            </div>

            {/* Daily Energy Message */}
            <div className="p-3 rounded-sm bg-stone-950/50 border border-amber-500/30">
              <span className="font-cinzel text-[11px] font-bold text-amber-300 block mb-1">
                Foco e Energia do Dia:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {dailyCard.light}
              </p>
            </div>

            {/* Daily Advice */}
            <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/30">
              <span className="font-cinzel text-[11px] font-bold text-amber-300 block mb-1">
                Conselho Prático para Hoje:
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                "{dailyCard.advice}"
              </p>
            </div>
          </div>
        </div>

        {/* Notification Feedback Message */}
        {notifyFeedback && (
          <div className="mt-3 p-2 rounded-sm bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs text-center font-cinzel animate-fade-in">
            {notifyFeedback}
          </div>
        )}

        {/* Footer Affirmation & Actions */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`px-3 py-1.5 rounded-sm border text-xs font-cinzel flex items-center gap-1.5 transition-all cursor-pointer ${
              notificationEnabled 
                ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-300' 
                : 'bg-stone-950/70 hover:bg-stone-900 border-amber-500/40 text-amber-200 hover:text-amber-200'
            }`}
          >
            {notificationEnabled ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lembrete Diário Ativado</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Lembrar do Conselho Diário</span>
              </>
            )}
          </button>

          <button
            type="button"
            aria-label="Fechar" onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95 text-center"
          >
            Acolher Mensagem
          </button>
        </div>
      </motion.div>
    </div>
  );
};
