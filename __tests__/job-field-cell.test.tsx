/**
 * The gray label/value cells on بانک مشاغل's detail screen and form. Both
 * dimensions used to be hard-coded — a 19pt-tall box for a line of 13pt
 * IRANSansMobile, and a 70pt-wide label column — and on Android, where the line
 * box is built from the font's own ascent/descent (and grows again with the
 * phone's display size), whatever didn't fit was clipped. The rules that keep
 * that from coming back are cheap to state and invisible in a screenshot on a
 * default-sized phone, so they're pinned here.
 */
import React from 'react';
import {Text as ReactNativeText} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import {
  fieldStyles,
  useLabelColumnWidth,
} from '../src/screens/others/single-job-category/field-cell';

let labelWidth = 0;

function Harness({labels}: {labels: string[]}) {
  const column = useLabelColumnWidth(labels);
  labelWidth = column.labelWidth;
  return column.labelMeasurer;
}

function render(labels: string[]) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<Harness labels={labels} />);
  });
  return tree!;
}

// The off-screen labels reporting back how wide they want to be.
function measure(tree: renderer.ReactTestRenderer, width: number) {
  act(() => {
    tree.root
      .findAllByType(ReactNativeText)
      .forEach(label => label.props.onLayout({nativeEvent: {layout: {width}}}));
  });
}

describe('job field cells', () => {
  it('gives a cell a floor to grow from, never a height', () => {
    expect(fieldStyles.cell.height).toBeUndefined();
    expect(fieldStyles.cell.minHeight).toBeGreaterThan(0);
  });

  it('keeps the design width while the labels fit inside it', () => {
    const tree = render(['تلفن', 'فکس']);
    expect(labelWidth).toBe(70);

    measure(tree, 40);
    expect(labelWidth).toBe(70);
  });

  it('widens the column to whatever the widest label needs', () => {
    const tree = render(['تلفن همراه', 'فکس']);

    measure(tree, 96.4);
    // The measured text, rounded up, plus the cell's own padding either side.
    expect(labelWidth).toBe(105);
  });

  it('re-measures when the labels themselves change', () => {
    const tree = render(['تلفن همراه']);
    measure(tree, 96.4);
    expect(labelWidth).toBe(105);

    act(() => {
      tree.update(<Harness labels={['Mobile']} />);
    });
    expect(labelWidth).toBe(70);

    measure(tree, 52);
    expect(labelWidth).toBe(70);
  });
});
