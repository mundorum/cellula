# 07 · Visual design

## Character

Friendly and calm, for children, without being babyish. A deep-water ground with glowing accents
(the default "Pond" skin), rounded shapes, generous touch targets, short sentences.

## Type

- Display: **Baloo 2** (600–800) for titles, scenario names, big numbers.
- Interface: **Nunito** (600–800) for everything else.
- Sizes used: title 22–23, card titles 16–17, body 11.5–12.5, labels 10–11 uppercase with 1 px
  letter spacing. Do not go below 10 px.

## Skins

A skin is a set of tokens. Every surface reads from tokens, so a new skin is a new entry. Kind
colours for art stay the same across skins so the biology reads the same.

| Token | Pond (dark) | Lab | Meadow | Slide (flat) |
|---|---|---|---|---|
| shell | `#08202c` | `#f2fafd` | `#f4fcf1` | `#ffffff` |
| water (arena ground) | `#0e4a54` | `#e3f2f8` | `#e6f5e0` | `#f4f8f9` |
| ink | `#eafaf6` | `#123742` | `#1c3a1c` | `#14313a` |
| soft (secondary text) | ink at 68% | ink at 74% | ink at 74% | ink at 74% |
| faint (labels) | ink at 60% | ink at 66% | ink at 66% | ink at 66% |
| a1 (primary accent) | `#79dcc4` | `#1c7f93` | `#2f7a38` | `#146069` |
| a2 (second accent) | `#f0a63c` | `#b06c00` | `#a85f10` | `#a8520f` |
| a3 (third accent) | `#a8cf4c` | `#4d8418` | `#557d12` | `#4f7c22` |
| neg | `#3a8fb0` | `#2a6f8c` | `#2a6f8c` | `#2a6f8c` |
| onA1 (text on a1) | `#07303a` | `#ffffff` | `#ffffff` | `#ffffff` |

The exact page, bezel, field, panel, line and bar values are in the `SKINS` object of the prototype.
The light skins' accents were darkened from v4 so that accent-coloured text passes 4.5:1 on white.
**Check every pairing with a contrast tool when porting**; these were chosen by estimate.

The "Slide" skin is flat: no art, kinds drawn as plain token-coloured shapes. It is for projection
and diagrams.

## Shapes and spacing

- Cards: radius 16–20, 1 px line border, 11–14 px padding.
- Chips and buttons: radius 10–15. Minimum height 40 for chips, 44 for primary actions.
- Vertical rhythm: 11–12 px between blocks.
- Selected state: accent border plus a tinted fill, never the tint alone.
- A dashed amber card marks a note or caveat.

## Drawing the world

One canvas. Order, back to front: water → field lens → concentration lens → grid → terrain →
trails → sensor cones → bodies → count numbers → edit outlines → launch arrow.

| Kind | Drawn as |
|---|---|
| glass, sand | art, filling the cell |
| rock, plant, alga | art, inset 8% |
| fish | art (left or right image); tilted about 55° when heading up or down |
| particle, salt, sugar, planet | a disc in a token colour, radius by kind |
| positive, negative | a disc with a + or − glyph; the negative disc is darker, so the two differ in lightness as well as hue |
| star | a large amber disc |
| crystal | an amber square |
| membrane | a soft grey bar |
| pore | a dashed outline |

Art lives in `art/` and comes from `harena-lab/dcc`: `fish-left.svg`, `fish-right.svg`,
`plant01.svg`, `rock01.svg`, `sand.svg`, `glass.svg`, `cyanobacteria.svg` (alga), `waves.svg`.
Never redraw these by hand. Until an image has loaded, and in the flat skin, draw the kind's token
colour instead.

## Colour meaning

- a1 (teal in Pond): primary actions, selection, pair cards.
- a2 (amber): the second thing (actions column, P1, stars, positive charge), warnings and notes.
- a3 (lime): success, "what changed", count cards, particles.
- neg (blue): negative charge, brain cards.

Because several of these carry meaning in the world, every coloured distinction also has a second
cue: a glyph (+ / −), a shape (disc / square), a dash pattern (chart series), or a label.

## Accessibility

- Controls are real `<button>` and `<input type="range">` inside `<label>`.
- Icon-only buttons (play, reset, ×, ▲) have an `aria-label`. Toggles set `aria-pressed`.
- Canvases have `role="img"` and an `aria-label`. A canvas is not readable by a screen reader, so
  the counters and the goal card must carry the state in text.
- Touch targets: 44 px for primary actions, 36–40 px for dense chips. The 30–38 px neighbourhood
  cells and number chips are below 44 px; enlarge them on a tablet layout.
- Do not rely on hover.
- Respect `prefers-reduced-motion` for the toast animation.

## Copy

- Portuguese is Brazilian. Prefer the gerund ("o mundo rodando"), "salvar", "em uma".
- Address the child directly and concretely: "Toque, puxe e solte".
- Name things by what the child sees: "agitação" for temperature, "peso" for the uniform pull,
  "o meio" for the medium, "leis do mundo" for the rule list.
- One idea per sentence. No exclamation marks except "Conseguiu!".
