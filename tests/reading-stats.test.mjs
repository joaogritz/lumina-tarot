import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../cloudflare_worker_code.js';
import { DECKS } from '../src/data/decks.js';

// Captures the Worker's console.log lines while fn runs and returns the reading records.
const captureReadings = async (fn) => {
  const original = console.log;
  const lines = [];
  console.log = (...args) => lines.push(args.join(' '));
  try { await fn(); } finally { console.log = original; }
  return lines.map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter((r) => r?.event === 'reading');
};

const env = (ai) => ({ ALLOWED_ORIGINS: 'https://example.com', ORACLE_RATE_LIMITER: { limit: async () => ({ success: true }) }, AI: ai });
const answering = { run: async () => ({ response: 'Uma leitura simulada completa.' }) };
const failing = { run: async () => { throw new Error('down'); } };
const QUESTION = 'Pergunta pessoal que não pode ir para o log';
const request = (body, headers = {}, cf) => {
  const req = new Request('https://oracle.test/', { method: 'POST', headers: { Origin: 'https://example.com', 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  if (cf) Object.defineProperty(req, 'cf', { value: cf });
  return req;
};

test('cada tiragem gera uma linha anônima com tipo, baralho, idioma, país e resultado', async () => {
  const tarot = DECKS.tarot.cards.slice(0, 3);
  const records = await captureReadings(async () => {
    assert.equal((await worker.fetch(request({ userQuestion: QUESTION, chosenCards: tarot, locale: 'fr' }, {}, { country: 'FR' }), env(answering))).status, 200);
    assert.equal((await worker.fetch(request({ userQuestion: QUESTION, chosenCards: [DECKS.lenormand.cards[0]], mode: 'yes_no' }), env(answering))).status, 200);
    assert.equal((await worker.fetch(request({ userQuestion: QUESTION, chosenCards: tarot }), env(failing))).status, 502);
  });
  assert.equal(records.length, 3);
  assert.deepEqual({ ...records[0], ms: 0 }, { event: 'reading', mode: 'spread', cards: 3, deck: 'tarot', locale: 'fr', country: 'FR', outcome: 'ok', model: '@cf/google/gemma-4-26b-a4b-it', streamed: false, ms: 0 });
  assert.equal(records[1].mode, 'yes_no');
  assert.equal(records[1].deck, 'lenormand');
  assert.equal(records[1].locale, 'pt');
  assert.equal(records[1].country, null);
  assert.equal(records[2].outcome, 'unavailable');
  assert.equal(records[2].model, null);
  for (const record of records) {
    const text = JSON.stringify(record);
    assert.ok(!text.includes(QUESTION));
    assert.ok(!text.includes(tarot[0].name) && !text.includes(tarot[0].light));
    assert.deepEqual(Object.keys(record).sort(), ['cards', 'country', 'deck', 'event', 'locale', 'mode', 'model', 'ms', 'outcome', 'streamed']);
  }
});

test('leituras transmitidas também são registradas, e pedidos recusados não contam como tiragem', async () => {
  const records = await captureReadings(async () => {
    const res = await worker.fetch(request({ userQuestion: QUESTION, chosenCards: DECKS.tarot.cards.slice(0, 1) }, { Accept: 'text/event-stream' }), env(answering));
    await res.text();
    assert.equal((await worker.fetch(request({ customPrompt: 'x', chosenCards: [] }), env(answering))).status, 400);
    const blocked = new Request('https://oracle.test/', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal((await worker.fetch(blocked, env(answering))).status, 403);
  });
  assert.equal(records.length, 1);
  assert.equal(records[0].streamed, true);
  assert.equal(records[0].outcome, 'ok');
});
