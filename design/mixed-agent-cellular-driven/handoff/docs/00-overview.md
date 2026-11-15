# 00 · Overview

## What Cellula is

A phone-first (tablet later) simulation app for children aged 8–12. A child opens a world, presses
play and watches; then tunes a knob; then, when ready, opens the laws behind the world and changes
them. The same world can be driven by cellular-automaton rules, by physical forces, by random
motion, by a programmable fish, or by any mix of these.

The teaching idea carried over from earlier versions: **one space, several engines.** The space is
continuous and the grid is a lens over it. A fish that crosses the tank by cell rules and a fish
that crosses it by sensors and blocks are the same problem solved twice.

## The two levels

| | Introductory | Advanced |
|---|---|---|
| Tabs | Home, Run (plus one tool in a challenge) | Home, World, Run, Workshop |
| Home | Shelf of ready worlds and shelf of challenges | The same, plus "Free bench" |
| Run | Play, step, reset, speed, the knobs the world declares, its counters, goal and lenses | The same, with every lens |
| Editing | None, except the single tool a challenge declares | Paint the world, resize it, switch face, edit every law, the medium and the pores, record rules |

The level is a switch at the top of the screen. Everything in Introductory is the same data as in
Advanced with fewer controls shown; "See how this world was built" takes a child from one to the other.

## What a world is made of

- **Kinds.** Every thing that can exist: empty, glass, rock, sand, plant, alga, fish, particle,
  positive, negative, salt, sugar, planet, star, crystal, membrane, pore. A kind carries properties
  that models read (solid, mass, charge, drifting, pore).
- **Terrain and bodies.** Terrain is one kind per cell. Bodies sit on top of terrain and can move.
- **Law cards.** An ordered list. Four types: pair rule, count rule, force, brain.
- **The medium.** World properties: jiggle (temperature), drag, weight.
- **Layers.** Number layers over the grid: the force field, and measured ones (concentration,
  neighbour counts).

## Glossary

| Term | Meaning |
|---|---|
| Kind | A type of thing, one character, with properties (`KINDS`) |
| Terrain | The kind stored in each cell |
| Body | A movable thing over the terrain, with position and velocity |
| View | Terrain with bodies stamped on it; what rules read |
| Face | How bodies move: `cells` (hop cell to cell) or `free` (continuous) |
| Law card | One entry in the world's list of laws |
| Pair rule | "This next to that becomes these two", in a direction, with a chance |
| Count rule | "A cell that is X, with N of Y in its neighbourhood, becomes Z" |
| Force card | Attraction or repulsion through a field layer, or direct 1/r² in the free face |
| Brain card | A fish's sensors, wires and block programs |
| Medium | Jiggle, drag and weight; properties of the world |
| Mount | A sensor placed on the fish's body: type, angle, range, opening |
| Wire | Mount → action. The first wire whose sensor is true wins |
| P1 | A shared block procedure any action can call |
| Probe | A measure of the world, read by counters, charts and goals |
| Lens | An overlay drawn on the world: grid, field, concentration, trails, numbers, sensors |
| Scenario | A ready world: data plus a `make()` function |
| Challenge (quest) | A scenario with a goal and one editing tool |
| Photo | A snapshot of the view and body positions, for recording |
| Harvest | Proposed law cards read from two photos |
| Snapshot | The serialised world; the point "reset" returns to |

## What is in this hand-off

| Path | What it is |
|---|---|
| `CLAUDE.md` | Rules and reading order |
| `docs/` | Specifications (this folder) |
| `reference/kernel.js` | The kernel, extracted verbatim from the prototype; runs in Node |
| `reference/content.js` | The 8 worlds, 4 challenges and the free bench |
| `reference/smoke.test.js` | 14 headless checks that define the behaviour |
| `reference/Cellula v5.dc.html` | The interactive design prototype (kernel + content + interface in one file) |

The prototype is a design artefact written for a design-canvas runtime (`.dc.html`: a template with
`{{ holes }}` plus a logic class). It is not production code. Its kernel and content bands are the
specification; its shell band shows the intended interface.

## History in one paragraph

Versions 0.1–0.6 (as "Symbio", then Cellula v1–v4) built the fish tank, the pair-rule editor, the
recorder and filmstrip, and the agent with body sensors, wiring and blocks, on an engine hard-wired
to those two things. Version 5 replaced the engine with a generic kernel and added forces, the
medium, membranes and count rules, each explored first on its own page (Forces, Layers, Counting
explorations). The project's `JOURNAL.md` has the full record.
