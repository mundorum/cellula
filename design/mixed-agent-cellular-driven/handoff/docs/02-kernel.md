# 02 · Kernel: data model and engine

Everything here is implemented in `reference/kernel.js`. Where this text and the code disagree, the
code and its tests win; fix the text.

## Kinds

One character per kind. Properties are optional and read by models.

| Char | pt-BR / English | Role | Properties |
|---|---|---|---|
| `_` | vazio / empty | terrain | |
| `g` | vidro / glass | terrain | `solid`, art, fills its cell |
| `r` | pedra / rock | terrain | `solid`, art |
| `s` | areia / sand | terrain | `solid`, art, fills its cell |
| `p` | planta / plant | terrain | art |
| `a` | alga / alga | terrain | art |
| `>` `<` | peixe / fish | body | art; heading right or left |
| `m` | partícula / particle | body | `drift`, `mass: 1` |
| `+` | positiva / positive | body | `drift`, `mass: 1`, `q: +1` |
| `-` | negativa / negative | body | `drift`, `mass: 1`, `q: −1` |
| `n` | sal / salt | body | `drift` |
| `u` | açúcar / sugar | body | `drift` |
| `c` | planeta / planet | body | `drift`, `mass: 0.03` |
| `S` | estrela / star | terrain | `solid`, `mass: 2`, `absorb` |
| `x` | cristal / crystal | terrain | `solid`, `mass: 1` |
| `h` | membrana / membrane | terrain | `solid` |
| `o` | poro / pore | terrain | `pore` |

- `body`: lives in the body list, not in the terrain array.
- `drift`: moved by the motion model (pushed by forces and the medium). Fish are bodies but do not
  drift; only rules and brains move them.
- `mass` and `q`: what a force card uses as source strength (`srcOf`).
- `absorb`: a free-face body that reaches it is removed and counted as a capture.
- Display properties (`art`, `tok`, `dot`, `sq`, `r`, `glyph`, `fill`) belong to the shell; move them
  out of the kernel registry when porting.

## World

```ts
interface World {
  w: number; h: number;
  face: 'cells' | 'free';
  edge: 'wall' | 'open';            // free face: bounce at the border, or leave and count as escape
  T: string[];                       // terrain, length w*h, row-major
  bodies: Body[];
  laws: Card[];                      // ordered
  medium: { temp: number; drag: number; weight: number };   // each 0–100
  pass: Record<string, boolean>;     // which kinds a pore lets through
  F: Field;                          // the force field layer
  V: string[]; B: (Body|null)[];     // the view, rebuilt by buildView
  tick: number;
  ev: Record<string, number>;        // event counters: orbit, escape, capture, eat
  mem: Record<string, unknown>;      // probe memory: hitL, hitR
  lens: Record<string, boolean>;     // which overlays are on (shell state stored with the world)
}

interface Body {
  id: number; kind: string;
  x: number; y: number;              // integers in the cells face, floats in the free face
  vx: number; vy: number;
  ax: number; ay: number;            // cells face: saved-up movement toward the next hop
  fx: number; fy: number;            // push accumulated this tick
  self: Field | null;                // this body's own field, for subtraction
  h: number;                         // heading in degrees, fish only (0 right, 90 down)
  act: string | null; pc: number; pp: number; last?: [string, number];  // brain program state
  trail: number[] | null; sum: number; la: number | null; rev: number;  // free face: trail and orbit counting
  dead: boolean;
}
```

Defaults from `makeWorld(w, h, face)`: `edge: 'wall'`, `medium: {temp: 0, drag: 10, weight: 0}`,
`pass: {n: true, u: false, m: true, '+': true, '-': false, c: true}`, `lens: {grid: true}`.

## The view

Rules do not read terrain and bodies separately. `buildView(world)` produces:

- `V`: a copy of the terrain with each body's kind written at its rounded cell.
- `B`: for each cell, the body there or `null`.

`putKind(world, cell, kind, body)` is the only way a rule writes:

- Writing a **body kind**: reuse the body passed in, or create one; set its kind and position;
  clear the terrain under it; if another body was there, mark it dead.
- Writing a **terrain kind**: mark any body there dead; set the terrain.

