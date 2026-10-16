import test from 'node:test';
import assert from 'node:assert/strict';
import { createFreeSpread, FREE_SPREAD_ID, SPREAD_TYPES } from '../src/data/spreads.js';

test('tiragem livre oferece de uma a dez posições neutras, numeradas e independentes', () => {
  for (let count = 1; count <= 10; count++) {
    const spread = createFreeSpread(count);
    assert.equal(spread.id, FREE_SPREAD_ID);
    assert.equal(spread.cardCount, count);
    assert.equal(spread.positions.length, count);
    assert.equal(spread.layoutType, 'free');
    assert.deepEqual(spread.positions.map(p => p.name), Array.from({ length: count }, (_, i) => `Carta ${i + 1}`));
    assert.deepEqual(spread.positions.map(p => p.index), Array.from({ length: count }, (_, i) => i));
    assert.ok(spread.positions.every(p => p.subtitle === ''));
  }
  const changed = createFreeSpread(10);
  changed.positions[0].name = 'Alterada';
  assert.equal(createFreeSpread(1).positions[0].name, 'Carta 1');
  assert.equal(SPREAD_TYPES.find(s => s.id === FREE_SPREAD_ID).cardCount, 3);
});

test('quantidade de cartas respeita o limite da mesa e do serviço de interpretação', () => {
  assert.equal(createFreeSpread().cardCount, 3);
  assert.equal(createFreeSpread(NaN).cardCount, 3);
  assert.equal(createFreeSpread(0).cardCount, 1);
  assert.equal(createFreeSpread(-10).cardCount, 1);
  assert.equal(createFreeSpread(50).cardCount, 10);
  assert.equal(createFreeSpread(4.7).cardCount, 4);
});
