# Cellula — design journal

Agent-based simulation app for kids 8–12. Phone-first, tablet planned.
Palette + type derived from the user's Symbio banner: Baloo 2 (display) + Nunito (UI),
deep teal/abyss ground with glow-teal `#79dcc4`, amber `#f0a63c`, lime `#a8cf4c`.

---

## v0.1 — first prototype (as "Symbio")
**File:** `Symbio.dc.html` (deleted at v0.3)

- Live continuous micro-world sim: algae → ciliates → amoebas, each sensing, steering,
  eating, dividing and starving in real time.
- Six tabs: Worlds · Stage · Rules · Species · Build · Data.
- **Rules** = node graph (chosen by the user over blocks/table/ladder): 9 sensors left,
  9 actuators right, tap-tap to wire, tap a wired pair to unhook. Wires drive real behaviour.
- **Species**: sprite picker (4 CSS blob shapes), size / speed / divide-threshold sliders.
- **Build**: 10×14 paint grid — rock, nutrient, light — colliding with the live agents.
- **Data**: population polyline from real sim history, births/deaths/alive KPIs, plain-language summary.
- Companion `Symbio Explorations.dc.html`: options 1a–1g (3 rule editors, 2 stage looks, 2 shells).

## v0.2 — ecosystem balance fix
- Divide threshold lowered to spawn-energy + 10; prey payoff up (mote +24, prey +42); drains down.
- Deterministic mote replenishment (accumulator, not per-frame RNG).
- **Population floor**: any species hitting zero is reseeded with 2–3 individuals, so a child
  never lands on an empty pond. Data screen explains the reseed in words.
- Clock and chart span switched from ticks to seconds.

## v0.3 — rename
- `Symbio` → **Cellula** everywhere; files renamed to `Cellula.dc.html`
  and `Cellula Explorations.dc.html`.
- Confirmed organism art is original: CSS radial-gradient blobs (glow + off-centre nucleus +
  clock-driven tail), not sprites from any existing product.

## v0.4 — skins, the Lab, and block-programmed actuators
**File:** `Cellula v2.dc.html` (v0.3 kept as `Cellula.dc.html`)

Three questions answered:

1. **Skins over a light switch.** A `SKINS` registry of token sets — `pond` (dark microscope),
   `lab` (LightBot light blue), `meadow` (light green). One tap in the header cycles them; every
   themed surface reads from tokens. A new subject = a new entry, not a refactor. Species colours
   stay constant across skins so the biology reads the same.
2. **Actuators are programs, not atoms.** Tapping an action node in the wiring graph *opens* it
   into a LightBot-style block editor: MAIN strip + PROC1 strip, palette of forward / turn-left /
   turn-right / act / jump / trail / wait / P1. Wiring nodes show a live block count.
3. **Sensors are mounted on the body.** Top-down agent with front/back/left/right slots in Basic
   mode; Advanced unlocks free angle, range and field-of-view per mount, drawn as LiveWorld-style
   cones — the same cones the agents render on the Stage.

Plus **Test**: a 7×7 sandbox arena where the open actuator's program runs step-by-step with the
current block highlighted, call stack included.

Navigation collapsed 6 tabs → 5: Worlds · Stage · **Lab** · Build · Data.
Lab holds Body · Wiring · Blocks · Test.

## v0.5 — fusion with the CA-centric sibling
**File:** `Cellula v3.dc.html` (v2 kept)

Fused with the sibling project *Cellula: Cellular Automata-Centric Design* (cell art from
harena-lab/dcc, bilingual PT+EN voice, rule-card editor) on this project's skin tokens.

- **One space, two engines.** Continuous coordinates with the cell grid as a *lens* over them:
  CA rules read the grid, the agent moves freely on top. `CÉLULAS ⇄ AGENTE` swaps only the
  fish's brain — the aquarium never changes, so chapter 1 and chapter 3 are literally the same
  problem twice. Switching converts state both ways (cell `>`/`<` ⇄ agent x/y/heading) and
  announces itself in a toast.
- **Canonical demo** (user's ask): the fish crossing an aquarium and bouncing off the glass.
  CA: 4 rules (`>_`→`_>`, `>g`→`<g`, mirrored). Agent: `parede à frente → dar meia-volta`
  wired to a two-block program.
- **Preset ladder** (7 levels) gates every surface: cells-only · steps-only · fixed sensors ·
  free sensors · blocks+P1 · mixed · sandbox. The header level chip opens the picker; the
  Mundo tab and Corpo/Ligações/P1 only appear when the level includes them.
- **Home = challenge shelf** (7 chapters, goals: reach, bounce, collect, efficiency, survive)
  plus a CRIAR corner button that drops into the free sandbox.
- Art: `art/*.svg` — fish-left/right, plant, rock, sand, glass, waves, cyanobacteria.

### Open / next
- Tablet split-view shell (exploration `1g`) not built yet.
- Block programs currently drive the sandbox; the continuous Stage sim still runs its
  built-in primitives — unifying the two is the next substantive step.
- Comic-strip rule editor (`1b`) and priority ladder (`1c`) remain unbuilt alternatives.
