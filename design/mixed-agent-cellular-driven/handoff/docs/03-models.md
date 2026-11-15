# 03 · Models

Six models. Four are law-card types (pair, count, force, brain); the medium is a world property;
motion has no card. All constants below are the values in `reference/kernel.js` and were tuned
headless; they are a starting point, not physics.

## Constants at a glance

| Constant | Value | Where |
|---|---|---|
| Field coupling, "everything attracts" | `0.06 × strength/100` | force, field mode |
| Field coupling, "like repels" | `0.15 × strength/100` | force, field mode |
| Direct coupling | `0.15 × strength/100` per unit of source | force, free face, direct |
| Softening (direct) | `r² + 0.05` for terrain sources, `r² + 0.3` for bodies | force |
| Relaxation passes | 4 per (sub-)step; 400 once when a world starts | force |
| Decay | `1 / (1 + 4·range²)` | force |
| Jiggle amplitude | uniform in `±0.5 × temp/100 × √dt` per axis per step | medium |
| Weight | `+0.012 × weight/100` on y per step | medium |
| Velocity keep, cells face | `1 − drag/100` per tick | motion |
| Velocity clamp, cells face | ±0.9 cells per tick per axis | motion |
| Blocked hop | velocity component × −0.2, saved-up movement reset | motion |
| Sub-steps, free face | 2, with `dt = 0.5` | engine |
| Bounce, free face | velocity component × −0.8 | motion |
| Capture radius | distance² < 0.8 from an `absorb` cell centre | motion |
| Escape margin | 12 cells beyond the grid, `edge: 'open'` | motion |
| Launch velocity | `0.03 ×` drag vector in cells | shell |
| Program length | 12 blocks per strip | shell |

## Pair rules

A card: before pair `b`, after pair `a`, direction, chance.

`pairsStep(world, rules)`:

1. Visit every cell once, in a fresh random order.
2. Skip a cell already used this tick.
3. For each rule in list order: the cell must equal `b[0]`. Take the neighbour in the rule's
   direction (`any` picks one of the four at random for this attempt). It must be inside the grid,
   unused, and equal `b[1]`. Then roll the chance.
4. The first rule that passes is applied; both cells are marked used.

`applyPair` decides what happens to bodies. For each after-slot that is a body kind it picks an
existing body in this order: same slot and same kind; other slot and same kind (a move); same slot,
any kind (a retype); other slot, any kind; otherwise a new body. Bodies not picked are removed.
This is what makes `[fish, empty] → [empty, fish]` move one fish instead of deleting one and
creating another, so velocity and identity survive.

## Count rules

A card: `from`, `what`, a 5×5 `mask`, a set of numbers `nums`, `to`, chance.

`countStep(world, rules)`:

1. Copy the view (the snapshot).
2. For each cell and each rule in list order: skip unless the cell equals `from` and `to` differs
   from it. Count the masked cells whose snapshot kind equals `what`; cells outside the grid count
   as nothing. If `nums[count]` is true and the chance passes, record the change and stop for this
   cell.
3. Apply all recorded changes with `putKind`. A body in the cell is kept and retyped if `to` is a
   body kind, otherwise removed.

- Masks: `maskOf('4')`, `maskOf('8')`, `maskOf('24')`. The editor lets a child switch any of the 24
  cells; it starts on the 3×3 view.
- When the mask shrinks, numbers above its size are cleared.
- The Game of Life is two cards: `_` with exactly 3 `a` becomes `a`; `a` with 0, 1 or 4–8 `a`
  becomes `_`. "Survive" needs no card.
- A card whose `from` equals `to` never fires. The editor should flag it (`11-known-limits.md`).

## Forces

A card: `sign` (`all` = everything attracts, uses mass; `like` = like repels, uses charge),
`strength`, `range`, `direct`.

`srcOf(card, kind)` is the kind's `mass` for `all` and its `q` for `like`. Both terrain cells and
bodies can be sources. A body is pushed only if it drifts and its own `srcOf` is non-zero.

### Field mode (both faces)

Each (sub-)step, `forcePush`:

1. List terrain sources (`world.srcCells`).
2. Zero `F.rho`, add the terrain sources.
3. Once per world, if it has terrain sources, relax 400 passes so the field of fixed sources is
   already spread.
4. Add each body's source: at its cell (cells face) or spread bilinearly (free face).
5. Relax `F` 4 passes.
6. For each drifting source body, keep a private field `body.self` with only its own source, and
   relax it 4 passes with the same decay.
7. Push each such body by `coupling × K × (∇F − ∇self)`, where `coupling` is `+1` for `all` and
   `−sign(q)` for `like`, and the gradient is `gradCell` (cells face) or `gradAt` (free face).

