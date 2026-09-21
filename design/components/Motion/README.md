A live showcase of the system's motion, not a component. The six demos here run the real durations and easings from `Nuva.MOTION`.

The full specification — every animation with its trigger, its values and its reduced-motion answer — is the **Motion** section of the brand book. This page exists so the numbers can be seen moving rather than read.

## What's shown

**Splash** — the logo's wings opening from `scaleX: 0.15` on the `bloom` spring over 560ms, antennae and eyespots following, wordmark rising at +420ms.

**Vera idle** — the ambient breathe: `scaleY` 1 → 1.015 and `translateY` −1.5 over 3200ms, looping. It runs only where nothing is being read.

**Validation** — the card rising 20px over 560ms while the percentage counts. Nothing else on the screen moves, and there is no celebration.

**Progress trail** — each newly filled segment growing `scaleX` 0 → 1 over 240ms. Segments already filled hold.

**List stagger** — 44ms between siblings, `translateY` 12 → 0. Capped at 8 items.

**Press** — `scale` 1 → 0.98 on the `press` spring. The ember glow is static.

## Reading it

The demos are CSS approximations of Reanimated 4 values, which is close enough to judge feel and exact enough to copy the numbers from. In the app every one of these runs on the UI thread; the legacy `Animated` API is not used anywhere.

The page respects `prefers-reduced-motion` — with it on, the loops stop and the reveals become cross-fades, which is the same fallback the app ships.
