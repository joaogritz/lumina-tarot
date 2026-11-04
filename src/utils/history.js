// Reading journal stored in localStorage, with JSON backup/restore and statistics.
const STORAGE_KEY = 'lumina_tarot_history_v1';
const MAX_READINGS = 100;
const BACKUP_KIND = 'lumina-tarot-diary';
const BACKUP_VERSION = 1;

const isValidReading = (r) =>
  r && typeof r.id === 'string' && Array.isArray(r.cards) &&
  r.cards.every(c => c && typeof c.name === 'string' && typeof c.suit === 'string');

const byNewest = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lumina_history_updated'));
  }
};

export const historyService = {
  // Get all saved readings
  getReadings() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed.filter(isValidReading).slice(0, MAX_READINGS) : [];
    } catch (e) {
      console.error('Failed to load tarot history', e);
      return [];
    }
  },

  // Save a new reading
  saveReading(reading) {
    if (typeof window === 'undefined') return null;
    try {
      const current = this.getReadings();
      const newEntry = {
        id: `reading_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        deckId: reading.chosenCards[0]?.deckId || 'tarot',
        deckName: reading.chosenCards[0]?.deckId === 'lenormand' ? 'Baralho Cigano' : 'Tarot',
        spreadId: reading.spreadConfig.id,
        spreadName: reading.spreadConfig.name,
        spreadShortName: reading.spreadConfig.shortName,
        userQuestion: reading.userQuestion || '',
        cards: reading.chosenCards.map((card, idx) => ({
          ...card,
          positionName: reading.spreadConfig.positions[idx]?.name || `Posição ${idx + 1}`,
          positionSubtitle: reading.spreadConfig.positions[idx]?.subtitle || ''
        })),
        aiReading: reading.aiReading || null,
        oracleSynthesis: reading.aiReading?.text || reading.oracleSynthesis || '',
        notes: reading.notes || ''
      };

      const updated = [newEntry, ...current].slice(0, MAX_READINGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate();
      return newEntry;
    } catch (e) {
      console.error('Failed to save reading', e);
      return null;
    }
  },

  // Delete a reading by ID
  deleteReading(id) {
    try {
      const current = this.getReadings();
      const filtered = current.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      notifyUpdate();
      return filtered;
    } catch (e) {
      console.error('Failed to delete reading', e);
      return [];
    }
  },

  // Update user notes on an existing reading
  updateReadingNotes(id, notes) {
    try {
      const current = this.getReadings();
      const updated = current.map(r => r.id === id ? { ...r, notes } : r);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyUpdate();
      return updated;
    } catch (e) {
      console.error('Failed to update reading notes', e);
      return [];
    }
  },

  // Compute rich statistical analytics on historical readings
  getReadingStats() {
    const readings = this.getReadings();
    const totalReadings = readings.length;
    if (totalReadings === 0) {
      return {
        totalReadings: 0,
        totalCardsDrawn: 0,
        topCards: [],
        elementalCounts: { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0, lenormand: 0 },
        elementalPercentages: { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0, lenormand: 0 }
      };
    }

    const cardCounts = Object.create(null);
    const elementalCounts = { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0, lenormand: 0 };
    let totalCardsDrawn = 0;

    readings.forEach(reading => {
      (reading.cards || []).forEach(card => {
        totalCardsDrawn++;
        // Count card occurrences
        if (!cardCounts[card.id || card.name]) {
          cardCounts[card.id || card.name] = {
            name: card.name,
            arcana: card.arcana,
            suit: card.suit,
            roman: card.roman,
            count: 0
          };
        }
        cardCounts[card.id || card.name].count++;

        // Element counts
        if (card.deckId === 'lenormand') elementalCounts.lenormand++;
        else if (card.arcana === 'Major') elementalCounts.major++;
        else if (card.suit === 'wands') elementalCounts.wands++;
        else if (card.suit === 'cups') elementalCounts.cups++;
        else if (card.suit === 'swords') elementalCounts.swords++;
        else if (card.suit === 'pentacles') elementalCounts.pentacles++;
      });
    });

    const topCards = Object.values(cardCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const calcPct = (val) => totalCardsDrawn > 0 ? Math.round((val / totalCardsDrawn) * 100) : 0;

    return {
      totalReadings,
      totalCardsDrawn,
      topCards,
      elementalCounts,
      elementalPercentages: {
        lenormand: calcPct(elementalCounts.lenormand),
        major: calcPct(elementalCounts.major),
        wands: calcPct(elementalCounts.wands),
        cups: calcPct(elementalCounts.cups),
        swords: calcPct(elementalCounts.swords),
        pentacles: calcPct(elementalCounts.pentacles),
      }
    };
  },

  // Serialize the whole journal so it can be saved outside the browser.
  exportBackup() {
    return JSON.stringify({
      kind: BACKUP_KIND,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      readings: this.getReadings(),
    }, null, 2);
  },

  // Merge a backup into the journal. Existing entries win on id collisions, so
  // restoring an old file never overwrites notes edited since. Throws on files
  // that are not Lumina diary backups.
  importBackup(text) {
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('O arquivo não é um JSON válido.'); }
    const incoming = Array.isArray(data) ? data : data?.kind === BACKUP_KIND ? data.readings : null;
    if (!Array.isArray(incoming)) throw new Error('Este arquivo não é um backup do diário do Lumina.');
    if (typeof data?.version === 'number' && data.version > BACKUP_VERSION) {
      throw new Error('Este backup foi criado por uma versão mais nova do Lumina.');
    }
    const valid = incoming.filter(isValidReading);
    const current = this.getReadings();
    const known = new Set(current.map(r => r.id));
    const added = valid.filter(r => !known.has(r.id) && known.add(r.id));
    const merged = [...current, ...added].sort(byNewest);
    const kept = merged.slice(0, MAX_READINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    notifyUpdate();
    const keptIds = new Set(kept.map(r => r.id));
    return {
      added: added.filter(r => keptIds.has(r.id)).length,
      ignored: incoming.length - valid.length + (valid.length - added.length),
      dropped: merged.length - kept.length,
      total: kept.length,
    };
  },

  // Clear all history
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      notifyUpdate();
      return [];
    } catch (e) {
      return [];
    }
  }
};
