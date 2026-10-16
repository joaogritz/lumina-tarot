import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TAROT_DECK } from '../src/data/tarotDeck.js';
import { LENORMAND_DECK } from '../src/data/lenormandDeck.js';
import { CARD_ARTWORK, ARTWORK_COLLECTIONS, getCardArtwork } from '../src/data/cardArtwork.js';

const publicFile = path => fileURLToPath(new URL(`../public/${path}`, import.meta.url));
const sources = JSON.parse(readFileSync(publicFile('tarot/sources.json'), 'utf8'));

test('cada carta dos dois catálogos possui artwork local, miniatura e origem documentada', () => {
  const cards = [...TAROT_DECK, ...LENORMAND_DECK];
  assert.equal(cards.length, 114);
  assert.equal(Object.keys(CARD_ARTWORK).length, 114);
  for (const card of cards) {
    const artwork = getCardArtwork(card);
    assert.ok(artwork, `Artwork ausente: ${card.id}`);
    assert.ok(existsSync(publicFile(artwork.src)), artwork.src);
    assert.ok(existsSync(publicFile(artwork.thumbnail)), artwork.thumbnail);
    assert.ok(artwork.height > artwork.width && artwork.width <= 1200);
    const source = sources.find(entry => entry.id === card.id);
    assert.ok(source, `Origem ausente: ${card.id}`);
    assert.equal(source.src, artwork.src);
    assert.equal(source.license, 'Public domain');
    const file = readFileSync(publicFile(artwork.src));
    assert.equal(file.toString('ascii', 0, 4), 'RIFF');
    assert.equal(file.toString('ascii', 8, 12), 'WEBP');
    assert.equal(createHash('sha256').update(file).digest('hex'), source.webpSha256);
    assert.match(source.originalSha1, /^[a-f0-9]{40}$/);
    assert.match(source.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.equal(ARTWORK_COLLECTIONS[artwork.collectionId].license, 'Public domain');
  }
});

test('artwork dos registros antigos é recuperada pelo ID; inversão reutiliza o mesmo arquivo', () => {
  for (const card of TAROT_DECK) {
    const legacy = { ...card };
    delete legacy.artwork;
    assert.deepEqual(getCardArtwork(legacy), card.artwork);
    assert.equal(getCardArtwork({ ...legacy, isReversed: true }).src, card.artwork.src);
  }
  const custom = { src: 'tarot/custom/one.webp', deckName: 'Outro deck' };
  assert.equal(getCardArtwork({ id: 'major_0', artwork: custom }), custom);
  assert.equal(getCardArtwork({ id: 'unknown' }), undefined);
});

test('mapeamento preserva a correspondência dos arcanos e das figuras dos quatro naipes', () => {
  assert.match(CARD_ARTWORK.major_0.src, /00-the-fool\.webp$/);
  assert.match(CARD_ARTWORK.major_8.src, /08-strength\.webp$/);
  assert.match(CARD_ARTWORK.major_11.src, /11-justice\.webp$/);
  assert.match(CARD_ARTWORK.major_17.src, /17-the-star\.webp$/);
  for (const suit of ['cups', 'pentacles', 'swords', 'wands']) {
    for (const rank of ['page', 'knight', 'queen', 'king']) {
      assert.match(CARD_ARTWORK[`${suit}_${rank}`].src, new RegExp(`${rank}-of-${suit}\\.webp$`));
    }
  }
  assert.equal(CARD_ARTWORK.lenormand_1.collectionId, 'lenormand-hope');
  assert.match(CARD_ARTWORK.lenormand_36.src, /36-cross\.webp$/);
});
