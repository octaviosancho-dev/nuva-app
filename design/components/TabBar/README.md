The app's four destinations, with logging as a centre action rather than a fifth tab.

## Structure

```
Today · Patterns · [ + ] · Words · You
```

Logging is not a place, it is the thing she came to do — so it is a 52px `ember` button with `shadow-ember`, not a tab. This is the same glow rule as `Button`: the primary action on any surface carries it, and there is only one.

## Anatomy

```
bar: surface, radius-2xl on the top corners only
padding: 12px 10px 20px      shadow: shadow-md
tab: 56px min width, icon 23px stroke 2, label (13/17)
active dot: 4px ember, 1px below the label
```

The bottom padding accounts for the home indicator; add the safe-area inset on top of it rather than replacing it.

## Colour

| Ground | Active | Inactive |
|---|---|---|
| `surface` | `text-primary` | `text-tertiary` |
| `night` | `text-on-night` | `text-on-night-muted` |

The active dot is `ember` on both.

## Labels

Always visible. Icon-only tab bars cost recognition for no space gain, and "Words" in particular is not guessable from a speech-bubble glyph.

Labels are sentence case and short: Today, Patterns, Words, You.

## Motion

On switch: active icon `scale` 1 → 1.12 → 1 on the `press` spring, label opacity 0.6 → 1 over `quick`, and the ember dot slides between tabs over `base`.

## Consumer provides

- `active` — route key.
- `onNavigate` — function.
- `onLog` — function for the centre action.
- `onDark` — boolean.

## Do

- Keep the tab bar hidden through all of onboarding and the paywall. It appears once she is in the app.
- Give the centre button `accessibilityLabel="Log symptoms"` — a plus glyph is not a label.

## Don't

- Don't add a fifth destination. Anything more belongs under You.
- Don't badge tabs with counts. Nothing in this app is unread in a way that should nag.
- Don't put the glow on anything else in the bar.
