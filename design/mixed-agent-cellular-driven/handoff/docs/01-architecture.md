# 01 · Architecture

## Three bands

The prototype is one file with three banners. Production code keeps the same split as three
directories with a one-way dependency.

```
src/
  kernel/     knows no scenario, no DOM          (reference/kernel.js)
  content/    scenarios as data; imports kernel  (reference/content.js)
  shell/      rendering and interface; imports both
```

`kernel` ← `content` ← `shell`. Nothing points the other way. Enforce it with a lint rule
(for example `import/no-restricted-paths`).

## Suggested module layout

```
src/kernel/
  kinds.ts        KINDS registry and its property types
  field.ts        number layers: makeField, relax, gradCell, gradAt, deposit
  world.ts        World, Body, makeWorld, addBody, buildView, putKind, snapshot, restore
  engine.ts       stepWorld: the fixed phases
  models/
    pairs.ts      pairsStep, applyPair, harvest
    count.ts      countStep, masks, harvest
    force.ts      forcePush, forceOn, srcOf, harvest
    medium.ts     mediumPush, harvest
    brain.ts      brainAct, senses, nextBlock, SENSORS, ACTIONS, BLOCKS
    motion.ts     moveCells, moveFree
  probes.ts       PROBES, goalMet
  record.ts       photo, movesBetween, harvestAll
  rng.ts          injectable random source
src/content/
  builders.ts     pair(), count(), force(), brain(), put(), tank(), scatter(), wallColumn()
  scenarios.ts    SCENARIOS, QUESTS, BENCH
src/shell/
  skins.ts        SKINS tokens
  draw.ts         drawWorld, drawKind, drawStrip
  i18n.ts         pt-BR and English strings
  app/            screens: home, run, world, workshop (laws, record), editors per card type
```

## Frame and tick

- The shell runs one `requestAnimationFrame` loop.
- Each frame it adds `speed / scenario.every` to a clock and calls `stepWorld` once per whole unit
  (at most 8 per frame). `every` is frames per tick at 1× speed: 16 for the fish, 2 for particles,
  1 for orbits.
- Each frame it draws the world on a canvas. Drawing never changes the world.
- About five times a second it re-reads the probes, checks the goal and refreshes counters.
- The world is a mutable object owned by the shell, not framework state. Interface state (screen,
  level, selected card, language, skin) is ordinary UI state.

## Save point

`snapshot(world)` returns a JSON string; `restore(json)` rebuilds the world. The shell keeps one
snapshot as the save point. Loading a scenario sets it; every edit in World or Workshop replaces
it; "reset" restores it. Painting during a run does not replace it. Persist this string to keep a
child's world between sessions.

## Extension points

Each row is the complete list of places to touch. None of them is the engine loop, except adding a
whole new model.

| To add | Touch | Notes |
|---|---|---|
| A kind | `KINDS`; a brush entry; optionally `RULE_KINDS`; art or a draw rule | Properties are read by models: `solid`, `body`, `drift`, `mass`, `q`, `pore`, `absorb` |
| A scenario | One entry in `SCENARIOS` or `QUESTS` | Pure data plus `make()`; see `05-scenarios.md` |
| A probe | One function in `PROBES` | Signature `(world, arg) → number` |
| A lens | One entry in `LENSES`; one block in `drawWorld` | Reads the world, never writes |
| A sensor | One entry in `SENSORS`; one branch in `senses` | Receives the mount geometry |
| A block | One entry in `BLOCKS`; one branch in `brainAct` | |
| A knob | One entry in `KNOBS` | Key is `card-type.property` or `medium.property` |
| A harvester | One function in `HARVEST` | `(photoA, photoB, moves) → candidates` |
| A model | A module in `models/`; one call in `engine.ts` in its phase; a card type, its editor and its summary sentence in the shell | The only case that edits the engine |

## The model contract

A model is described by what it declares. In TypeScript:

```ts
interface Model<Card> {
  type: string;                       // card type: 'pair' | 'count' | 'force' | 'brain'
  phase: 'push' | 'act' | 'rulesSequential' | 'rulesAllAtOnce';
  step(world: World, cards: Card[], dt: number): void;
  harvest?(a: Photo, b: Photo, moves: Move[]): Candidate[];
  knobs?: Record<string, KnobSpec>;   // what the interface may expose
  lenses?: string[];                  // overlays it can feed
}
```

The reference code does not have this object; it calls the functions directly from `stepWorld`.
Introducing the interface is the first refactor to make when porting, so that the engine iterates
over registered models by phase.

## Phases of one tick

Fixed order. Within a phase, the order of the cards in the world's list applies.

1. **Push.** Force cards and the medium add to each drifting body's push.
2. **Act.** Brain cards move fish and eat.
3. **Move.** The motion model moves drifting bodies.
   (Steps 1 and 3 run twice with `dt = 0.5` in the free face; step 2 runs once.)
4. **Pair rules.** One pair at a time, in random cell order.
5. **Count rules.** All cells at once, from one snapshot.

Then bookkeeping: remove dead bodies, update wall-touch memory, increment the tick.

## Randomness

The reference code calls `Math.random()` directly. In production, inject a seeded generator
(`rng.ts`) into the world so that a world can be replayed and tests can fix a seed. The ranges in
`08-testing.md` remain the acceptance criteria.

## Performance budget

Measured in Node on the reference kernel: about 0.7 ms per tick for 60 attracting particles on a
31×21 grid, and under 0.1 ms per tick for the orbit world. The cost that grows is the per-body
self-field: bodies × cells × 4 relaxation passes per tick. Cap drifting bodies that source a field
at about 120 on a 31×21 grid, or share self-fields (see `11-known-limits.md`).
