# 09 · Implementation plan

Eight milestones. Each ends with something runnable and a short list of acceptance criteria. Do
them in order; the kernel milestones need no interface at all.

Assumed stack, to confirm with the owner before M0: TypeScript, a bundler with a dev server, Canvas
2D for the world, a component library of the repository's choosing for the interface, and a test
runner that runs in Node. The kernel must not depend on the interface library.

## M0 · Scaffold

- Inspect the target repository and adopt its tooling. If it has none, propose a stack and wait.
- Create `src/kernel`, `src/content`, `src/shell` and the lint rule that forbids upward imports.
- Bring in the art: the eight SVG files listed in `07-visual-design.md`. They are in the design
  project's `art/` folder and originally in `harena-lab/dcc` under `playground/images/cell` and
  `playground/scripts/images/cell`. They are not included in this hand-off.
- Copy `reference/` and `docs/` into the repository unchanged.

Done when: the dev server shows an empty page, the test runner runs one trivial test, and the
import rule fails a deliberately wrong import.

## M1 · Kernel core

- Port `kinds`, `field`, `world` (including `buildView`, `putKind`, `snapshot`, `restore`) and
  `probes` to TypeScript with the types in `02-kernel.md`.
- Add the injectable random generator and thread it through the world.
- Move display properties out of the kernel kinds registry into the shell.
- Add a `version` field to the snapshot.

Done when: checks 1 (with an empty engine) and 2 pass.

## M2 · Rule models

- Port `pairs` and `count`, with the phase interface from `01-architecture.md`.
- Build `engine.stepWorld` as a loop over registered models by phase.

Done when: checks 3, 4 and 14's pair half pass.

## M3 · Physical models

- Port `force` (field and direct), `medium`, `motion` (both faces), and the membrane check.
- Keep the self-field subtraction and the start-up relaxation.

Done when: checks 5–9 pass and the reference numbers in `08-testing.md` are in the same ranges.

## M4 · Brain

- Port `brain`: mounts, sensors, wires with the default action, programs, P1, the `only` hook.

Done when: checks 10–12 pass.

## M5 · Content and recording

- Port the builders, the 8 worlds, the 4 challenges and the bench.
- Port `record`: photos, moves, the four harvesters, the filter and ordering.

Done when: all 14 checks pass three runs in a row.

## M6 · Shell, Introductory level

- Skins and tokens; the drawing module with every kind and lens.
- The frame, header, tab bar and toast.
- Home with both shelves. Run with controls, counters, goal, knobs, lenses, chart, launch and paint.
- Language switch with all strings in both languages.
- The restricted challenge tool (brain editor filtered by `edit`), since challenges are part of
  this level.

Done when: every world and challenge can be played to its goal on a phone viewport, and the "Run",
"Levels" and "Every screen" parts of the manual checklist in `08-testing.md` are ticked.

## M7 · Shell, Advanced level

- World: brushes, resize, face switch, clear.
- Workshop › Laws: the list, add, the four editors, the medium, pores.
- Workshop › Record: the strip mode and the one-rule mode.
- Persist the save point per world.

Done when: the rest of the manual checklist is ticked, and a child's edited world survives a reload.

## After M7

Candidates, in the order the design phase would take them. Each needs the owner's go-ahead.

1. Tablet layout: world and Workshop side by side.
2. Merge harvest evidence across photos, so count rules fill in missing numbers.
3. A conserved quantity layer in the kernel (smooth diffusion), with membranes that block it.
4. A "thrust" block and a drifting fish, so an agent can be pushed by a force and fight it.
5. Osmosis proper: water as a quantity crossing membranes, and a cell that swells.
6. A strict lattice-gas variant of the cells face.
7. Rule types still missing from early plans: one-dimensional tape rules and turmites.

## Working agreements

- One milestone per branch and pull request. The description lists the files touched.
- Do not change a constant in `03-models.md` to make a test pass. If behaviour differs, find the
  difference.
- When a design question comes up that `10-decisions.md` does not answer, stop and ask.
