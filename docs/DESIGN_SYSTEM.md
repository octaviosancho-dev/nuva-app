# Nuva Design System

**v2.0 · September 2026.** Supersedes design system v1.0, which is retired in full.

This file is an index. The system itself lives in `design/`, and that is the source of truth —
everything below points into it. Nothing here restates a value, because two copies of a number
drift and only one of them is right.

## Where everything lives

| Looking for | Read |
|---|---|
| Colour rules, typography, space, elevation, iconography, accessibility | `design/README.md` |
| Every raw token, with its usage note | `design/tokens.json` |
| Every animation, its values and its reduced-motion answer | `design/motion.md` |
| The spec for one of the 16 components | `design/components/<Name>/README.md` |
| The mark, the lockups, the app icons, clear space | `design/assets/Logo/README.md` |
| Vera's poses and when each one is allowed | `design/assets/Mascot/README.md` |
| A screen at real values — 36 of them | `design/screens/*.dc.html` |
| The rules that break silently | `CLAUDE.md` at the repo root |

`src/constants/tokens.ts` is **generated** from `design/tokens.json`. Never hand-edit it. When a
token changes, edit the JSON and run:

```
node scripts/generate-tokens.mjs
```

`src/constants/nuva.ts` holds what the JSON cannot express: `crestPath()`, the category and
severity tables, the symptom icon map and `MOTION`. It is ported from
`design/components/bundle.js` — port it, don't re-derive it.

## What changed from v1.0

v1.0 was built around an arch, a hard offset shadow and eight photographic illustrations. None of
that survives. If you are reading old code or an old commit, this is the translation:

| v1.0 | v2.0 |
|---|---|
| `ArchHeader`, an elliptical arc | `CrestHeader`, a quadratic crest at three depths — hero 30, standard 22, subtle 13 |
| Bricolage Grotesque 800 / 600 | **Fraunces** 600, and 500 italic for `quote` |
| DM Sans 400 / 500 / 600 | DM Sans 400 / 500 — 500 is now the heaviest text weight in the app |
| Hard offset shadows, `shadowRadius: 0` | Soft, warm, low shadows. One glow only: `shadow-ember`, under an enabled primary button |
| cream / brick / plum / sage / mustard | canvas / ember / clay / luna / blush / sand / iris / tide / plum, plus `night` and `night-deep` |
| Single light theme | **Light and dark**, with `userInterfaceStyle: "automatic"` |
| Eight JPG illustrations, one per screen | **Vera**, the luna moth, in five poses. She is the only illustration in the product |
| Grain + halftone textures | Grain only, at `opacity.grain` (0.05), over every screen |
| `artColor` — a measured hex per illustration | Gone. Nothing has to match an image's edge any more |
| 4 approved screens | 36 artboards, covering every flow |

The eight illustrations, their full-size sources, the halftone tiles and the four `CQ*.dc.html`
mockups were deleted in the v2.0 cleanup. They are recoverable from git history if ever needed.

## Before you write UI

Read `CLAUDE.md` at the repo root. Its "rules that break silently" list is fourteen items long,
and every one of them looks fine in a screenshot and is wrong in the product. The three that cost
the most time to discover late:

- **`ember` and `luna` are fill-only on light grounds.** Ember on canvas is 2.2:1. The moment the
  hue carries text, a hairline or a small icon there, it becomes `ember-deep` / `luna-deep`.
- **Selection never changes a fill.** `OptionCard` signals it with a border, a shadow and a check
  in a slot that is always reserved. `SymptomChip` is the one exception — its fill is its
  category, not its state.
- **Colour is never the only signal.** Severity renders the colour, the filled-dot count *and*
  the word. Categories render the colour and the icon. Links are always underlined.

Build screens from the artboard, not from memory. Each `.dc.html` carries the real padding,
radius, font size and line height — copy those numbers rather than rounding them to a grid.
Frames are 393×852; everything must also hold at 375px, where the wrapping chip rows are the
tightest layout in the app.
