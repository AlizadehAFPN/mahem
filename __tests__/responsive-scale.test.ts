import {Dimensions} from 'react-native';

// Each case re-imports the module, because the factor is resolved once at load
// (see responsive.ts) — which is the behaviour under test as much as the
// numbers are.
function loadAt(width: number, height: number) {
  jest.resetModules();
  jest.spyOn(Dimensions, 'get').mockReturnValue({
    width,
    height,
    scale: 2,
    fontScale: 1,
  } as ReturnType<typeof Dimensions.get>);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../src/theme/responsive');
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetModules();
});

describe('scaled()', () => {
  // The promise this whole change rests on: a phone that renders the app
  // correctly today must render it identically afterwards. Every device from
  // the Figma artboard upward has to come back untouched, not merely close.
  const unchanged: Array<[string, number, number]> = [
    ['the 360x640 artboard itself (Huawei nova 2 plus)', 360, 640],
    ['iPhone SE 2/3', 375, 667],
    ['iPhone 13 mini', 375, 812],
    ['iPhone 14 / Pixel 7', 390, 844],
    ['Pixel 6 Pro', 412, 892],
    ['iPhone 15 Pro Max', 430, 932],
    ['an iPad in portrait', 820, 1180],
  ];

  it.each(unchanged)('leaves %s exactly as designed', (_name, w, h) => {
    const {scaled, responsiveFactor, isCompactDevice} = loadAt(w, h);
    expect(responsiveFactor).toBe(1);
    expect(isCompactDevice).toBe(false);
    // Identity, over the full range of sizes the app actually uses.
    for (const size of [4, 8, 9, 12, 13, 15, 17, 18, 25, 30, 48, 55, 73, 94]) {
      expect(scaled(size)).toBe(size);
    }
    expect(scaled(-30)).toBe(-30);
  });

  it('shrinks on a device smaller than the artboard (Galaxy J1 mini)', () => {
    const {scaled, responsiveFactor, isCompactDevice} = loadAt(320, 533);
    // Bound by height (533/640) rather than width (320/360) — the shorter of
    // the two is what the layout actually has to fit into.
    expect(responsiveFactor).toBeCloseTo(533 / 640, 5);
    expect(isCompactDevice).toBe(true);
    expect(scaled(17)).toBeLessThan(17);
    expect(scaled(55)).toBeLessThan(55);
    // Shrunk, but never to the point of vanishing or flipping sign.
    expect(scaled(17)).toBeGreaterThan(13);
    expect(scaled(-30)).toBeLessThan(0);
  });

  it('scales text and the box around it by the same factor', () => {
    const {scaled} = loadAt(320, 533);
    // A field 55 tall holding 18pt text has to stay in that proportion, or
    // shrinking would make the overflow worse rather than better.
    expect(scaled(18) / scaled(55)).toBeCloseTo(18 / 55, 2);
  });

  it('never scales below the floor, however small the reading', () => {
    const {scaled, responsiveFactor} = loadAt(200, 320);
    expect(responsiveFactor).toBe(0.8);
    expect(scaled(100)).toBe(80);
  });

  it('leaves hairlines and borders alone', () => {
    const {scaled} = loadAt(320, 533);
    // Rounding a 1pt rule down on a low-density screen can erase it.
    expect(scaled(1)).toBe(1);
    expect(scaled(2)).toBe(2);
    expect(scaled(0)).toBe(0);
  });

  it('is orientation-independent', () => {
    const portrait = loadAt(360, 640).responsiveFactor;
    const landscape = loadAt(640, 360).responsiveFactor;
    expect(landscape).toBe(portrait);
  });

  it('falls back to no scaling rather than to the floor on a bad reading', () => {
    // Android can report a 0x0 window this early in startup; treating that as
    // a tiny screen would shrink the whole app on a perfectly normal phone.
    const {responsiveFactor} = loadAt(0, 0);
    expect(responsiveFactor).toBe(1);
  });
});
