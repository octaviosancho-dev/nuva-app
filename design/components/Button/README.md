The primary action control. One primary button per screen, and it is the only element in the system that carries a glow.

## Anatomy

```
min-height: 56px          radius: radius-pill
padding: 0 space-6        font: button (DM Sans 500, 16/20, -0.1px)
gap to icon: space-2      icon: Lucide, 18px, stroke 2
```

Full width by default. `compact` drops to 42px with `buttonSM` and auto width, for inline actions like Copy or Edit.

## Variants

| Variant | Fill | Text | Elevation |
|---|---|---|---|
| `primary` | `ember` | `on-ember` | `shadow-ember` |
| `secondary` | `sand` | `on-sand` | none |
| `ghost` | transparent | `text-link` | none |
| `onNight` | `text-on-night` | `night` | none |

`primary` is the one important tap on the screen. If a screen seems to need two, one of them is secondary.

On a `night` or `night-deep` ground, `primary` still works — the ember is bright enough — and `onNight` is the quiet partner beneath it.

## States

- **Disabled** — `opacity-disabled` (0.4) and the glow removed. Never grey the fill; the colour staying put is what tells her the button is the same button.
- **Pressed** — `scale` 1 → 0.98 on the `press` spring. The glow does not animate.
- **Loading** — replace the label with the mark's wing pulse at 20px. Keep the button's width so the layout does not jump.

## Consumer provides

- `variant` — `"primary" | "secondary" | "ghost" | "onNight"`.
- `label` — string, sentence case.
- `icon` — optional Lucide name, rendered after the label.
- `compact`, `disabled`, `loading` — booleans.
- `onPress` — function.

## Do

- Write labels as what happens next: "Continue", "Save today's log", "Start 3-day trial".
- Keep `ghost` for genuinely secondary choices — "I'd rather not be reminded" is a real option and is honoured.

## Don't

- Don't put two `primary` buttons on one screen.
- Don't use `shadow-ember` on anything that is not an enabled primary button.
- Don't use a button where a `TextLink` belongs. A link is not a failed button.
