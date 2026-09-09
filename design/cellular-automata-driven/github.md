repo: mundorum/collections
branch: main
path: src/cell

## Last sync
date: 2026-09-07T15:53:00Z

### Updated in this project
- Read the cell engine (`cell-oid`, `rule-cell-transition-oid`, `rule-cell-neighbor-oid`) and rebuilt its semantics in the Cellula prototype: `transition="ab>cd"` pairs, 3×3 neighborhood masks, per-rule probability, rule order.
- Cell types mirror `dcc-cell-color` / `dcc-cell-image` (type letter, label, visual), so authored simulations map back to the DCC markup.
- Copied the real cell artwork (plant01, rock01, waves, sand, glass, tree01, brontosaurus, carnivorous-dinosaur, arrow-*) from harena-lab/dcc `playground/images/cell` — cell types now use it; generated sprites remain only as the fallback for user-created types.
- Reference gallery examples (Ecologia, Rochas caindo, Ampulheta) ported as presets from harena-lab/dcc `playground/gallery/cell`.

## Screen map
| Screen | Built from |
| --- | --- |
| Cellula.dc.html — Jogar (play) | src/cell/space-cellular-oid.js, src/cell/rule-cell-neighbor-oid.js |
| Cellula.dc.html — Agentes (agent authoring) | src/cell/cell-oid.js, src/cell/rule-cell-transition-oid.js |
| Cellula.dc.html — Mundo (world painting) | src/cell/space-cellular-oid.js, src/cell/cell-image-oid.js |
| Cellula.dc.html — presets (gallery) | harena-lab/dcc playground/gallery/cell/*.js |
| Cellula.dc.html — cell artwork | harena-lab/dcc playground/images/cell/*.svg (copied into this project) |
