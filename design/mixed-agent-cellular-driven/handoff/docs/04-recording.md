# 04 · Recording rules by demonstration

Recording lets a child show what should happen instead of filling in a card. It lives in the
Workshop's **Record** tab (Advanced level) and has two modes.

## Mode 1 · The strip: "I move, it records"

### The table

The world, editable by hand, with three tools:

| Tool | Gesture | Effect |
|---|---|---|
| Move | drag a thing to an empty cell | the thing moves (a body keeps its identity) |
| Copy | drag a thing to an empty cell | a second one appears; the original stays |
| Paint / erase | tap or drag with a chosen kind | paint; painting the same kind again erases; the empty kind erases |

A green outline marks every cell that differs from the last photo.

### Photos and the strip

- **"Photo of what I did"** takes a photo without running the world.
- **"+1 world step"** runs one engine tick with the laws that are on, then takes a photo.
- The strip keeps the last six photos. Tapping one selects that photo and the next as the pair to
  compare; by default the last two are compared.
- Entering the tab takes a first photo. Loading, resetting or resizing the world clears the strip.

A photo (`photo(world)`) is `{ w, h, V, pos }`: a copy of the view, and for every body id its
rounded position and kind. Body ids are what let the harvest tell "this particle moved three cells"
from "one vanished and another appeared".

### The harvest

`harvestAll(a, b)` first computes `movesBetween(a, b)`: bodies present in both photos whose
position changed, each flagged `far` if it moved more than one cell. Then every model contributes
candidates, and the list is filtered and sorted.

| Harvester | Reads | Proposes | Minimum evidence |
|---|---|---|---|
| `pair` | cells that changed next to a cause | a pair card, chance 100% if seen twice or more, else 60% | one change |
| `count` | cells that changed in place | a count card (8 neighbours) | two cells with the same change |
| `force` | drifting bodies that moved toward or away from their nearest neighbour | a force card, strength 60, range 6 | two consistent moves |
| `medium` | the set of drifting bodies that moved | weight 50, or jiggle 40 | three (weight) or four (jiggle) |

**Pair** (the two-pass diff from v4). Cells at either end of a `far` move are excluded.

1. *Movement.* For each cell that changed and was not empty: if a neighbour now holds what this cell
   held and the neighbour also changed, record `[this, neighbour] → [this′, neighbour′]` in that
   direction and mark both cells taken. Reading movement only from the cell something left avoids
   reporting the same move twice.
2. *In place.* For each remaining changed cell: pair it with a neighbour that did **not** change,
   preferring a non-empty one (it is usually the cause, like the sand a plant grows on).

Candidates are grouped and counted. Two flags:

- `clash`: the same before-pair and direction produced two different afters. The interface asks
  "always" or "50% chance".
- `thin`: both before-cells were empty. Such a rule would fire anywhere, so it cannot be accepted;
  the interface says the photo is missing the cause.

**Count.** Cells at either end of any move are excluded. Changes are grouped by `from → to`. For
each group of two or more cells, try each candidate `what` (the `to` kind first, then `from`, then
any other kind present): collect the neighbour counts seen by the changed cells and by the cells of
the same `from` kind that did not change. If the two sets do not overlap, propose the rule with the
changed cells' counts.

**Force.** For each moved drifting body, find the nearest other drifting body in photo A and
compare distances before and after.

- "Like repels" if like-charged pairs moved apart or unlike pairs approached, at least twice in
  total, with no counter-example.
- Otherwise "everything attracts" if at least two bodies moved and all of them approached.

**Medium.** With at least three moved drifting bodies: weight if every one moved down (at least as
much down as sideways). Otherwise, with at least four, jiggle if the moves have no common
direction (length of the summed vector under 45% of the summed lengths).

**Filter and order.** A pair candidate is dropped when count candidates explain every cell it
changes. The rest are sorted by how many changes each explains.

### Accepting

| Candidate | Accept does |
|---|---|
| pair, count | appends the card to the list of laws (with the chosen chance for a clash) |
| force | sets the sign of the existing force card and switches it on, or appends a new one |
| medium | sets `medium.weight = 50` or `medium.temp = 40` |

Discard hides the candidate for this world. Both add the candidate's key to a "dropped" list.

### Limits to state in the interface

- Force and medium are read by direction only. Strength, range and amount are defaults to tune.
- A count card holds only the numbers that appeared in the photo. One Life step typically gives a
  death rule with "0, 1 or 4" and misses 5–8. Evidence is not merged across photos yet.
- The thresholds are low, so casual edits can produce a wrong proposal.
- Membrane permeability is not harvested.

## Mode 2 · One rule at a time

The v4 recorder, for a single pair rule.

1. Choose a direction arrow (→ ← ↑ ↓).
2. Tap a cell of the world. It and its neighbour in the arrow's direction are ringed; they are the
   before-pair, read live from the world.
3. Choose a gesture. The after-pair is computed, not drawn:

| Gesture | After |
|---|---|
| Drag (moves) | `[empty, before₀]` |
| Copy (duplicates) | `[before₀, before₀]` |
| Paint (becomes) | `[before₀, brush]` |
| Erase (vanishes) | `[empty, before₁]` |

4. Two 3×3 patches show before and after, with ✳ in the seven cells that do not matter.
5. "Save rule" appends a pair card with chance 60%. It refuses a rule whose before and after are equal.

If the neighbour would be outside the world, no pair is selected and a message asks for another arrow.
