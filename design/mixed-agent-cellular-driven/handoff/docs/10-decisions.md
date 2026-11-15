# 10 · Decisions

Each entry: the decision, who made it, and why. "Owner" is André. "Designer" is the AI design agent
working with him; its decisions were either confirmed by the owner or made under his instruction to
decide autonomously, and are marked accordingly. Reopen an entry only with the owner.

## Foundation

**D1 · Models are registry entries over one kernel.** Owner agreed to the designer's proposal.
The v4 engine was closed in six places (one character per cell, one rule shape, one update policy,
two engines chosen by a global mode, goals inside the engine, a fixed grid). The fix mirrors what
skins already did for themes.

**D2 · Terrain plus bodies, read through one view.** Designer, autonomous. Rules need one grid to
read; physics needs movable things with velocity. Stamping bodies onto terrain gives both, and lets
every model act on the same world.

**D3 · Fish direction stays in the kind (`>` and `<`).** Designer, autonomous. It keeps v4's pair
rules working unchanged. The cost: rules cannot be written relative to "ahead". Revisit if
direction-relative rules are wanted.

**D4 · Goals and charts read probes.** Owner agreed. No model may set a goal flag.

## Forces

**D5 · A force is a law card with three knobs: strength, range, sign.** Owner chose.

**D6 · Gravity and electricity are one model.** Owner agreed. "Everything attracts" uses mass;
"like repels" uses charge.

**D7 · Field mode in both faces, plus direct 1/r² in the free face.** Owner chose. A relaxed 2D
field gives a force that falls as 1/r, so its orbits are rosettes; direct mode gives closed
ellipses like the gravity simulators the owner cited.

**D8 · 2D, with larger grids for force scenes.** Owner chose.

**D9 · A body does not feel its own field.** Designer, found while building; reported to the owner.
Without it, field-mode orbits decay.

**D10 · A world starts with the field of its fixed sources already spread.** Designer, autonomous.
Otherwise the first seconds of an orbit run under a field that is still building.

## Equilibrium and layers

**D11 · Equilibrium comes from random motion; a smooth quantity layer is an option.** Owner chose.
The smooth layer exists in the Layers explorations page, not yet in the kernel.

**D12 · Diffusion to equilibrium is enough for now; osmosis proper waits.** Owner chose.

**D13 · Jiggle, drag and weight are properties of the medium.** Designer, autonomous, after raising
both questions with the owner. Drag and jiggle belong together physically; weight is uniform and
does not depend on other bodies, unlike the force card.

**D14 · A membrane is terrain with a list of who passes.** Designer, reported. No model of its own.

## Counting

**D15 · Neighbourhoods up to 5×5, starting on 3×3.** Owner chose.

**D16 · "How many" is a set of tapped numbers.** Owner chose.

**D17 · Counting is a measured layer plus a rule that reads it.** Owner agreed. The same layer
feeds the numbers lens and can feed sensors and goals.

## Engine order

**D18 · Fixed phases: push, act, move, pair rules, count rules; list order within a phase.**
Designer, autonomous, after raising it with the owner. Fixed phases avoid surprises for a child;
list order still matters among rules of one type. The alternative (order purely by the list) was
judged more flexible but harder to explain.

## Interface

**D19 · Two levels: Introductory and Advanced.** Owner required. Introductory has ready worlds and
few controls; Advanced opens everything. This replaced v4's seven-level ladder.

**D20 · Challenges give one tool each, declared as data.** Designer, autonomous. It keeps v4's
"each chapter exposes only its tools" inside the two-level structure.

**D21 · One language at a time, with a switch.** Designer, autonomous. v4 showed Portuguese with
English underneath; with this much text on a phone, one language reads better. Reversible.

**D22 · No fake phone status bar.** Designer, autonomous; the device already draws one.

## Recording

**D23 · Recording extends to every model.** Owner asked whether it would; designer built it. Each
model contributes a harvester.

**D24 · Forces and the medium are harvested by direction only.** Designer, reported. A photo cannot
show strength.

**D25 · A count reading suppresses the pair reading of the same change.** Designer, autonomous.
Otherwise one Life step proposes four noisy pair rules beside the two real ones.

## Brain

**D26 · Wires start at mounts, not at sensor types.** Designer, autonomous. Two sensors of the same
type on different sides must be able to trigger different actions; the "Eyes that turn" challenge
needs exactly that.

**D27 · With no true wire the fish swims.** Designer, autonomous. A new wire is then never shadowed
by a catch-all "front is free → swim" wire.

**D28 · One P1 shared by all actions.** Designer, reported. v4 had one per action. Simpler for a
child; reversible.

**D29 · The default alga sensor looks one cell ahead with a 40° opening, and "act" eats the three
cells in front.** Designer, found while testing. With range 3 or a wide opening the fish saw algae
it could not reach, chose "eat" forever and stopped.

**D30 · Two sensors read other layers: "feels a pull" and "sees neighbours".** Designer, reported.
They are the brain's connection to forces and particles.

## Scenarios

**D31 · The Orbits world is square (31×31) with the star in the centre.** Designer, found while
testing. On a 31×25 world, field-mode orbits drifted and escaped.

**D32 · "Shortcuts that repeat" has a budget of 6 blocks and a layout whose shortest program
without P1 is 7.** Designer, autonomous. Because programs loop, a regular square path would not
need P1.
