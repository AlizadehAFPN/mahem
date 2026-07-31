// ---------------------------------------------------------------------------
// Card geometry — Figma "نوتیفیکشن" 106:528, row node "321" (339×70 on a
// 360-wide frame). The row ships as one flattened raster there, so these
// numbers are traced off that export rather than read off layer properties.
//
// The card is two outlined shapes, not one:
//   * the message bubble, whose bottom edge dives down at tailX and carries on
//     as the strip that holds the read ticks;
//   * the bar under the avatar holding the two date stamps, whose right edge
//     follows the same dive one step behind.
// That dive is an S-curve (horizontal tangents at both ends), which no
// border-radius can express — hence the SVG outline instead of styled Views.
// The curves are pinned to fixed x offsets: the date bar's content is
// fixed-width, so a wider screen should grow the tick strip, not the bar.
//
// Everything in DESIGN is in those traced units and is multiplied by a single
// `scale` (see cardGeometry) before it is drawn. Figma rasters its text into
// the row, so the traced 70pt height is only as tall as a picture of text
// needs to be; real text needs more, and the whole shape has to grow with it —
// scaling the height alone would flatten the S-curve and strand the date bar's
// fixed-width content.
// ---------------------------------------------------------------------------
export const DESIGN = {
  cardH: 70,
  gap: 10, // Figma rows sit 80 apart: 70 tall + 10 between
  bubbleBottom: 46.5,
  barTop: 50.3,
  radius: 4.5,
  avatar: 46,
  bubbleLeft: 50, // avatar (46) + 4pt gap
  tailX: 151.4, // where both horizontal edges turn into the S-curve
  bubbleTailEnd: 187.2,
  bubbleTailC1: 165,
  bubbleTailC2: 176.9,
  barTailC1: 166.7,
  barTailC2: 168.5,
  barTailEnd: 174.2,
  textPad: 8,
  // Figma pins the date at 93pt (8 + 85) from the card's left edge, but the
  // stamp it rasters there is a time («11:16»), not a date — and an 85pt age
  // slot leaves the date only 65.3pt of the bar's flat section. «1405/05/08»
  // needs 62.3pt in IRANSansMobile and 65.8pt in the SF face iOS falls back to
  // (12pt hits SF's small optical size, whose digits are ~5% wider), so the
  // date ellipsized to «1405/05/…» on every iOS row — half a point short.
  // Pulling the age in gives the date 75pt, ~15% clear of that worst case,
  // while the widest age label of either face («دو هفته پیش» / «12 ماه پیش»,
  // both ~66pt shaped) still fits its own slot with a fifth to spare.
  ageSlot: 76,
  tick: 14,
  tickBackRight: 12,
  tickFrontRight: 7,
  tickBottom: 0.6,
};

export const SCREEN_PADDING = 10;
export const STROKE_W = 0.5;
export const INSET = STROKE_W / 2; // keep the hairline inside the card box
export const OUTLINE = '#231F20';

// IRANSansMobile's glyph ink spans 1.57em and it declares 1.587em of
// ascent+descent, so a line box shorter than ~1.6× the font size does not
// overflow on Android — it *crops*, and the first thing to go is the dots that
// tell تست from نست. Every line box on this card is sized off that ratio.
export const LINE_RATIO = 1.6;
export const TEXT_SIZE = 15;
export const STAMP_SIZE = 12;
export const LINE_H = Math.ceil(TEXT_SIZE * LINE_RATIO);
const TEXT_PAD_V = 2; // air between the outer lines and the bubble outline

// Two lines at that ratio don't fit the traced 46.5pt bubble, so the row is
// drawn at this scale by default rather than at its raw Figma size. Change
// TEXT_SIZE and the whole card follows; nothing else needs touching.
export const BASE_SCALE = (2 * LINE_H + 2 * TEXT_PAD_V) / DESIGN.bubbleBottom;

// Narrowest the card may get, in design units, before the tick strip would
// slide underneath the bubble's tail. A screen too small to hold that (or a
// large accessibility text size on one) caps the scale instead, so the row
// shrinks rather than overlapping its own shapes.
const MIN_UNITS = DESIGN.bubbleTailEnd + DESIGN.tickBackRight + DESIGN.tick + 6;

// Ceiling on how far a caller may grow the row. Past it the card would eat the
// whole list, and the message is one truncated line either way. Callers pass 1
// now that the app takes the OS text size out of its layout (src/bootstrap.ts),
// so this only guards a caller that opts back in.
const MAX_FONT_SCALE = 1.3;

