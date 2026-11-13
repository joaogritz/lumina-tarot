import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../cloudflare_worker_code.js';
import { detectLocale, t, _setLocaleForTests } from '../src/i18n/index.js';
import pt from '../src/i18n/messages/pt.js';
import en from '../src/i18n/messages/en.js';
import es from '../src/i18n/messages/es.js';
import fr from '../src/i18n/messages/fr.js';
import { SELF_HARM_REGEX, NECROMANCY_REGEX } from '../src/utils/safety.js';
import { parseYesNoAiResponse } from '../src/utils/aiOracle.js';
import { generateOfflineYesNoReading } from '../src/utils/yesNoOracle.js';
import { DECKS } from '../src/data/decks.js';

const keysOf = (tree, prefix = '') => Object.entries(tree).flatMap(([k, v]) =>
  v && typeof v === 'object' && !('one' in v) ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`]);

test('idioma: escolha salva vence, depois o navegador, e idiomas não oferecidos caem no inglês', () => {
  assert.equal(detectLocale(['fr-CA', 'en'], 'es'), 'es');
  assert.equal(detectLocale(['pt-PT', 'en']), 'pt');
  assert.equal(detectLocale(['de-DE', 'es-MX']), 'es');
  assert.equal(detectLocale(['ja-JP']), 'en');
  assert.equal(detectLocale(['de'], 'xx'), 'en');
});

test('os quatro catálogos têm as mesmas chaves e os mesmos marcadores', () => {
  const base = keysOf(pt).sort();
  for (const [name, catalog] of Object.entries({ en, es, fr })) {
    assert.deepEqual(keysOf(catalog).sort(), base, name);
  }
  const marks = (text) => JSON.stringify(text).match(/\{\w+\}/g)?.sort() ?? [];
  const get = (tree, key) => key.split('.').reduce((node, part) => node[part], tree);
  for (const key of base) {
    for (const catalog of [en, es, fr]) assert.deepEqual(marks(get(catalog, key)), marks(get(pt, key)), key);
  }
});

test('t() preenche marcadores, escolhe plural e cai para o português', () => {
  _setLocaleForTests('en');
  try {
    assert.equal(t('common.cardCount', { count: 1 }), '1 card');
    assert.equal(t('common.cardCount', { count: 3 }), '3 cards');
    assert.equal(t('slot.position', { position: 4 }), 'Position 4');
    assert.equal(t('chave.inexistente'), 'chave.inexistente');
  } finally {
    _setLocaleForTests('pt');
  }
});

test('salvaguardas reconhecem pedidos em português, inglês, espanhol e francês', () => {
  for (const q of ['quero morrer', 'I want to kill myself', 'pienso en quitarme la vida', 'je veux me tuer', 'self-harm']) {
    assert.ok(SELF_HARM_REGEX.test(q), q);
    assert.equal(generateOfflineYesNoReading({ card: DECKS.tarot.cards[0], userQuestion: q }).source, 'ethical_safeguard', q);
  }
  for (const q of ['falar com o espírito do meu pai', 'talk to my dead mother', 'hablar con mi difunto abuelo', 'parler à mon défunt père']) {
    assert.ok(NECROMANCY_REGEX.test(q), q);
  }
  for (const q of ['Devo aceitar a proposta?', 'Will I get the job?', 'Is my medium-term plan good?', '¿Me conviene mudarme?', 'Est-ce le bon moment ?']) {
    assert.ok(!SELF_HARM_REGEX.test(q) && !NECROMANCY_REGEX.test(q), q);
  }
});

test('veredito traduzido pelo oráculo recebe a cor certa', () => {
  const type = (verdict) => parseYesNoAiResponse(`VEREDITO: ${verdict}\nRESPOSTA: texto.\nDICA: algo.`, {}).type;
  assert.equal(type('YES'), 'yes');
  assert.equal(type('NO, UNLESS'), 'no');
  assert.equal(type('SÍ, CON UNA CONDICIÓN'), 'conditional_yes');
  assert.equal(type('CELA DÉPEND DE VOUS'), 'maybe');
  assert.equal(type('PLEASE SEEK SUPPORT'), 'yes'); // only safeguards of the current language are recognised
  _setLocaleForTests('en');
  try { assert.equal(type('PLEASE SEEK SUPPORT'), 'maybe'); } finally { _setLocaleForTests('pt'); }
});

const fakeAi = (calls) => ({ run: async (model, input) => { calls.push(input); return { response: 'VEREDITO: YES\nRESPOSTA: Yes.\nDICA: Go.' }; } });
const env = (calls) => ({ ALLOWED_ORIGINS: 'https://example.com', ORACLE_RATE_LIMITER: { limit: async () => ({ success: true }) }, AI: fakeAi(calls) });
const body = { userQuestion: 'Test', chosenCards: [DECKS.tarot.cards[0]] };
const req = (data) => new Request('https://oracle.test/', { method: 'POST', headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

test('worker responde no idioma pedido, mantendo emojis, rótulos e linhas de apoio locais', async () => {
  const calls = [];
  assert.equal((await worker.fetch(req({ ...body, locale: 'fr' }), env(calls))).status, 200);
  let prompt = calls.at(-1).messages[0].content;
  assert.ok(prompt.includes('Escreva toda a resposta em'));
  assert.ok(prompt.includes('francês'));
  assert.ok(prompt.includes('### 🌌 Ce que montrent les cartes'));
  assert.ok(prompt.includes('3114'));

  assert.equal((await worker.fetch(req({ ...body, mode: 'yes_no', locale: 'en' }), env(calls))).status, 200);
  prompt = calls.at(-1).messages[0].content;
  assert.ok(prompt.includes('VEREDITO:, RESPOSTA: e DICA:'));
  assert.ok(prompt.includes('YES, WITH A CONDITION'));
  assert.ok(prompt.includes('988'));

  for (const locale of [undefined, 'pt', 'de', '__proto__', 'constructor', 42]) {
    assert.equal((await worker.fetch(req({ ...body, locale }), env(calls))).status, 200);
    assert.ok(!calls.at(-1).messages[0].content.includes('Escreva toda a resposta em'), String(locale));
  }
});
