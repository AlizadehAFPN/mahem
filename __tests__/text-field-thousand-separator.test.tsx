/**
 * Money fields group their digits in threes while the user types ("1,500,000"),
 * matching how every price is already rendered elsewhere in the app
 * (numberWithCommas). The grouping is display-only: what reaches onChangeText —
 * and therefore the screen's state, its validation and the request body — is
 * still the plain number.
 *
 * The other half of this is the one worth guarding: `thousandSeparator` is
 * opt-in per field, so mobile/landline/fax numbers, verification codes, card
 * numbers, build years and mileages — all numeric fields too — must come out
 * exactly as typed.
 */
import React from 'react';
import {TextInput} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {TextField} from '../src/components/text-field/text-field';

jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');

function renderField(props: any) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<TextField {...props} />);
  });
  const input = () => tree!.root.findByType(TextInput);
  return {
    type: (text: string) =>
      act(() => {
        input().props.onChangeText(text);
      }),
    displayed: () => input().props.value,
    rerender: (next: any) =>
      act(() => {
        tree!.update(<TextField {...next} />);
      }),
  };
}

describe('TextField thousand separators', () => {
  it('groups what is shown but hands back plain digits', () => {
    const onChangeText = jest.fn();
    const f = renderField({
      keyboardType: 'number-pad',
      thousandSeparator: true,
      onChangeText,
    });

    f.type('1500000');

    expect(onChangeText).toHaveBeenCalledWith('1500000');
    expect(f.displayed()).toBe('1,500,000');
  });

  it('regroups as each digit is appended', () => {
    const onChangeText = jest.fn();
    const f = renderField({
      keyboardType: 'number-pad',
      thousandSeparator: true,
      onChangeText,
    });

    f.type('1');
    expect(f.displayed()).toBe('1');
    // What the field hands back is what comes straight back in on the next
    // keystroke, already carrying the separators this component drew.
    f.type('1,2');
    expect(f.displayed()).toBe('12');
    f.type('1,234');
    expect(f.displayed()).toBe('1,234');
    f.type('1,2345');
    expect(f.displayed()).toBe('12,345');
    expect(onChangeText).toHaveBeenLastCalledWith('12345');
  });

  it('groups a caller-controlled value, including Persian digits', () => {
    const onChangeText = jest.fn();
    const props = {
      keyboardType: 'number-pad',
      thousandSeparator: true,
      onChangeText,
    };
    const f = renderField({...props, value: '۲۵۰۰۰۰۰۰'});

    expect(f.displayed()).toBe('25,000,000');

    // A price prefilled from an ad being edited arrives as a number.
    f.rerender({...props, value: 980000});
    expect(f.displayed()).toBe('980,000');
  });

  it('drops separators a user types by hand rather than storing them', () => {
    const onChangeText = jest.fn();
    const f = renderField({
      keyboardType: 'number-pad',
      thousandSeparator: true,
      onChangeText,
    });

    f.type('12,00,0');

    expect(onChangeText).toHaveBeenCalledWith('12000');
    expect(f.displayed()).toBe('12,000');
  });

  it('shows an empty field as empty, not as a stray separator', () => {
    const onChangeText = jest.fn();
    const f = renderField({
      keyboardType: 'number-pad',
      thousandSeparator: true,
      value: '',
      onChangeText,
    });

    expect(f.displayed()).toBe('');
  });

  it('leaves phone numbers, codes and years untouched', () => {
    const onChangeText = jest.fn();

    const mobile = renderField({
      inputMode: 'tel',
      phoneNumber: true,
      onChangeText,
    });
    mobile.type('09354875014');
    expect(onChangeText).toHaveBeenLastCalledWith('09354875014');
    expect(mobile.displayed()).toBe('09354875014');

    const code = renderField({keyboardType: 'number-pad', onChangeText});
    code.type('12345');
    expect(onChangeText).toHaveBeenLastCalledWith('12345');
    expect(code.displayed()).toBe('12345');

    // Build year / mileage / area sit in the same forms as the price fields.
    const year = renderField({
      keyboardType: 'number-pad',
      value: '1402',
      onChangeText,
    });
    expect(year.displayed()).toBe('1402');
  });
});