export function cardGeometry(cardWidth: number, fontScale: number) {
  const wanted = BASE_SCALE * Math.min(Math.max(fontScale, 1), MAX_FONT_SCALE);
  const scale = Math.min(wanted, cardWidth / MIN_UNITS);
  const u = (value: number) => value * scale;
  // How far the text moved from its 15pt/12pt design size — the same factor as
  // the shape, so the two can never drift apart.
  const textScale = scale / BASE_SCALE;
  return {
    scale,
    cardH: u(DESIGN.cardH),
    shapeBottom: u(DESIGN.cardH) - INSET,
    gap: u(DESIGN.gap),
    bubbleBottom: u(DESIGN.bubbleBottom),
    barTop: u(DESIGN.barTop),
    radius: u(DESIGN.radius),
    avatar: u(DESIGN.avatar),
    bubbleLeft: u(DESIGN.bubbleLeft),
    tailX: u(DESIGN.tailX),
    bubbleTailEnd: u(DESIGN.bubbleTailEnd),
    bubbleTailC1: u(DESIGN.bubbleTailC1),
    bubbleTailC2: u(DESIGN.bubbleTailC2),
    barTailC1: u(DESIGN.barTailC1),
    barTailC2: u(DESIGN.barTailC2),
    barTailEnd: u(DESIGN.barTailEnd),
    textPad: u(DESIGN.textPad),
    ageSlot: u(DESIGN.ageSlot),
    // Whatever the age slot leaves of the bar's flat section. Stated here
    // rather than left to flexbox so the date's box is the same on every row
    // (a date that starts at a different x per row reads as a ragged column)
    // and so a slot too narrow for a date fails a test instead of quietly
    // ellipsizing on a device nobody tested.
    dateSlot: u(DESIGN.tailX - DESIGN.textPad - DESIGN.ageSlot),
    tick: u(DESIGN.tick),
    tickBackRight: u(DESIGN.tickBackRight),
    tickFrontRight: u(DESIGN.tickFrontRight),
    tickBottom: u(DESIGN.tickBottom),
    textSize: TEXT_SIZE * textScale,
    stampSize: STAMP_SIZE * textScale,
    lineHeight: LINE_H * textScale,
    stampLineHeight: STAMP_SIZE * textScale * LINE_RATIO,
  };
}

export type CardGeometry = ReturnType<typeof cardGeometry>;

// Bubble + tick strip, traced clockwise from the bubble's top-left corner.
// Width-dependent: only the right-hand edge moves with the screen.
export const bubblePath = (width: number, g: CardGeometry) =>
  [
    `M ${g.bubbleLeft + g.radius} ${INSET}`,
    `H ${width - INSET - g.radius}`,
    `A ${g.radius} ${g.radius} 0 0 1 ${width - INSET} ${INSET + g.radius}`,
    `V ${g.shapeBottom - g.radius}`,
    `A ${g.radius} ${g.radius} 0 0 1 ${width - INSET - g.radius} ${
      g.shapeBottom
    }`,
    `H ${g.bubbleTailEnd}`,
    `C ${g.bubbleTailC1} ${g.shapeBottom} ${g.bubbleTailC2} ${g.bubbleBottom} ${g.tailX} ${g.bubbleBottom}`,
    `H ${g.bubbleLeft + g.radius}`,
    `A ${g.radius} ${g.radius} 0 0 1 ${g.bubbleLeft} ${
      g.bubbleBottom - g.radius
    }`,
    `V ${INSET + g.radius}`,
    `A ${g.radius} ${g.radius} 0 0 1 ${g.bubbleLeft + g.radius} ${INSET}`,
    'Z',
  ].join(' ');

// The date bar never stretches with the screen — only with the text size.
export const barPath = (g: CardGeometry) =>
  [
    `M ${INSET + g.radius} ${g.barTop}`,
    `H ${g.tailX}`,
    `C ${g.barTailC1} ${g.barTop} ${g.barTailC2} ${g.shapeBottom} ${g.barTailEnd} ${g.shapeBottom}`,
    `H ${INSET + g.radius}`,
    `A ${g.radius} ${g.radius} 0 0 1 ${INSET} ${g.shapeBottom - g.radius}`,
    `V ${g.barTop + g.radius}`,
    `A ${g.radius} ${g.radius} 0 0 1 ${INSET + g.radius} ${g.barTop}`,
    'Z',
  ].join(' ');
