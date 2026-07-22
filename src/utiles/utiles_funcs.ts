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
