/**
 * SingleJobScreen is opened two ways: a list hands it the whole job, or a
 * JOB_APPROVED/JOB_REJECTED notification tap hands it `{id}` alone and the rows
 * are built while getSingleJob is still in flight. The second case used to
 * throw «Cannot read property 'title' of undefined» on mount, so every job
 * notification dead-ended in a red screen.
 */
import type {TFunction} from 'i18next';
import {jobFields} from '../src/screens/others/single-job-category/job-fields';

const t = ((key: string) => key) as unknown as TFunction;

describe('jobFields', () => {
  it('builds every row without throwing for a job that is only an id', () => {
    const rows = jobFields({id: 'a-job-id'}, t);
    expect(rows).toHaveLength(12);
    // Labels are all there; the values simply have nothing to show yet.
    expect(rows.every(row => !!row.title)).toBe(true);
    expect(rows.every(row => !row.value)).toBe(true);
  });

  it('reads the guild type off the mapped job category', () => {
    const rows = jobFields(
      {id: 'x', title: 'نان سحر', job_category_id: {title: 'صنف تست'}},
      t,
    );
    expect(rows[0].value).toBe('نان سحر');
    expect(rows[2].value).toBe('صنف تست');
  });

  it('has nothing to list without a job at all', () => {
    expect(jobFields(undefined, t)).toEqual([]);
    expect(jobFields(null, t)).toEqual([]);
  });

  it('marks the phone-number rows so they render left-to-right', () => {
    const rows = jobFields({id: 'x', phone: '0173', mobile: '0935'}, t);
    expect(rows.filter(row => row.phone).map(row => row.title)).toEqual([
      'jobs.landline',
      'jobs.mobile',
      'jobs.fax',
    ]);
  });
});
