import {Dimensions, PixelRatio} from 'react-native';

/**
 * One scale factor for the whole app, and the rule that it may only ever
 * shrink.
 *
 * Every measurement in this codebase is a raw number read off Figma, whose
 * frames («فیلتر» 106:4897, «نبود نت» 106:350, «نوتیفیکشن» 106:528 …) are all
 * drawn on a 360×640 artboard. So 360×640 is not a guess at a "typical" phone —
 * it is the surface the design was actually drawn for, and a device that size
 * or larger is already showing the app exactly as intended.
 *
 * That is what makes the cap at 1 the important half of this module. Below the
 * artboard the numbers are too big for the space and everything collides; at or
 * above it they are correct and there is nothing to fix. Scaling *up* on a
 * bigger screen would not fix anything — it would redraw screens that are
 * currently fine. `scaled()` therefore returns its argument completely
 * untouched on every device from 360×640 upward, which is every mainstream
 * phone in use (including the 360×640 Huawei nova 2 plus this was reported
 * on), and only starts shrinking on genuinely smaller hardware such as the
 * 320×533 Galaxy J1 mini. On those devices the factor is exactly 1 and
 * `scaled` is the identity function, so "did this change anything?" has a
 * provable answer rather than a visual one.
 *
 * Measured on the shortest/longest side rather than width/height so the factor
 * doesn't collapse if a screen is ever presented in landscape, where a raw
 * `height / 640` would read 0.56 on a perfectly ordinary phone.
 */
export const BASE_WIDTH = 360;
export const BASE_HEIGHT = 640;

/**
 * How far the app is allowed to shrink. 0.8 is below anything realistic — the
 * smallest device in play lands at 0.83 — so this is a backstop against a
 * freak reading (a foldable's cover screen, a bad Dimensions value) rendering
 * the app unreadably small, not a number that shapes normal behaviour.
 */
const MIN_FACTOR = 0.8;

/**
 * Below this, a number isn't a measurement of anything the eye reads as size —
 * it's a hairline, a border, a 1px nudge. Scaling those buys nothing and can
 * round them away to invisibility on a low-density screen (the J1 mini is
 * hdpi, where a third of a point is a real risk), so they pass through.
 */
const HAIRLINE_CEILING = 3;

function measure() {
  // Read both: on Android `window` can still be 0×0 this early in startup,
  // and falling back to the design size means a bad reading degrades to "no
  // scaling" rather than to a factor pinned at MIN_FACTOR.
  const window = Dimensions.get('window');
  const screen = Dimensions.get('screen');
  const width = window.width || screen.width || BASE_WIDTH;
  const height = window.height || screen.height || BASE_HEIGHT;
  return {
    shortest: Math.min(width, height),
    longest: Math.max(width, height),
  };
}

function computeFactor() {
  const {shortest, longest} = measure();
  const raw = Math.min(shortest / BASE_WIDTH, longest / BASE_HEIGHT);
  if (!Number.isFinite(raw) || raw <= 0) {
    return 1;
  }
  // Both bounds matter and they do different jobs: the cap is what protects
  // devices that are already correct, the floor is the backstop above.
  return Math.min(1, Math.max(MIN_FACTOR, raw));
}

/**
 * The factor itself, resolved once at module load. Deliberately not reactive:
 * the app is portrait-only and every existing `Dimensions.get(...)` in this
 * codebase is read at module scope too, so making this one hook-based would
 * put a re-render boundary around styles that nothing else here has.
 */
export const responsiveFactor = computeFactor();

/**
 * True only on hardware smaller than the artboard. Use it for the rare case
 * that needs a different *layout* on a small screen rather than a smaller one
 * (dropping a column, wrapping a row); prefer `scaled()` for everything else.
 */
export const isCompactDevice = responsiveFactor < 1;

/**
 * Scale a Figma measurement to this device.
 *
 * On any device at or above 360×640 this returns `size` unchanged — not
 * approximately, exactly — so it is safe to apply everywhere without auditing
 * what it does to phones that already look right.
 */
export function scaled(size: number): number {
  if (
    responsiveFactor === 1 ||
    !Number.isFinite(size) ||
    Math.abs(size) < HAIRLINE_CEILING
  ) {
    return size;
  }
  // Snap to the device's pixel grid so shrunk text keeps crisp stems and
  // adjacent shrunk boxes don't end up a fraction of a pixel apart.
  return PixelRatio.roundToNearestPixel(size * responsiveFactor);
}
