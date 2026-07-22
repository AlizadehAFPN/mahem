export function numberWithCommas(input: string | number) {
  return input ? input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

// iOS/Android's Persian keyboard types Persian (۰-۹) or Arabic-Indic (٠-٩)
// digits even on a numeric keyboard, so a value typed into a "numeric" field
// isn't necessarily made of plain 0-9 characters. Anything downstream that
// parses these as numbers (price/area filters, Number(), etc.) needs plain
// English digits, so this normalizes on every keystroke instead of relying
// on the user to switch keyboards manually.
export function toEnglishDigits(value: string): string {
  if (!value) {
    return value;
  }
  return value.replace(/[۰-۹٠-٩]/g, char => {
    const persianIndex = PERSIAN_DIGITS.indexOf(char);
    if (persianIndex > -1) {
      return String(persianIndex);
    }
    return String(ARABIC_INDIC_DIGITS.indexOf(char));
  });
}

const IMAGE_FIELD_PATTERN = /^image(\d+)$/;

// mapAdvertisement (and the store/job/offer equivalents) synthesize
// image1, image2... {path} fields from a plain `images: string[]` array to
// match the legacy per-slot shape these product/offer cards were built
// around — but the original `images` array key is also still present on
// the same object. A naive `key.includes('image')` filter (copy-pasted
// across grid-product/row-product/offer-card/grid-offer-card/single-
// product) matched that bare `images` key too, and `.path` on a plain
// array is undefined — so the "first image" was often just undefined,
// silently falling back to the empty-state placeholder even when real
// images existed. This only matches image1/image2/... and returns them in
// numeric order (not lexicographic, so image10 doesn't sort before image2).
export function getLegacyImagePaths(obj: Record<string, any> | null | undefined): string[] {
  if (!obj) {
    return [];
  }
  return Object.keys(obj)
    .map(key => ({key, match: key.match(IMAGE_FIELD_PATTERN)}))
    .filter(({key, match}) => match && obj[key]?.path)
    .sort((a, b) => Number(a.match![1]) - Number(b.match![1]))
    .map(({key}) => obj[key].path as string);
}
