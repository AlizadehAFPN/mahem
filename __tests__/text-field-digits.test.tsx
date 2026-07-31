/**
 * Persian/Arabic-Indic digits typed into a numeric field must be converted to
 * English both in the value the screen stores *and* in the text left on
 * screen. The second half is the one that regressed: normalizing only the
 * onChangeText argument leaves an uncontrolled TextInput rendering whatever
 * was typed, so the field still visibly read «۰۹۳۵».
 */
import React from 'react';
import {TextInput} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {TextField} from '../src/components/text-field/text-field';

// Ships as untranspiled ESM and is only the error-row icon here, so it's
// stubbed rather than adding it to transformIgnorePatterns for one test.
// babel-plugin-jest-hoist lifts this above the imports, so the stub is in
// place before TextField is loaded despite appearing after it here.
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

describe('TextField digit normalization', () => {
  it('converts Persian digits in an uncontrolled numeric field', () => {
    const onChangeText = jest.fn();
    const f = renderField({inputMode: 'tel', onChangeText});

    f.type('۰۹۳۵۴۸۷۵۰۱۴');

    expect(onChangeText).toHaveBeenCalledWith('09354875014');
    expect(f.displayed()).toBe('09354875014');
  });

  it('converts Arabic-Indic digits too', () => {
    const onChangeText = jest.fn();
    const f = renderField({keyboardType: 'number-pad', onChangeText});

    f.type('٠٩١٢');

    expect(onChangeText).toHaveBeenCalledWith('0912');
    expect(f.displayed()).toBe('0912');
  });

  it('normalizes a caller-controlled value for display', () => {
    const onChangeText = jest.fn();
    const f = renderField({inputMode: 'numeric', value: '۱۲۳', onChangeText});

    expect(f.displayed()).toBe('123');

    // The caller stays the source of truth: a new value flows straight through.
    f.rerender({inputMode: 'numeric', value: '۴۵۶', onChangeText});
    expect(f.displayed()).toBe('456');
  });

  it('leaves English digits and mixed text alone', () => {
    const onChangeText = jest.fn();
    const f = renderField({inputMode: 'tel', onChangeText});

    f.type('0912');

    expect(onChangeText).toHaveBeenCalledWith('0912');
    expect(f.displayed()).toBe('0912');
  });

  it('does not touch non-numeric fields', () => {
    const onChangeText = jest.fn();
    const f = renderField({onChangeText});

    f.type('نام ۱');

    // Persian text fields (username, ad title) must keep exactly what was
    // typed — including digits, which are part of the name there.
    expect(onChangeText).toHaveBeenCalledWith('نام ۱');
    expect(f.displayed()).toBeUndefined();
  });
});