Why step 6 exists: the field spreads one cell per pass, so a moving body leaves a lagging lump of
its own field behind. Without the subtraction that lump pulls an attracting body backwards and its
orbit decays into the centre (measured: radius 8 → 2 in 6,000 frames). Because both fields evolve
under the same linear rule, the difference removes the body's own contribution exactly.

### Direct mode (free face only)

`forceOn` sums, over terrain sources and other source bodies,
`G × source × coupling × (Δ) / (r² + ε)^{3/2}`. No field is computed, the range knob does not apply,
and the field lens shows nothing. This is the mode that gives closed ellipses.

### What each sign gives

- `all`: clumping. Against jiggle there is a sharp switch between "evenly spread" and "one clump"
  (`08-testing.md`).
- `like` with both charges present: opposite charges pair up; heat breaks the pairs.
- `like` with one charge: particles spread apart as evenly as the box allows.

## The medium

World properties, 0–100 each; they apply to every drifting body.

- **Jiggle (`temp`)**: a random kick each step. This is what makes a concentration even out; there
  is no "osmotic force".
- **Drag**: the fraction of velocity lost per tick. Without drag nothing gathers under attraction.
- **Weight**: a constant downward push, the same for every drifting body.

With weight and jiggle together the particles settle into a layer that is dense at the bottom and
thin above.

## Membranes

Not a model. `h` (membrane) is solid terrain; `o` (pore) is terrain that a drifting body may enter
only if `world.pass[kind]` is true. The check is in the motion model (`canEnter`, and the bounce
test in `moveFree`). Whatever passes evens out on both sides; the rest stays.

## The brain

A card belongs to every fish in the world.

### Mounts and sensors

A mount is `{ id, s, a, r, f }`: sensor type, angle from the front in degrees (90 = the fish's
right), range in cells, opening in degrees. `coneCells` lists the cells a cone covers: for each
distance 1…⌈r⌉ and each angle from −f/2 to +f/2 in steps of `max(10, f/6)` degrees, the rounded
cell at that offset.

| Sensor | True when |
|---|---|
| `free` | the cell one step in the mount's direction is not solid and holds no body |
| `wall` | a solid cell (or the grid edge) lies within `round(r)` steps in the mount's direction |
| `food` | an alga is in the cone; a front-facing mount also counts the fish's own cell |
| `plant` | a plant is in the cone; same own-cell rule |
| `crowd` | two or more other bodies are in the cone |
| `pull` | the force field rises in the mount's direction: `∇F · direction > 0.01` |
| `dice` | one time in four, at random |

### Wires

A wire is `[mountId, action]`. When the fish is not in the middle of an action, wires are tested in
list order and the first whose sensor is true selects the action. **If none is true, the action is
`fwd`.** So swimming needs no wire, and a newly added wire always has a chance to fire. Deleting a
mount deletes its wires. The interface allows one wire per mount.

### Actions, programs and blocks

Five actions (`fwd`, `turn`, `rand`, `eat`, `wait`), each with a block program. Defaults:
`fwd: [step]`, `turn: [left, left]`, `rand: [right]`, `eat: [act]`, `wait: [wait]`.

| Block | Effect |
|---|---|
| `step` | move one cell ahead if it is not solid and holds no body |
| `left`, `right` | turn 90° (270° / +90°); the fish kind becomes `<` when facing left and `>` when facing right, unchanged when vertical |
| `act` | eat an alga in the fish's own cell or the three cells in front of it |
| `wait` | nothing |
| `p1` | call the shared procedure `P1`, then continue |

One block runs per tick. An action runs to the end of its program before sensors are read again, so
a two-block turn is never interrupted. `nextBlock` handles the call into `P1` and the return. The
body records `last = [strip, index]` so the interface can outline the block that just ran.

## Motion

### Cells face (`moveCells`)

For each drifting body, in random order:

1. `v ← clamp((v + push) × (1 − drag))`.
2. Add `v` to the body's saved-up movement.
3. Per axis, when the saved-up movement reaches a whole cell: hop one cell if `canEnter` allows
   (inside the grid, no body there, terrain empty or a pore that lets this kind through) and
   subtract one; otherwise bounce weakly and reset.

Position is discrete; velocity and saved-up movement are real numbers. This is an analog cellular
automaton, not a strict one (`11-known-limits.md`).

### Free face (`moveFree`)

For each drifting body: `v ← (v + push·dt) × (1 − drag·dt)`, then `x ← x + v·dt` (velocity first,
position second; this order keeps orbits from spiralling outward). Then:

- Inside the grid on an `absorb` cell and close to its centre: removed, `ev.capture++`.
- Inside on a solid cell, or a pore that blocks this kind: revert the axis that crossed and reverse
  its velocity.
- Outside with `edge: 'wall'`: the same bounce. With `edge: 'open'`: removed once 12 cells out,
  `ev.escape++`.
- Orbit counting: the angle around the first `absorb` cell is accumulated; each full turn adds to
  `ev.orbit`.
- The trail keeps the last 350 positions.
