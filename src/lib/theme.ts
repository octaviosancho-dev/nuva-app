import { useColorScheme } from 'react-native';

import { color, shadow, type ThemeName } from '@/constants/tokens';

/**
 * The app follows the system appearance — `app.json` sets
 * `userInterfaceStyle: "automatic"`. Surfaces and text flip between themes;
 * brand fills do not. `ember`, `clay`, `luna`, `blush`, `iris`, `tide` and
 * `plum` hold the same value in both, which is why a category chip needs no
 * per-theme logic at all.
 */
export interface Theme {
  name: ThemeName;
  isDark: boolean;
  /** The resolved colour set. Indexed by token name, e.g. `c.canvas`. */
  c: (typeof color)[ThemeName];
  /** The resolved elevation set, already in React Native shadow props. */
  shadow: (typeof shadow)[ThemeName];
}

export function useTheme(): Theme {
  const name: ThemeName = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { name, isDark: name === 'dark', c: color[name], shadow: shadow[name] };
}
