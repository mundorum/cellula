# 08 · Testing

## Headless checks

```bash
cd reference
node --test
```

Fourteen checks, no dependencies, about three seconds. They passed four runs in a row when this
hand-off was written. Port them to the production test runner first and keep them passing.

| # | Check | What it protects |
|---|---|---|
| 1 | Every scenario builds and runs 300 ticks with finite positions | no model crashes on any world |
| 2 | Snapshot → restore → snapshot is identical | the save point |
| 3 | `fish`: both walls touched within 60 ticks, still exactly one body | pair rules move a body, never duplicate it |
| 4 | A Life blinker flips and a block stays | count rules update all at once |
| 5 | `orbit`, direct: radius stays within 7.5–8.5 for 3,000 ticks, at least 8 orbits | the integrator and the 1/r² law |
| 6 | `orbit`, field mode: one body left after 4,000 ticks, radius within 4–9 | self-field subtraction and the start-up relaxation |
| 7 | `dust`: no force and jiggle 80 → biggest group ≤ 12; defaults → ≥ 20 | the spread/cluster switch |
| 8 | `memb`: at least 5 salt crossed in 1,500 ticks, zero sugar | pores and permeability |
| 9 | `crystal`: at least 30 crystals in 600 ticks, fewer with the force off | three models mixing |
| 10 | `tank` eats at least 5 in 900 ticks; `twin` stops at one wall unwired and is solved when wired | brain, wires, default action |
| 11 | The four challenge solutions in `05-scenarios.md` | goals, P1, side sensors |
| 12 | "Feels a pull" brings a fish to within 2 cells of a star | brain reading the field layer |
| 13 | Harvest: Life step → birth rule with exactly {3}, no pair noise; hand moves → force sign and weight | recording |
| 14 | A pair-rule fish runs inside `crystal` | mixing needs no special case |

## Reference numbers

Five runs each on the reference kernel. Use them to judge whether a port behaves the same; exact
values will differ.

| World and setting | Measure | Five runs |
|---|---|---|
| `dust`, defaults, 1,500 ticks | biggest group of 60 | 31, 31, 25, 40, 60 |
| `dust`, strength 0, jiggle 80 | biggest group | 7, 7, 4, 5, 5 |
| `dust`, strength 15, jiggle 80 | biggest group | 7, 5, 5, 6, 4 |
| `dust`, strength 50, jiggle 80 | biggest group | 58, 60, 60, 60, 59 |
| `charge`, jiggle 30, 1,500 ticks | biggest group of 32 | 10, 6, 6, 8, 6 |
| `charge`, jiggle 90 | biggest group | 5, 3, 3, 5, 3 |
| `memb`, 1,500 ticks | salt on the right (of 34) | 9, 11, 15, 18, 7 |
| `memb`, 1,500 ticks | sugar on the right | 0, 0, 0, 0, 0 |
| `crystal`, 600 ticks | crystals (of 60) | 54, 54, 60, 60, 60 |
| `crystal`, strength 0 | crystals | 2, 5, 1, 5, 13 |
| `tank`, 900 ticks | algae eaten | 112, 73, 164, 131, 134 |
| `tank`, 900 ticks | plants | 19, 21, 19, 21, 13 |
| `life`, 300 ticks | algae alive | 21, 14, 19, 19, 15 |

Field-mode orbit on a 31×31 world, range 12, strength 60, 4,000 ticks, by launch speed: 0.12 →
radius 2.9–8.7, 20 orbits; 0.15 → 5.2–8.0, 17 orbits; 0.18 → 8.0–8.5, 13 orbits; 0.21 → escapes.

Timing in Node: `dust` about 0.7 ms per tick; `orbit` under 0.1 ms per tick.

## What the headless checks do not cover

Nothing visual was verified in the design phase. Before calling a milestone done, walk this list
on a real phone-sized viewport, in both languages and at least the Pond and Lab skins.

**Every screen**
- [ ] No text is clipped or overlaps; long Portuguese labels wrap.
- [ ] Every control can be reached and operated by keyboard, and has a visible focus ring.
- [ ] Text contrast is at least 4.5:1 (use a checker on each skin).

**Run**
- [ ] The canvas is sharp on a high-density screen and its height follows the grid.
- [ ] Art images appear for fish, plant, alga, rock, sand, glass; the fish faces its heading.
- [ ] Launch: the arrow follows the finger, the dotted path appears, release adds a body.
- [ ] Paint works by tap and by drag, and does not scroll the page.
- [ ] The chart draws and its two series can be told apart without colour.
- [ ] The toast does not cover the controls.

**World**
- [ ] Each brush paints its kind; painting again erases; resizing keeps the laws.

**Workshop**
- [ ] Laws: the editor opens for each card type; the slot-then-kind interaction is discoverable.
- [ ] Count editor: 3×3 ↔ 5×5 switches cleanly and the number strip follows the mask.
- [ ] Brain › Body: cones point where the sensors look; stacked pins do not leave the stage.
- [ ] Brain › Wiring: lines connect the right nodes when mounts and actions differ in number.
- [ ] Brain › Blocks: the outlined block matches the step just run in the test arena.
- [ ] Record › strip: the green outline, the six thumbnails and the selected pair are readable.
- [ ] Record › one rule: the ringed pair matches the arrow; the patches match the gesture.

**Levels**
- [ ] Introductory shows two tabs in a world and three in a challenge, and the challenge Workshop
      shows only its tool.

## Suggested additions when porting

- Seeded runs: with an injected generator, turn several range checks into exact snapshots.
- Property test: for random worlds and cards, `restore(snapshot(W))` steps identically to `W`
  under the same seed.
- Invariants after every tick: no two cells-face bodies share a cell; every body's cell is inside
  the grid or the body is dead; `V` and `B` match a fresh `buildView`.
- Interface tests for the level gating and for each editor's round trip (edit → card → summary).
