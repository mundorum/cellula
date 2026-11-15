# 05 · Scenarios

A scenario is data. The full source is `reference/content.js`.

## Schema

```ts
interface Scenario {
  id: string;
  pt: string; en: string;            // name
  dpt: string; den: string;          // one-line description
  tags: ('pair'|'count'|'force'|'brain'|'medium')[];   // shown as chips on the shelf
  every: number;                     // frames per tick at 1× speed
  make(): World;                     // builds the world with kernel and builder calls
  probes?: [spec: string, pt: string, en: string][];   // counters under the world
  goal?: { tests: [spec: string, op: '>='|'<=', value: number][]; pt: string; en: string };
  knobs?: string[];                  // keys into KNOBS, shown in Run
  lens?: string[];                   // lenses offered in Introductory (Advanced offers all)
  chart?: string[];                  // probe specs plotted over time (up to 3)
  tap?: 'launch:<kind>' | 'paint:<kind>';   // what touching the world does in Run
  edit?: { tabs: ('body'|'wiring'|'blocks')[]; acts?: ActionId[]; noP1?: boolean };  // challenges only
}
```

Builders: `pair(b0, b1, a0, a1, dir, prob?)`, `count(from, what, nums[], to, mask?, prob?)`,
`force(sign, strength, range, direct?)`, `brain({ wires?, programs? })`, `put(W, x, y, kind, vx?, vy?)`,
`tank(W)` (glass left and right, sand along the bottom), `scatter(W, kind, n, x0, x1)`,
`wallColumn(W, x, step)` (a membrane with a pore every `step` rows).

`tap` defaults to `launch:c` in a free-face world and to nothing otherwise.

## Worlds to run (Introductory shelf 1)

| id | Name | Grid, face | Contents | Laws | Knobs | Goal |
|---|---|---|---|---|---|---|
| `fish` | The fish that turns around | 11×9 cells | tank, fish at (2,3), two plants | 4 pair rules: swim right, bounce right, swim left, bounce left | none | touch both walls |
| `tank` | A living aquarium | 11×9 cells | tank, fish, plants, algae | brain; plant spreads 6% any; plant dies 5% any; alga appears above sand 6%; alga rises 20% | none | eat 5 algae |
| `orbit` | Orbits | 31×31 free, open edge | star at (15,15), planet at (23,15) moving at 0.15 | force: everything attracts, 60%, range 12, direct | strength | 3 orbits |
| `dust` | Stardust | 31×21 cells | 60 particles | force: everything attracts, 60%, range 4; jiggle 45 | strength, jiggle | none |
| `charge` | Charges | 31×21 cells | 16 positive, 16 negative | force: like repels, 60%, range 6; jiggle 30 | jiggle, strength | none |
| `memb` | Two chambers | 31×19 cells | membrane at x=15 with pores; 34 salt and 24 sugar on the left | none; jiggle 50; pores pass salt only | jiggle | none |
| `life` | Game of Life | 31×21 cells | 28% random algae | 2 count rules | none | none |
| `crystal` | Crystal | 31×21 cells | 60 particles | force as in `dust`; particle with 5–8 particles → crystal; particle with 2–8 crystals → crystal; jiggle 45 | strength, jiggle | none |

Notes:

- `orbit` is square on purpose. In field mode a non-square box pulls unevenly and orbits drift
  (`11-known-limits.md`).
- `orbit` launches a planet on touch-drag-release; `life` paints algae on touch.
- Charts: `tank` (plants, algae), `dust` (biggest group), `memb` (salt right, sugar right), `life`
  (algae), `crystal` (crystals).

## Challenges (Introductory shelf 2)

Each gives the child one tool. All use the 11×9 tank and a brain card.

| id | Name | Tool | Start | Goal | A solution |
|---|---|---|---|---|---|
| `walk` | A fish that walks | Blocks, `fwd` only, no P1 | fish at (2,3), plant at (8,7), no wires, `fwd: [step]` | be within one cell of (8,7) | `step ×6, right, step ×4` (11 blocks) |
| `twin` | Same fish, another brain | Wiring | fish, default mounts, **no wires** | touch both walls | wire "wall · front" → "turn around" |
| `eyes` | Eyes that turn | Body, Wiring | fish at (2,3), algae at (4,6) and (6,2), default brain | eat 2 | mount "sees alga" on the right (range 4), wire it to "turn" |
| `short` | Shortcuts that repeat | Blocks, `fwd` only, with P1 | fish at (2,2), algae at (4,2), (6,2), (6,4), (6,6), no wires | eat 4 using at most 6 blocks | `fwd: [P1, P1, right]`, `P1: [step, step, act]` |

- `twin` is `fish` again: the same goal reached with a sensor instead of four rules.
- `short` is built so that the shortest program without P1 has 7 blocks; the budget of 6 can only
  be met with P1.
- In `eyes` the second alga is at distance 4 from the row the fish ends up patrolling, which is
  what the default side-sensor range reaches.
- A program loops: when an action's blocks run out and no wire fires, `fwd` starts again.

## The free bench (Advanced)

`BENCH`: 21×15 cells, glass on all four sides, no laws, jiggle 40. Opens on the World tab. Offers
every lens.

## Writing a new scenario

1. Pick the grid and face. Use a square grid with the source near the centre for field-mode orbits.
2. Build terrain and bodies in `make()`.
3. List the law cards and set the medium.
4. Declare only the one or two knobs that matter; each knob must point at a card that exists.
5. Add probes for what the child should watch, and a goal only if "done" is unambiguous.
6. Run it headless for a few hundred ticks and write down the numbers you see in `08-testing.md`.
