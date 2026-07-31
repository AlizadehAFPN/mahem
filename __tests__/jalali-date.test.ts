/**
 * formatJalaliDate is the only place a backend timestamp becomes a date on
 * screen, precisely so no screen can accidentally show a Gregorian one.
 */
import {formatJalaliDate} from '../src/utiles/date';

describe('formatJalaliDate', () => {
  it('converts a backend ISO timestamp to a Jalali date', () => {
    expect(formatJalaliDate('2021-02-04T08:00:00.000Z')).toBe('1399/11/16');
  });

  it('accepts the Date objects screens already hold', () => {
    expect(formatJalaliDate(new Date('2021-02-04T08:00:00.000Z'))).toBe(
      '1399/11/16',
    );
  });

  it('renders nothing rather than "Invalid date" for missing or junk values', () => {
    expect(formatJalaliDate(undefined)).toBe('');
    expect(formatJalaliDate(null)).toBe('');
    expect(formatJalaliDate('')).toBe('');
    expect(formatJalaliDate('not a date')).toBe('');
  });
});
