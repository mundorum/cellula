# 11 · Known limits and open questions

## Physics

- **Field-mode orbits are rosettes, not ellipses.** A field relaxed on a 2D grid gives a force that
  falls roughly as 1/r near the source and faster beyond the range. Bound orbits precess. Closed
  ellipses need direct mode.
- **Field-mode orbits need a symmetric box.** The grid border reflects the field. On a non-square
  world, or with the source off-centre, the pull is uneven and orbits drift until they escape or are
  captured. Measured on a 31×25 world: escape or capture within 2–8 orbits at launch speeds 0.14–0.16.
- **Outside the grid there is no field.** A free-face body that leaves the grid in field mode
  coasts in a straight line. Direct mode has no such limit.
- **The field lags.** It spreads one cell per relaxation pass, four passes per sub-step. A fast
  source outruns its own field. The self-field subtraction removes the effect on the source itself,
  not on others.
- **The cells face does not conserve angular momentum.** Hops go in four directions. Orbits in the
  cells face spiral. Use the free face for orbits.
- **The cells face is an analog automaton.** Positions are discrete; velocity, saved-up movement
  and field values are real numbers. A strict lattice-gas variant was discussed and not built.
- **Constants are tuned, not derived.** Strength, jiggle and drag have no physical units. The
  spread/cluster switch falls around strength 15–50 at jiggle 80 on a 31×21 grid with 60 particles;
  it will move with grid size and particle count.
- **Equilibrium is noisy.** With 30–60 particles, "evenly spread" looks lumpy and counts fluctuate.
- **One body per cell in the cells face.** Dense clumps are limited by exclusion, not by pressure.

## Kernel gaps

- **No conserved quantity layers.** Smooth diffusion exists only in the Layers explorations page.
  The concentration lens is computed in the shell from body positions.
- **No registered-model object.** `stepWorld` calls each model by name. Introduce the interface in
  `01-architecture.md` when porting.
- **Randomness is not seeded.**
- **Snapshots drop run-time state** (program counters, trails, event counts) and have no version.
- **Self-fields cost memory and time per body**: one grid-sized layer and four passes per tick
  each. A cheaper exact alternative is not known to the designer; an approximate one is to skip
  the subtraction for slow bodies in the cells face.
- **Display properties sit in the kernel's kinds registry.**
- **`walls` memory is written by the engine** for fish, the one place a probe's bookkeeping lives
  in `stepWorld`. Move it into a probe "tracker" hook.

## Model gaps

- **Fish do not drift.** A fish can sense a force but is not pushed by one, and there is no
  "thrust" block.
- **A fish under both pair rules and a brain is moved twice per tick.** Scenarios avoid combining
  them for the same fish.
- **One brain card drives every fish** in a world.
- **Rules cannot be written relative to a body's heading** (D3).
- **A count card with the same "when it is" and "becomes" never fires**, and the editor does not
  say so.
- **A count card counts one kind.** Crystal growth needs two cards (near particles, near crystals).
- **Wide or long food sensors can still stall a fish**: it may choose "eat" for an alga outside the
  three cells its mouth reaches. The defaults avoid this; a child's settings may not.
- **Not built from earlier plans:** one-dimensional tape rules, turmites, per-action P1.

## Recording gaps

- Evidence is not merged across photos; count cards miss numbers that did not occur.
- Low thresholds (two moves for a force) allow false proposals.
- Permeability, strength, range and jiggle amount are not inferred.
- The count harvester only tries the 8-neighbour mask.

## Interface gaps

- **Never visually reviewed.** See the checklist in `08-testing.md`.
- Phone portrait only; no tablet layout.
- The world canvas has no text alternative beyond counters and the goal card.
- Some dense controls are under 44 px.
- Card summaries are built by string concatenation in two languages.
- Nothing is persisted between sessions in the prototype.
- No undo.
- The seven-level ladder and the population-floor reseeding of early versions were dropped.

## Open questions for the owner

1. **Stack and repository.** The designer could not inspect `harena-lab/dcc`. Which framework and
   build does the app join?
2. **Language display.** Keep one language at a time (D21), or return to Portuguese with English
   underneath?
3. **P1.** One shared procedure (D28) or one per action?
4. **Engine order.** Keep fixed phases (D18), or let the child reorder across types?
5. **Friction of the harvest.** Should a proposal need more evidence before it appears?
6. **Persistence and sharing.** Should a child's world be saved locally only, or shareable with a
   teacher and classmates?
7. **Which post-M7 item comes first** (`09-implementation-plan.md`)?
