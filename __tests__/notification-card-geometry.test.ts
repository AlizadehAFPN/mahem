import {
  bubblePath,
  barPath,
  cardGeometry,
  DESIGN,
  INSET,
  LINE_RATIO,
} from '../src/screens/others/notif/notification-card-geometry';

// The notification row (NewsComp) is a traced SVG card with absolutely
// positioned text on top, so nothing about it re-flows if a number is wrong —
// it just silently clips or overlaps, which is exactly the bug these guard.
// Widths cover the narrowest phone we support up to a tablet; the font scales
// cover the device text-size setting.
const WIDTHS = [320, 360, 375, 390, 411, 430, 480, 600, 768];
const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5, 2];
const SCREEN_PADDING = 10;
const EPSILON = 1e-9;

const cases: Array<[number, number]> = [];
for (const width of WIDTHS) {
  for (const fontScale of FONT_SCALES) {
    cases.push([width, fontScale]);
  }
}

describe('notification card geometry', () => {
  it.each(cases)(
    'fits two lines of text inside the bubble at %ipt / font scale %f',
    (width, fontScale) => {
      const g = cardGeometry(width - SCREEN_PADDING * 2, fontScale);
      // Both message lines plus a little air, inside the outlined bubble.
      expect(2 * g.lineHeight).toBeLessThanOrEqual(g.bubbleBottom - 2 * INSET);
      // IRANSansMobile crops rather than overflows below this ratio — the bug
      // that ate the dots off Persian glyphs. (EPSILON: the scale divides out
      // to 1.5999999999999999 at some font scales.)
      expect(g.lineHeight).toBeGreaterThanOrEqual(
        g.textSize * LINE_RATIO - EPSILON,
      );
      expect(g.stampLineHeight).toBeGreaterThanOrEqual(
        g.stampSize * LINE_RATIO - EPSILON,
      );
    },
  );

  it.each(cases)(
    'keeps the date stamps inside the bar at %ipt / font scale %f',
    (width, fontScale) => {
      const g = cardGeometry(width - SCREEN_PADDING * 2, fontScale);
      // One line of stamp inside the bar's height...
      expect(g.stampLineHeight).toBeLessThanOrEqual(g.shapeBottom - g.barTop);
      // ...and the age slot ends before the bar's edge starts diving away.
      expect(g.textPad + g.ageSlot).toBeLessThan(g.tailX);
      // Both slots together stay on the flat section too: past tailX the bar's
      // outline dives away and a stamp there would hang out of the card.
      expect(g.textPad + g.ageSlot + g.dateSlot).toBeLessThanOrEqual(
        g.tailX + EPSILON,
      );
    },
  );

  // Advances measured (HarfBuzz-shaped) in both faces the app actually renders
  // with: IRANSansMobile(FaNum) on Android, and the SF system faces on iOS,
  // where that family isn't registered. The em figures below are the wider of
  // the two, since one slot has to serve both. A truncated «1405/05/…» is what
  // this layout exists to prevent, and it shipped once already.
  const DATE_EM = 5.48; // «1405/05/08» — 65.8pt in SF at its 12pt optical size
  const LONGEST_AGE_EM = 5.53; // «12 ماه پیش» in SF Arabic / «دو هفته پیش» in IRANSans
  it.each(cases)(
    'holds a whole Jalali date and the longest age label at %ipt / font scale %f',
    (width, fontScale) => {
      const g = cardGeometry(width - SCREEN_PADDING * 2, fontScale);
      expect(g.dateSlot).toBeGreaterThan(DATE_EM * g.stampSize);
      expect(g.ageSlot).toBeGreaterThan(LONGEST_AGE_EM * g.stampSize);
    },
  );

  it.each(cases)(
    'keeps the read ticks clear of the bubble tail at %ipt / font scale %f',
    (width, fontScale) => {
      const cardWidth = width - SCREEN_PADDING * 2;
      const g = cardGeometry(cardWidth, fontScale);
      const leftmostTick = cardWidth - g.tickBackRight - g.tick;
      expect(leftmostTick).toBeGreaterThan(g.bubbleTailEnd);
      expect(g.tickFrontRight).toBeLessThan(g.tickBackRight);
      // The message area has to survive the shapes growing into it.
      expect(cardWidth - g.bubbleLeft - 2 * g.textPad).toBeGreaterThan(120);
    },
  );

  it('never shrinks the card below its Figma proportions on a real phone', () => {
    // Every shipping width holds the card at full size at the default text
    // size; only an enlarged text setting on a narrow screen scales it back.
    for (const width of WIDTHS) {
      const g = cardGeometry(width - SCREEN_PADDING * 2, 1);
      expect(g.textSize).toBeCloseTo(15, 5);
      expect(g.cardH / DESIGN.cardH).toBeCloseTo(g.tailX / DESIGN.tailX, 5);
    }
  });

  it('grows the tick strip, not the date bar, on a wider screen', () => {
    const narrow = cardGeometry(300, 1);
    const wide = cardGeometry(600, 1);
    expect(wide.tailX).toBeCloseTo(narrow.tailX, 5);
    expect(wide.barTailEnd).toBeCloseTo(narrow.barTailEnd, 5);
    expect(wide.cardH).toBeCloseTo(narrow.cardH, 5);
  });

  it('draws closed outlines whose coordinates stay inside the card box', () => {
    const cardWidth = 400;
    const g = cardGeometry(cardWidth, 1);
    for (const d of [bubblePath(cardWidth, g), barPath(g)]) {
      expect(d.endsWith('Z')).toBe(true);
      expect(d).not.toMatch(/NaN|undefined/);
      // Both axes fit in [0, cardWidth]: an arc flag or a control point that
      // escaped the box is the failure mode a missing scale would produce.
      for (const token of d.match(/-?\d+(\.\d+)?/g) ?? []) {
        const value = Number(token);
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(cardWidth);
      }
    }
  });
});
