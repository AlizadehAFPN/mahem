import i18n from '../i18n';

export function numberWithCommas(input: string | number | undefined) {
  return input ? input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
}

// The two halves of a money *input* field. Prices are shown everywhere else in
// the app grouped in threes (numberWithCommas, in every product/offer card), so
// a bare "1500000" sitting in the field the user types it into is the odd one
// out — and the longer the number, the harder it is to tell 15 million from 1.5
// million while typing it.
//
// Grouping is display-only: stripThousandSeparators takes whatever is currently
// in the field back to plain digits before it reaches the screen's state, so
// what gets validated and sent is the same plain number it always was and no
// caller has to know the field is formatted. Only digits survive — a separator
// the user types by hand is dropped rather than carried through, which is what
// keeps the displayed grouping the one this function put there.
//
// Deliberately not applied to phone/mobile/fax numbers, verification codes,
// card numbers, years, room counts, mileage or areas: none of those are read as
// a magnitude, and grouping them makes them harder to read, not easier.
export function stripThousandSeparators(
  value: string | number | undefined | null,
): string {
  return value == null ? '' : String(value).replace(/\D/g, '');
}

export function formatThousandSeparators(
  value: string | number | undefined | null,
): string {
  return numberWithCommas(stripThousandSeparators(value));
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

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// The backend's upload endpoint only accepts jpeg/png/webp (see
// uploads.controller.ts's FileTypeValidator) — iPhones save photos as HEIC
// by default since iOS 11, so picking one straight from the library (as
// opposed to a fresh camera shot, which this picker library re-encodes as
// JPEG) hits that rejection as a raw, unhelpful 400 from the server. Catch
// it client-side instead so the user gets an actionable message.
export function isSupportedImageType(mimeType?: string): boolean {
  if (!mimeType) {
    return false;
  }
  return SUPPORTED_IMAGE_TYPES.includes(mimeType.toLowerCase());
}

// Read from i18n lazily (a getter, not a frozen module-load constant) so it
// reflects the current language whenever an Alert actually shows it.
export const UNSUPPORTED_IMAGE_TYPE_MESSAGE = () =>
  i18n.t('common.imageFormatUnsupportedBody');

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;

// Buckets time-ago display the way Persian classifieds listings do —
// "یک ربع"/"نیم ساعت" instead of "۱۵ دقیقه"/"۳۰ دقیقه" specifically at
// those two marks, matching what was asked for exactly rather than a
// generic Intl.RelativeTimeFormat rounding.
export function formatRelativeTime(date: string | number | Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / MINUTE_MS);

  if (diffMinutes < 1) {
    return i18n.t('time.momentsAgo');
  }
  if (diffMinutes < 15) {
    return i18n.t('time.minutesAgo', {value: diffMinutes});
  }
  if (diffMinutes < 30) {
    return i18n.t('time.quarterHourAgo');
  }
  if (diffMinutes < 60) {
    return i18n.t('time.halfHourAgo');
  }
  const diffHours = Math.floor(diffMs / HOUR_MS);
  if (diffHours < 24) {
    return i18n.t('time.hoursAgo', {value: diffHours});
  }
  const diffDays = Math.floor(diffMs / DAY_MS);
  if (diffDays < 30) {
    return i18n.t('time.daysAgo', {value: diffDays});
  }
  const diffMonths = Math.floor(diffMs / MONTH_MS);
  return i18n.t('time.monthsAgo', {value: diffMonths});
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
export function getLegacyImagePaths(
  obj: Record<string, any> | null | undefined,
): string[] {
  if (!obj) {
    return [];
  }
  return Object.keys(obj)
    .map(key => ({key, match: key.match(IMAGE_FIELD_PATTERN)}))
    .filter(({key, match}) => match && obj[key]?.path)
    .sort((a, b) => Number(a.match![1]) - Number(b.match![1]))
    .map(({key}) => obj[key].path as string);
}
