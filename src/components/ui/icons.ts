import {
  Activity,
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  BatteryLow,
  Bed,
  BellOff,
  Bone,
  Brain,
  Calendar,
  Check,
  CircleDashed,
  CircleDot,
  Clock,
  Cloud,
  CloudRain,
  Droplet,
  Droplets,
  Flame,
  HeartPulse,
  Hourglass,
  MessageCircleDashed,
  MessageCircleHeart,
  MessageCircleOff,
  MessageCircleX,
  Moon,
  Pill,
  Scale,
  Snowflake,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Tornado,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Lucide names, as `CATEGORIES` and `SYMPTOM_ICONS` spell them, resolved to the
 * components. Outline only, never filled.
 *
 * The symptom map is fixed by the design system — she learns these icons in Q2
 * and then uses them daily in the tracker, so re-picking one costs her that
 * recognition. Two entries could not be honoured literally:
 *
 * - `waves` is exported by `lucide-react-native` only under its newer
 *   `waves-horizontal` name, aliased back to `Waves`. Same glyph, so this is a
 *   naming change, not an icon change.
 * - **`spiral` does not exist in `lucide-react-native@1.46`.** `Tornado` is the
 *   nearest available glyph and is used for `cramping`. This is a real
 *   deviation from the spec and should be revisited if the icon ever ships.
 */
const REGISTRY: Record<string, LucideIcon> = {
  // Categories
  thermometer: Thermometer,
  waves: Waves,
  cloud: Cloud,
  moon: Moon,
  activity: Activity,
  'circle-dashed': CircleDashed,

  // Symptoms
  droplets: Droplets,
  snowflake: Snowflake,
  flame: Flame,
  'cloud-rain': CloudRain,
  zap: Zap,
  'message-circle-dashed': MessageCircleDashed,
  brain: Brain,
  'alarm-clock': AlarmClock,
  bed: Bed,
  bone: Bone,
  'heart-pulse': HeartPulse,
  'circle-dot': CircleDot,
  'battery-low': BatteryLow,
  scale: Scale,
  calendar: Calendar,
  droplet: Droplet,
  spiral: Tornado,

  // Onboarding answers and chrome
  sunrise: Sunrise,
  sun: Sun,
  sunset: Sunset,
  clock: Clock,
  hourglass: Hourglass,
  'bell-off': BellOff,
  pill: Pill,
  'message-circle-off': MessageCircleOff,
  'message-circle-x': MessageCircleX,
  'message-circle-heart': MessageCircleHeart,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  check: Check,
};

/**
 * Resolves a Lucide name to its component. Falls back to `CircleDashed` rather
 * than throwing — a missing glyph should not be able to blank a screen, and the
 * dashed circle reads as "unset" rather than as a real symptom.
 */
export function icon(name: string): LucideIcon {
  return REGISTRY[name] ?? CircleDashed;
}

export type { LucideIcon };
