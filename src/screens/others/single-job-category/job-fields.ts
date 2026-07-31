import type {TFunction} from 'i18next';
import {localizeCategory} from '../../../i18n/display-maps';

export type JobField = {title: string; value?: string; phone?: boolean};

// The صنف detail rows, in the order SingleJobScreen lists them.
//
// Every field has to be read optionally: a JOB_APPROVED/JOB_REJECTED
// notification tap opens that screen with `{id}` and nothing else (see
// resolveNotificationTarget), so these rows are built at least once for a job
// whose real content is still in flight from getSingleJob. Reading a nested
// field unconditionally there crashed the screen on mount, which made every job
// notification untappable.
//
// `phone` marks the rows holding a phone number: those read left-to-right and
// are aligned to the left of their cell, the same rule TextField's
// `phoneNumber` prop applies to the inputs that collect them.
export function jobFields(job: any, t: TFunction): JobField[] {
  if (!job) {
    return [];
  }
  const {
    title,
    manager,
    // The API's own name for it. Reading `register_code` — the name the form
    // keeps it under in its local state — only ever found undefined, which is
    // what made a saved شماره ثبت look like it had never been stored at all.
    registerCode,
    phone,
    mobile,
    fax,
    address,
    telegram,
    instagram,
    email,
    description,
    job_category_id,
  } = job;
  return [
    {title: t('jobs.unitName'), value: title},
    {title: t('jobs.manager'), value: manager},
    {
      title: t('jobs.guildType'),
      value: localizeCategory(job_category_id?.title),
    },
    {title: t('jobs.registerCode'), value: registerCode},
    {title: t('jobs.landline'), value: phone, phone: true},
    {title: t('jobs.mobile'), value: mobile, phone: true},
    {title: t('jobs.fax'), value: fax, phone: true},
    {title: t('jobs.address'), value: address},
    {title: t('jobs.telegram'), value: telegram},
    {title: t('jobs.instagram'), value: instagram},
    {title: t('common.email'), value: email},
    {title: t('common.description'), value: description},
  ];
}
