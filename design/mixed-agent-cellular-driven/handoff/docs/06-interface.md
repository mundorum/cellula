# 06 · Interface

The prototype (`reference/Cellula v5.dc.html`, band "SHELL") shows every screen described here.
Its layout was not visually reviewed; treat this document as the intent.

## Frame

- Phone portrait, 390×844 design size. Content column 338 px wide inside 16 px margins.
- Header: screen title and subtitle on the left; on the right the level chip, the language button
  (PT/EN) and four skin dots.
- Scrollable body.
- Tab bar at the bottom. No fake status bar.
- A toast appears above the tab bar for 2.6 s for confirmations and hints.

## Levels and tabs

| Level | Tabs |
|---|---|
| Introductory, a world | Home · Run |
| Introductory, a challenge | Home · Run · Workshop (restricted to the challenge's tool) |
| Advanced | Home · World · Run · Workshop |

The level chip toggles the level and says so in a toast. Switching to Introductory from World, or
from Workshop in a world that is not a challenge, lands on Run.

## Home

- One help line.
- Shelf "Worlds to run": one card per scenario with number, name, description, tags for the models
  it uses, and ✓ when its goal was met. Tapping loads it and starts it running.
- Shelf "Challenges · one tool at a time": the same card. Tapping loads it paused.
- Advanced only: a "Free bench" button that loads the empty bench and opens World.
- Introductory only: a note that the level chip opens Advanced.

## Run

Top to bottom:

1. **The world**, a canvas 338 px wide whose height follows the grid, with a tick counter chip.
2. **Goal card**, if the scenario has a goal: "Goal" then the text; "✓ Solved" when met.
3. **Counters**: one chip per declared probe, value then label.
4. **Controls**: play/pause, +1 step, reset, and speed 1× 2× 4×.
5. **One hint line**: what touching the world does here (nothing, launch, or paint).
6. **Knobs card**: one slider per declared knob. A knob is hidden if its card does not exist.
7. **Lenses**: toggle chips. Introductory shows the scenario's list; Advanced shows all six.
8. **Chart card**, if the scenario declares a chart and at least two samples exist: polylines of
   the probes over time (one sample every 4 ticks, last 60), with a legend. The second series is
   dashed so colour is not the only cue.
9. **One button**: Introductory world → "See how this world was built" (switches to Advanced,
   opens Workshop). Introductory challenge → "Open this challenge's tool". Advanced → "Open this
   world's Workshop".

Touch on the world:

- `launch:<kind>` (default in the free face): press, drag, release. An arrow shows the velocity
  (0.03 × drag in cells per tick); a dotted line shows the predicted path, computed by running the
  current force card on a ghost body for 480 half-steps. At most 40 bodies.
- `paint:<kind>`: tap or drag paints; starting on a cell that already holds the kind erases.

Changing a knob or a lens also updates the save point, so reset keeps it.

## World (Advanced)

- The canvas, painted by tap and drag with the selected brush. Painting the same kind erases.
- Brush chips for every kind.
- "World size": 11×9, 21×15, 31×21. Choosing one makes a new empty world and keeps laws, medium,
  pores and lenses.
- "How bodies move": cell to cell, or free. Switching rounds body positions.
- Clear, and "Go simulate".

## Workshop (Advanced)

Two tabs at the top: **Laws** and **Record** (`04-recording.md`).

### Laws

- **The list.** One row per card: a type chip (pair, count, force, brain), a one-sentence summary,
  an on/off switch, and a remove button. Tapping a row opens its editor below; tapping again closes it.
- **Add chips**: + pair, + count, and + force / + brain while the world has none of that type.
- **The editor** for the selected card (below).
- **The medium card**: sliders for jiggle, drag, weight. If the world has a pore, chips for which
  kinds the pores let through.
- **A note stating the order within a tick.**

#### Pair editor

Four slots (before, neighbour, after, neighbour). Tap a slot, then a kind in the palette below.
Direction chips → ← ↑ ↓ ✳. Chance slider. "Reads as" sentence.

#### Count editor

Three slots (when it is / counts / becomes) with the same palette. The neighbourhood grid: 3×3 by
default with "me" in the centre; tap a cell to switch it. Chips: 4, 8, (24 when wide), and 5×5 / 3×3
to change the view; going back to 3×3 clears the outer ring. A number strip from 0 to the number of
cells that count; tap to toggle. Chance slider. "Reads as" sentence.

#### Force editor

Two chips for the sign (like repels / everything attracts). In the free face, a third chip
"direct 1/r²". Strength slider. Range slider, hidden in direct mode because it does not apply.

#### Brain editor

Three sub-tabs.

- **Body.** The fish seen from above, facing up, on a stage 250 px tall. Each mount is a pin around
  it and a translucent cone showing its range and opening. With "four sides" a + pin appears on
  each empty side; tapping it mounts a "sees alga" sensor there. Mounts that share a direction
  stack outward. "+ sensor" adds one; "free angle" adds a direction slider. For the selected mount:
  sensor-type chips, range (1–5 cells), opening (20–150°), direction (free angle only), remove.
- **Wiring.** Two columns, sensors (one node per mount, labelled "sees alga · right") and actions,
  with curved lines for the wires. Tap a sensor, then an action, to wire or unwire. Below, the
  priority list "the first one that is true wins", each row with ▲ and ×.
- **Blocks.** Action chips. A MAIN strip for the selected action and a shared P1 strip; tap a strip
  to make it the target, then tap blocks in the palette to append; "remove last" pops. Up to 12
  blocks per strip. Below, the **test arena**: a 7×7 tank with a fish, two rocks and two algae, a
  "Step" button that runs one block of the selected action, and a reset button. The block that just
  ran is outlined.

In a challenge at the Introductory level the Workshop shows only this editor, only the sub-tabs in
`edit.tabs`, only the actions in `edit.acts`, and no P1 when `edit.noP1` is set. The help line is
the goal text.

## Lenses

| Lens | Draws |
|---|---|
| grid | cell lines |
| field | the force field as colour: one hue for positive, another for negative, stronger where larger |
| concentration | how crowded each cell is with drifting bodies (5×5 box per body) |
| trails | the recent path of each free-face body |
| numbers | for the selected (or first) count card, the count each cell sees |
| sensors | each fish's mount cones |

## Language

Every string exists in pt-BR and English and is chosen by one language switch. Kind names come from
the kinds registry. Sentences that describe a card are built from parts ("empty with 3 of alga
becomes alga"); when porting, replace string concatenation with message templates so word order can
differ between languages.

## Interface state

`screen`, `mode` (level), `lang`, `skin`, `running`, `speed`, `sel` (selected card), `slot`
(selected rule slot), `wide` (5×5 view), `brush`, `act` (selected action), `done` (solved goals),
`toast`, `labTab`, `recMode`, `teach` (direction and gesture), `pairSel`, `brainTab`, `mountIdx`,
`advBody`, `wireSel`, `progSlot`, `tool`, `recBrush`, `framePick`, `dropped`.

Kept outside UI state: the world, the save point, the photo strip, the chart history, the drag in
progress, the test-arena world.
