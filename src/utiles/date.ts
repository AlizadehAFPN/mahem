import moment from 'moment-jalaali';

// Every date this app puts on screen is Jalali (شمسی) — never Gregorian, in
// any language. The audience reads Persian dates, so a Gregorian one in the
// middle of a screen isn't read as "another calendar", it's read as the wrong
// date. Backend timestamps are always ISO/UTC (Gregorian), so this is the one
// place that converts them for display; nothing should format a date itself.
//
// Digits stay Latin (1405/05/08, not ۱۴۰۵/۰۵/۰۸) — that's how the Figma date
// stamps are spelled.
//
// Deliberately not `toLocaleDateString('fa-IR')`: that depends on the JS
// engine shipping a full Intl/ICU with the Persian calendar, which Hermes on
// Android does not guarantee — where it's missing the date silently falls back
// to a Gregorian one, which is exactly the failure we can't have.
export function formatJalaliDate(
  value?: string | number | Date | null,
): string {
  if (!value) {
    return '';
  }
  const date = moment(value);
  return date.isValid() ? date.format('jYYYY/jMM/jDD') : '';
}
