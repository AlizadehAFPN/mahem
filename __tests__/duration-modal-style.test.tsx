/**
 * The مدت زمان تخفیف picker (Figma "تایم", node 106:8706): three small boxed
 * fields whose entered figure is red and centred. Both of those are easy to
 * lose — the shared TextField defaults to black, left-of-centre text in a
 * 55pt-tall box — so they're pinned here rather than left to a visual check,
 * along with the modal staying driven by the duration the form already holds
 * (an uncontrolled copy is what used to make reopening the picker show empty
 * boxes, i.e. no red figures at all).
 */
import React from 'react';
import {StyleSheet, TextInput} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {DurationModal} from '../src/components/modal/duration-modal';
import {colors} from '../src/theme';

// Reached only through TextField's error row, and ships as untranspiled ESM —
// stubbed rather than adding it to transformIgnorePatterns for one test.
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');

function inputsOf(element: React.ReactElement) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(element);
  });
  return tree!.root.findAllByType(TextInput);
}

const noop = () => {};

describe('DurationModal', () => {
  it('draws each figure red and centred in its own small box', () => {
    const inputs = inputsOf(
      <DurationModal visible onClose={noop} onChangeText={noop} />,
    );

    expect(inputs).toHaveLength(3);
    inputs.forEach(input => {
      const style = StyleSheet.flatten(input.props.style);
      expect(style.color).toBe(colors.pallete.red2);
      expect(style.textAlign).toBe('center');
      expect(style.fontSize).toBe(15);
    });
  });

  it('shows the duration the form already holds', () => {
    const inputs = inputsOf(
      <DurationModal
        visible
        onClose={noop}
        onChangeText={noop}
        value={{minutes: '40', houres: '7', days: '3'}}
      />,
    );

    // Rendered دقیقه-first: Row lays its children out row-reverse, so the
    // first child is the rightmost one on screen.
    expect(inputs.map(input => input.props.value)).toEqual(['40', '7', '3']);
  });

  it('reports which unit changed so the form can merge it', () => {
    const onChangeText = jest.fn();
    const inputs = inputsOf(
      <DurationModal visible onClose={noop} onChangeText={onChangeText} />,
    );

    act(() => {
      inputs[2].props.onChangeText('5');
    });

    expect(onChangeText).toHaveBeenCalledWith('5', 'days');
  });
});
