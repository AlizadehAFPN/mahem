/**
 * Two app-wide rules about the text *inside* a field, both easy to undo by
 * accident from a call site:
 *
 *  1. Phone numbers are aligned left and read left-to-right, whatever the RTL
 *     copy around them says — and that has to hold even for the fields
 *     UnderlineTextField wraps, since it hard-codes textAlign: 'right' for
 *     every one of them.
 *  2. On Android a bordered field shifts its text down to sit optically
 *     centred, because IRANSansMobile's line box is bottom-heavy (see
 *     INK_CENTERING_EM). iOS places the line optically already and must be left
 *     alone, and an underline field has no box to centre in on either platform.
 */
import React from 'react';
import {Platform, StyleSheet, TextInput} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {TextField} from '../src/components/text-field/text-field';
import {UnderlineTextField} from '../src/components/text-field/underline-text-field';

// Ships as untranspiled ESM and is only the error-row icon here, so it's
// stubbed rather than adding it to transformIgnorePatterns for one test.
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');

function inputStyleOf(element: React.ReactElement) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(element);
  });
  return StyleSheet.flatten(tree!.root.findByType(TextInput).props.style);
}

// The correction is Android-only, so the platform has to be part of the test
// rather than whatever the test environment happens to default to (iOS).
function onPlatform<T>(os: 'android' | 'ios', render: () => T): T {
  const original = Platform.OS;
  Object.defineProperty(Platform, 'OS', {value: os, configurable: true});
  try {
    return render();
  } finally {
    Object.defineProperty(Platform, 'OS', {
      value: original,
      configurable: true,
    });
  }
}

describe('TextField input text', () => {
  it('aligns a phone field to the left, left-to-right', () => {
    const style = inputStyleOf(<TextField phoneNumber inputMode="tel" />);

    expect(style.textAlign).toBe('left');
    expect(style.writingDirection).toBe('ltr');
  });

  it('leaves other fields to follow the surrounding RTL copy', () => {
    const style = inputStyleOf(<TextField inputMode="tel" />);

    expect(style.textAlign).toBeUndefined();
  });

  it('wins over UnderlineTextField’s hard-coded right alignment', () => {
    expect(inputStyleOf(<UnderlineTextField />).textAlign).toBe('right');
    expect(inputStyleOf(<UnderlineTextField phoneNumber />).textAlign).toBe(
      'left',
    );
  });

  it('lets a caller restyle an underline field, replacing rather than merging', () => {
    // UnderlineTextField spreads the caller's props after its own, so an
    // `inputStyle` from a call site *replaces* the base one wholesale. The
    // filter screen relies on this to reach Figma's 15px labels (see
    // FIELD_INPUT_STYLE), and has to restate the alignment/padding itself —
    // passing only `{fontSize}` would silently drop the right alignment and
    // leave every filter row reading left-to-right.
    expect(
      inputStyleOf(<UnderlineTextField inputStyle={{fontSize: 15}} />)
        .textAlign,
    ).toBeUndefined();

    const restated = inputStyleOf(
      <UnderlineTextField
        inputStyle={{
          paddingVertical: 4,
          textAlign: 'right',
          flex: 1,
          fontSize: 15,
        }}
      />,
    );
    expect(restated.fontSize).toBe(15);
    expect(restated.textAlign).toBe('right');
  });

  it('shifts a bordered field’s text down onto the optical centre on Android', () => {
    // 0.267em down, and the same amount back off the bottom so the field's own
    // height doesn't change.
    const style = onPlatform('android', () => inputStyleOf(<TextField />));
    expect(style.marginTop).toBeCloseTo(18 * 0.267, 5);
    expect(style.marginBottom).toBeCloseTo(-18 * 0.267, 5);
    // Nothing else may decide where the line sits inside the box.
    expect(style.includeFontPadding).toBe(false);
    expect(style.paddingTop).toBe(0);
    expect(style.paddingBottom).toBe(0);
    expect(style.textAlignVertical).toBe('center');
  });

  it('scales the shift with the field’s own font size', () => {
    const small = onPlatform('android', () =>
      inputStyleOf(<TextField inputStyle={{fontSize: 12}} />),
    );
    expect(small.marginTop).toBeCloseTo(12 * 0.267, 5);
  });

  it('leaves iOS to place the line itself', () => {
    // iOS already centres a single line optically; correcting it too pushed the
    // text visibly low.
    const style = onPlatform('ios', () => inputStyleOf(<TextField />));
    expect(style.marginTop).toBe(undefined);
    expect(style.marginBottom).toBe(undefined);
  });

  it('leaves an underline field alone', () => {
    // No box to be off-centre in, so no correction even on Android — and
    // UnderlineTextField's own symmetric padding survives.
    onPlatform('android', () => {
      expect(inputStyleOf(<TextField preset="underline" />).marginTop).toBe(
        undefined,
      );
      const underline = inputStyleOf(<UnderlineTextField />);
      expect(underline.marginTop).toBe(undefined);
      expect(underline.paddingVertical).toBe(4);
    });
  });
});