Models that move a body directly (motion, brain) keep `V` and `B` consistent themselves: clear the
old cell (`V[old] = T[old]`), set the new one. A body moved this way sits **over** the terrain (a
fish can stand on an alga); a body written by a rule **replaces** it.

## Engine

`stepWorld(world)`; see the phase list in `01-architecture.md`. Details:

- Only cards with `on: true` run.
- Free face: two sub-steps with `dt = 0.5`. Each sub-step zeroes the pushes, runs force cards and
  the medium, then `moveFree`. Brains act in the first sub-step only. Dead bodies are removed and
  the view is rebuilt before the rule phases, so rules see rounded positions.
- Cells face: one step with `dt = 1`, using `moveCells`.
- After the rule phases: remove dead bodies; for each fish, set `mem.hitL` if `x ≤ 1` and
  `mem.hitR` if `x ≥ w − 2`; increment `tick`.

## Number layers

`Field = { w, h, phi, tmp, rho }`, three `Float32Array`s.

- `relax(F, decay, passes)`: one pass sets every cell to
  `(1 − decay) × mean of its four neighbours + rho`. A neighbour outside the grid counts as the cell
  itself (no-flux border). Passes swap `phi` and `tmp`.
- `decayFor(range) = 1 / (1 + 4·range²)`. The steady field of a point source then falls off with a
  screening length of about `range` cells.
- `gradCell(F, x, y)`: central difference, clamped at the border.
- `gradAt(F, x, y)`: bilinear interpolation of `gradCell`; zero outside the grid.
- `deposit(F, x, y, s)`: spreads `s` over the four cells around a continuous position.

The same `relax` rule, with no source and no decay, is diffusion of a conserved quantity. The
kernel does not yet store conserved quantity layers; concentration is measured from bodies by the
shell's lens (5×5 box around each drifting body). See `11-known-limits.md`.

## Probes and goals

`PROBES[name](world, arg) → number`. A probe spec is `"name"` or `"name:arg"`.

| Probe | Returns |
|---|---|
| `tick` | ticks elapsed |
| `walls` | 0, 1 or 2: how many side walls a fish has touched |
| `orbits`, `escapes`, `captures` | free-face event counts |
| `eaten` | algae eaten by fish |
| `biggest` | size of the largest group of touching drifting bodies (8 neighbours) |
| `count:k` | cells and bodies of kind `k` |
| `right:k` | bodies of kind `k` right of the middle column |
| `reach:x,y` | 1 if a fish is within one cell of (x, y) |
| `blocks` | total blocks in all brain programs plus P1 |

A goal is `{ tests: [[probeSpec, '>=' | '<=', value], …], pt, en }`. `goalMet(world, goal)` is true
when every test holds.

## Snapshot format

`snapshot` returns `JSON.stringify` of:

```json
{ "w": 11, "h": 9, "face": "cells", "edge": "wall",
  "T": "g_________g…",
  "bodies": [[">", 2, 3, 0, 0]],
  "laws": [ … cards … ], "medium": { … }, "pass": { … }, "lens": { … } }
```

Body entries are `[kind, x, y, vx, vy]`. Program state, trails,
event counters and probe memory are not saved: a restored world starts fresh at tick 0. Add a
`version` field when porting.

## Card shapes

```ts
type PairCard  = { type:'pair';  on:boolean; b:[string,string]; a:[string,string];
                   dir:'right'|'left'|'up'|'down'|'any'; prob:number };        // prob 5–100
type CountCard = { type:'count'; on:boolean; from:string; what:string; to:string;
                   mask:number[];   // 25 entries, 5×5 row-major, centre unused
                   nums:boolean[];  // 25 entries; nums[k] = fires with k neighbours
                   prob:number };
type ForceCard = { type:'force'; on:boolean; sign:'all'|'like';
                   strength:number; range:number; direct:boolean };            // strength 0–100, range 2–12
type BrainCard = { type:'brain'; on:boolean; nid:number;
                   mounts:{ id:string; s:SensorId; a:number; r:number; f:number }[];
                   wires:[mountId:string, action:ActionId][];
                   programs:Record<ActionId, BlockId[]>; p1:BlockId[];
                   only?:ActionId };  // test arena only: always run this action
```
