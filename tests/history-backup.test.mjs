import test from 'node:test';
import assert from 'node:assert/strict';
import { DECKS } from '../src/data/decks.js';
import { historyService } from '../src/utils/history.js';

const KEY = 'lumina_tarot_history_v1';
const spreadConfig = { id: 'single', name: 'Carta', shortName: 'Carta', positions: [{ name: 'Conselho' }] };

function withStorage(fn) {
  const storage = new Map();
  globalThis.window = { dispatchEvent() {} };
  globalThis.localStorage = { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) };
  try { return fn(storage); } finally { delete globalThis.window; delete globalThis.localStorage; }
}

test('backup do diário ida e volta preserva leituras e notas', () => withStorage(storage => {
  const tower = DECKS.tarot.cards.find(c => c.name === 'A Torre');
  const saved = historyService.saveReading({ spreadConfig, chosenCards: [tower], userQuestion: 'Pergunta' });
  historyService.updateReadingNotes(saved.id, 'Minha nota');
  const backup = historyService.exportBackup();
  const parsed = JSON.parse(backup);
  assert.equal(parsed.kind, 'lumina-tarot-diary');
  assert.equal(parsed.readings.length, 1);

  storage.clear();
  const result = historyService.importBackup(backup);
  assert.deepEqual(result, { added: 1, ignored: 0, dropped: 0, total: 1 });
  const [restored] = historyService.getReadings();
  assert.equal(restored.id, saved.id);
  assert.equal(restored.notes, 'Minha nota');
}));

test('importar mescla sem duplicar e não sobrescreve notas editadas depois', () => withStorage(() => {
  const card = DECKS.lenormand.cards[0];
  const saved = historyService.saveReading({ spreadConfig, chosenCards: [card] });
  const backup = historyService.exportBackup();
  historyService.updateReadingNotes(saved.id, 'Editada depois do backup');
  const result = historyService.importBackup(backup);
  assert.equal(result.added, 0);
  assert.equal(result.ignored, 1);
  assert.equal(historyService.getReadings()[0].notes, 'Editada depois do backup');
}));

test('importar respeita o limite de 100 leituras e mantém as mais recentes', () => withStorage(storage => {
  const card = DECKS.tarot.cards[0];
  const make = (i) => ({ id: `r${i}`, date: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(), cards: [{ name: card.name, suit: card.suit }] });
  storage.set(KEY, JSON.stringify(Array.from({ length: 60 }, (_, i) => make(i)).reverse()));
  const result = historyService.importBackup(JSON.stringify({ kind: 'lumina-tarot-diary', version: 1, readings: Array.from({ length: 60 }, (_, i) => make(i + 60)) }));
  assert.equal(result.total, 100);
  assert.equal(result.dropped, 20);
  const ids = historyService.getReadings().map(r => r.id);
  assert.equal(ids[0], 'r119');
  assert.ok(!ids.includes('r0'));
}));

test('importar rejeita arquivos que não são backup e ignora entradas inválidas', () => withStorage(() => {
  assert.throws(() => historyService.importBackup('{'), /JSON válido/);
  assert.throws(() => historyService.importBackup('{"foo":1}'), /não é um backup/);
  assert.throws(() => historyService.importBackup(JSON.stringify({ kind: 'lumina-tarot-diary', version: 99, readings: [] })), /versão mais nova/);
  const result = historyService.importBackup(JSON.stringify({ kind: 'lumina-tarot-diary', version: 1, readings: [null, { id: 1 }, { id: 'ok', date: '2026-01-01', cards: [{ name: 'X', suit: 'cups' }] }] }));
  assert.equal(result.added, 1);
  assert.equal(result.ignored, 2);
}));
