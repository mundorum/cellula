// Headless checks for the reference kernel. Run with:  node --test
// They state the behaviour the production implementation must reproduce (docs/08-testing.md).
// The models are stochastic, so most checks assert ranges, not exact values.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as K from './kernel.js';
import { SCENARIOS, QUESTS, BENCH, pair, force, brain, put } from './content.js';

const byId = (id) => SCENARIOS.concat(QUESTS).find((s) => s.id === id);
const make = (id) => { const W = byId(id).make(); K.buildView(W); return W; };
const run = (W, n) => { for (let i = 0; i < n; i++) K.stepWorld(W); return W; };
const probe = (W, spec) => { const p = spec.split(':'); return K.PROBES[p[0]](W, p[1]); };
const brainOf = (W) => W.laws.find((c) => c.type === 'brain');

test('every scenario builds and runs 300 ticks', () => {
  for (const sc of SCENARIOS.concat(QUESTS, [BENCH])) {
    const W = sc.make(); K.buildView(W); run(W, 300);
    assert.equal(W.tick, 300, sc.id);
    for (const b of W.bodies) assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y), sc.id + ' body position');
  }
});

test('snapshot and restore round-trip a world', () => {
  const W = make('crystal'); run(W, 50);
  const json = K.snapshot(W), R = K.restore(json);
  assert.equal(K.snapshot(R), json);
});

test('pair rules: the fish touches both glass walls', () => {
  const W = run(make('fish'), 60);
  assert.equal(probe(W, 'walls'), 2);
  assert.equal(W.bodies.length, 1, 'the fish is one body that moves, never duplicated');
});

test('count rules: a Life blinker flips and a block is still', () => {
  const W = K.makeWorld(9, 9);
  W.laws = byId('life').make().laws;
  [[2, 2], [3, 2], [4, 2], [6, 6], [7, 6], [6, 7], [7, 7]].forEach(([x, y]) => put(W, x, y, 'a'));
  run(W, 1);
  assert.deepEqual([1, 2, 3].map((y) => W.T[y * 9 + 3]), ['a', 'a', 'a']);
  assert.equal(W.T[2 * 9 + 2], '_');
  assert.deepEqual([W.T[6 * 9 + 6], W.T[7 * 9 + 7]], ['a', 'a']);
});

test('forces, free face, direct 1/r²: a circular orbit stays circular', () => {
  const W = make('orbit'); let min = 99, max = 0;
  for (let i = 0; i < 3000; i++) { K.stepWorld(W); const b = W.bodies[0]; const r = Math.hypot(b.x - 15, b.y - 15); min = Math.min(min, r); max = Math.max(max, r); }
  assert.ok(min > 7.5 && max < 8.5, `radius stayed in [${min.toFixed(2)}, ${max.toFixed(2)}]`);
  assert.ok(probe(W, 'orbits') >= 8);
});

test('forces, free face, field mode: the orbit does not decay (self-field is subtracted)', () => {
  const W = make('orbit'); W.laws[0].direct = false;
  let min = 99, max = 0;
  for (let i = 0; i < 4000; i++) { K.stepWorld(W); const b = W.bodies[0]; if (!b) break; const r = Math.hypot(b.x - 15, b.y - 15); min = Math.min(min, r); max = Math.max(max, r); }
  assert.equal(W.bodies.length, 1, 'not captured, not escaped');
  assert.ok(min > 4 && max < 9, `radius stayed in [${min.toFixed(2)}, ${max.toFixed(2)}]`);
});

test('forces against jiggle: weak attraction stays spread, stronger attraction clusters', () => {
  const big = (strength, temp) => { const W = make('dust'); W.laws[0].strength = strength; W.medium.temp = temp; run(W, 1500); return K.biggestCluster(W); };
  assert.ok(big(0, 80) <= 12, 'no force: only chance groups');
  assert.ok(big(60, 45) >= 20, 'default stardust clusters');
});

test('membrane: what the pores let through crosses, the rest never does', () => {
  const W = run(make('memb'), 1500);
  assert.ok(probe(W, 'right:n') >= 5, 'salt crossed');
  assert.equal(probe(W, 'right:u'), 0, 'sugar did not');
});

test('mixing: force + medium + count rules grow a crystal', () => {
  const W = run(make('crystal'), 600);
  assert.ok(probe(W, 'count:x') >= 30);
  const W0 = make('crystal'); W0.laws[0].strength = 0; run(W0, 600);
  assert.ok(probe(W0, 'count:x') < probe(W, 'count:x'), 'the force is what drives the growth');
});

