/**
 * The countdown on a discount card broke its remaining seconds down with
 * `rem1 % 60`, which is the leftover *seconds* inside a minute rather than the
 * minutes inside the hour. Anything whose minutes weren't already zero — most
 * of the time — displayed «۰۰ دقیقه» beside a correct day and hour figure.
 */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Timer} from '../src/components/custom/timer/timer';
import {Text} from '../src/components/text/text';

// The component schedules a 60s tick. Fake timers keep it from firing into a
// torn-down renderer after the test finishes.
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

/** The three figures the timer prints, in render order: days, hours, minutes. */
function breakdown(seconds: number) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Timer time={seconds} />);
  });
  // Days render as a raw number, hours and minutes as zero-padded strings —
  // normalise so the assertion is about the values, not their JS types.
  const numbers = tree!.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter(
      child =>
        (typeof child === 'string' || typeof child === 'number') &&
        /^\d+$/.test(String(child)),
    )
    .map(String);
  act(() => {
    tree!.unmount();
  });
  return numbers;
}

const HOUR = 3600;
const DAY = 24 * HOUR;

describe('Timer', () => {
  it('splits a duration into days, hours and minutes', () => {
    // 1 day, 1 hour, 30 minutes — the case the old arithmetic reported as
    // zero minutes.
    expect(breakdown(DAY + HOUR + 30 * 60)).toEqual(['1', '01', '30']);
  });

  it('keeps hours and minutes two digits wide', () => {
    // So the row doesn't change width as the countdown crosses 10 and then 1.
    expect(breakdown(2 * DAY + 5 * HOUR + 7 * 60)).toEqual(['2', '05', '07']);
  });

  it('shows zeros rather than blanks once the time is up', () => {
    expect(breakdown(0)).toEqual(['0', '00', '00']);
  });
});
