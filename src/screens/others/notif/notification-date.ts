import moment from 'moment-jalaali';
import type {TFunction} from 'i18next';
// Straight from the module, not the utiles barrel: that barrel also pulls in
// geolocation, whose native module isn't available under Jest.
import {formatJalaliDate} from '../../../utiles/date';

// Figma 106:620 stamps every row twice: a coarse "how long ago" on the left
// (11:16 / دیروز / هفته پیش / دو هفته پیش) and the calendar date on the right.
// Both live in the bar under the message bubble.

// Jalali in every language — Figma spells it 1399/11/16. English used to get a
// Gregorian date here, but no date in this app may be shown in Gregorian.
export function formatNotificationDate(iso?: string) {
  return formatJalaliDate(iso);
}

export function formatNotificationAge(iso: string | undefined, t: TFunction) {
  if (!iso) {
    return '';
  }
  // Calendar days apart, not elapsed hours: a message from 23:50 is "دیروز"
  // once past midnight, which is how the Figma labels read.
  const days = moment().startOf('day').diff(moment(iso).startOf('day'), 'days');
  if (days <= 0) {
    return moment(iso).format('HH:mm');
  }
  if (days === 1) {
    return t('notif.yesterday');
  }
  if (days < 7) {
    return t('notif.daysAgo', {value: days});
  }
  const weeks = Math.floor(days / 7);
  if (weeks === 1) {
    return t('notif.weekAgo');
  }
  if (weeks === 2) {
    return t('notif.twoWeeksAgo');
  }
  if (weeks < 5) {
    return t('notif.weeksAgo', {value: weeks});
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return t('notif.monthsAgo', {value: months});
  }
  return t('notif.yearsAgo', {value: Math.floor(days / 365)});
}
