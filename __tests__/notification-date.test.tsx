/**
 * The bar under each پیام‌ها row carries two stamps (Figma 106:620): a coarse
 * "how long ago" on the left and the calendar date on the right. Both are easy
 * to get subtly wrong — the age label counts calendar days rather than elapsed
 * hours, and the date must come out Jalali whatever the app's language is.
 */
import i18n from '../src/i18n';
import {
  formatNotificationAge,
  formatNotificationDate,
} from '../src/screens/others/notif/notification-date';

const t = i18n.t.bind(i18n);

function daysAgo(days: number, hour = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
}

describe('formatNotificationAge', () => {
  beforeEach(() => i18n.changeLanguage('fa'));

  it("shows the clock time for today's messages", () => {
    expect(formatNotificationAge(daysAgo(0, 11), t)).toBe('11:30');
  });

  it('counts calendar days, so 23:50 last night is دیروز', () => {
    expect(formatNotificationAge(daysAgo(1, 23), t)).toBe('دیروز');
  });

  it('names the labels Figma spells out', () => {
    expect(formatNotificationAge(daysAgo(3), t)).toBe('3 روز پیش');
    expect(formatNotificationAge(daysAgo(8), t)).toBe('هفته پیش');
    expect(formatNotificationAge(daysAgo(15), t)).toBe('دو هفته پیش');
    expect(formatNotificationAge(daysAgo(22), t)).toBe('3 هفته پیش');
    expect(formatNotificationAge(daysAgo(70), t)).toBe('2 ماه پیش');
    expect(formatNotificationAge(daysAgo(800), t)).toBe('2 سال پیش');
  });

  it('translates rather than falling back to raw keys', () => {
    i18n.changeLanguage('en');
    expect(formatNotificationAge(daysAgo(1), t)).toBe('Yesterday');
    expect(formatNotificationAge(daysAgo(3), t)).toBe('3 days ago');
  });

  it('has nothing to show without a timestamp', () => {
    expect(formatNotificationAge(undefined, t)).toBe('');
  });
});

describe('formatNotificationDate', () => {
  it('writes Jalali for Persian', () => {
    i18n.changeLanguage('fa');
    expect(formatNotificationDate('2021-02-04T08:00:00.000Z')).toBe(
      '1399/11/16',
    );
  });

  // No date anywhere in this app may be Gregorian, English included — it used
  // to switch to 2021/02/04 here.
  it('stays Jalali in English too', () => {
    i18n.changeLanguage('en');
    expect(formatNotificationDate('2021-02-04T08:00:00.000Z')).toBe(
      '1399/11/16',
    );
  });

  it('has nothing to show without a timestamp', () => {
    expect(formatNotificationDate(undefined)).toBe('');
  });
});
