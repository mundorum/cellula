# Cellula — instructions for Claude Code

Cellula is a simulation app for children aged 8–12. They run ready-made worlds (a fish in a tank,
planets in orbit, the Game of Life) and, at an advanced level, change the laws behind them. One
generic kernel runs every world; cellular-automaton rules, forces, diffusion and programmable
agents all mix in the same space.

This folder is the hand-off from the design phase. The design exists as a working prototype
(`reference/Cellula v5.dc.html`) and as an extracted, tested reference kernel
(`reference/kernel.js`). **Your job is to build the production app that behaves like them.**

## Read in this order

1. `docs/00-overview.md` — what the app is, the two levels, the glossary.
2. `docs/01-architecture.md` — the three bands, module layout, extension points.
3. `docs/02-kernel.md` and `docs/03-models.md` — the data model and each model's algorithm.
4. `docs/09-implementation-plan.md` — milestones with acceptance criteria. Work through them in order.

Read the others when you reach their milestone: `04-recording`, `05-scenarios`, `06-interface`,
`07-visual-design`, `08-testing`, `10-decisions`, `11-known-limits`.

## Rules that are not negotiable

- **The kernel knows no scenario and no screen.** Nothing under `src/kernel/` may import from
  `src/content/` or `src/shell/`, touch the DOM, or mention a specific world. If adding a scenario
  makes you edit the kernel, the design is being broken: stop and reconsider.
- **A model only pushes; one model moves.** Forces, weight and jiggle add to a body's push. Only
  the motion model changes the position of drifting bodies.
- **Goals and charts read probes.** No model sets a goal flag. If a goal needs a new measure, add a
  probe.
- **A body never feels its own field.** Keep the per-body self-field subtraction
  (`docs/03-models.md`, Forces). Removing it makes field-mode orbits decay.
- **Behaviour is defined by `reference/smoke.test.js`.** Port those checks first and keep them
  green. They assert ranges because the models are random.
- **Portuguese copy is Brazilian Portuguese (pt-BR).** Gerund over "a + infinitive", "salvar" not
  "guardar", "em uma" not "numa". English is the second language. One language is shown at a time.
- **Never hand-draw organisms.** Fish, plant, alga, rock, sand and glass use the SVG art from
  `harena-lab/dcc` (file list in `docs/07-visual-design.md`; not included in this hand-off). Particles, stars and crystals are drawn as plain shapes.
- **Accessibility as drawn.** Real `<button>`, `<input>` with `<label>`, `aria-label` on icon
  buttons, 44 px touch targets, text contrast 4.5:1, and never colour alone to tell two things apart.

## What is settled and what is not

- Settled decisions, with their reasons, are in `docs/10-decisions.md`. Do not reopen them without
  asking the owner.
- Open questions and known physical limits are in `docs/11-known-limits.md`. Ask before resolving
  an open question in code.
- **The prototype's layout was never visually reviewed by the designer agent**; only its logic was
  tested headless. Treat pixel details in the prototype as a first draft and
  `docs/07-visual-design.md` as the intent. See the manual checklist in `docs/08-testing.md`.
- **The technology stack is the owner's call.** The plan assumes TypeScript, a bundler and Canvas
  2D, with a framework-free kernel. Check the target repository's existing stack before scaffolding
  and follow it. If there is none, propose one and wait for approval.

## Commands (reference code)

```bash
cd reference
node --test          # 14 headless checks, no dependencies, about 3 seconds
```

## Definition of done for any change

1. The headless checks pass, three runs in a row.
2. A new model, kind, probe, lens, sensor or scenario was added through its extension point
   (`docs/01-architecture.md`), not by editing the engine loop.
3. New copy exists in pt-BR and English.
4. The change is listed in the project's changelog with the files it touched.