test('brain: the aquarium fish eats; a wire is needed to turn at the wall', () => {
  assert.ok(probe(run(make('tank'), 900), 'eaten') >= 5);
  const stuck = run(make('twin'), 200);
  assert.equal(probe(stuck, 'walls'), 1, 'with no wire the fish stops at the first wall');
  const W = make('twin'); brainOf(W).wires = [['m1', 'turn']]; run(W, 200);
  assert.ok(K.goalMet(W, byId('twin').goal));
});

test('challenge solutions', () => {
  let W = make('walk'); brainOf(W).programs.fwd = ['step', 'step', 'step', 'step', 'step', 'step', 'right', 'step', 'step', 'step', 'step'];
  let ok = false; for (let i = 0; i < 40; i++) { K.stepWorld(W); ok = ok || K.goalMet(W, byId('walk').goal); }
  assert.ok(ok, 'walk');

  W = make('eyes'); const B = brainOf(W);
  B.mounts.push({ id: 'm9', s: 'food', a: 90, r: 4, f: 50 }); B.wires.push(['m9', 'rand']); run(W, 500);
  assert.ok(K.goalMet(W, byId('eyes').goal), 'eyes: a side sensor wired to "turn"');

  W = make('short'); brainOf(W).programs.fwd = ['step', 'step', 'act', 'step', 'step', 'act', 'right']; run(W, 120);
  assert.equal(K.goalMet(W, byId('short').goal), false, 'short: 7 blocks without P1 is over budget');
  W = make('short'); brainOf(W).programs.fwd = ['p1', 'p1', 'right']; brainOf(W).p1 = ['step', 'step', 'act']; run(W, 120);
  assert.ok(K.goalMet(W, byId('short').goal), 'short: 6 blocks with P1');
});

test('brain sensors read other layers: "feels a pull" leads the fish to a star', () => {
  const W = BENCH.make();
  const B = brain({ wires: [['m1', 'fwd'], ['m2', 'rand']] });
  B.mounts = [{ id: 'm1', s: 'pull', a: 0, r: 1, f: 40 }, { id: 'm2', s: 'free', a: 0, r: 1, f: 40 }];
  W.laws = [B, force('all', 80, 6)]; put(W, 15, 7, 'S'); put(W, 5, 7, '>'); K.buildView(W); run(W, 120);
  const f = W.bodies.find((b) => b.kind === '>' || b.kind === '<');
  assert.ok(Math.abs(f.x - 15) <= 2 && Math.abs(f.y - 7) <= 2, `fish ended at ${f.x},${f.y}`);
});

test('harvest: one Life step gives back count rules; hand moves give force and medium', () => {
  const W = make('life'); const A = K.photo(W); K.stepWorld(W); const B = K.photo(W);
  const got = K.harvestAll(A, B);
  const birth = got.find((g) => g.type === 'count' && g.card.from === '_' && g.card.to === 'a');
  assert.ok(birth, 'a birth rule was proposed');
  assert.deepEqual(birth.card.nums.map((v, i) => (v ? i : -1)).filter((i) => i >= 0), [3]);
  assert.ok(!got.some((g) => g.type === 'pair'), 'pair readings explained by a count rule are dropped');

  const hand = (kinds, edit) => { const V = BENCH.make(); kinds.forEach(([k, x, y]) => K.addBody(V, k, x, y)); const a = K.photo(V); edit(V.bodies); return K.harvestAll(a, K.photo(V)); };
  let h = hand([['m', 4, 4], ['m', 9, 4], ['m', 4, 10], ['m', 9, 10]], (b) => { b[0].x = 6; b[2].x = 6; });
  assert.equal(h.find((g) => g.type === 'force').card.sign, 'all');
  h = hand([['+', 5, 5], ['+', 7, 5], ['-', 12, 9], ['+', 15, 9]], (b) => { b[0].x = 3; b[2].x = 14; });
  assert.equal(h.find((g) => g.type === 'force').card.sign, 'like');
  h = hand([['m', 4, 3], ['m', 8, 4], ['m', 12, 3], ['m', 15, 5]], (b) => b.forEach((o) => { o.y += 3; }));
  assert.deepEqual(h.find((g) => g.type === 'medium').medium, { weight: 50 });
});

test('mixing is free: a pair-rule fish runs inside the crystal world', () => {
  const W = make('crystal'); W.laws.push(pair('>', '_', '_', '>', 'right')); put(W, 2, 2, '>'); K.buildView(W); run(W, 200);
  assert.equal(probe(W, 'count:>'), 1);
  assert.ok(probe(W, 'count:x') > 0);
});
