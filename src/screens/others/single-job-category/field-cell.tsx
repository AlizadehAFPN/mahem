import React, {useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {Text} from '../../../components/text/text';
import {colors, scaled} from '../../../theme';

// The gray label/value cells shared by the job detail screen and the job form.
//
// None of them is given a size of its own any more. Android builds a line box
// out of the font's own metrics, and IRANSansMobile reserves a 0.717em descent
// for Persian descenders on top of a 0.870em ascent — so a single line of 13pt
// text already asks for more than the 19pt these cells used to be pinned to,
// and asks for more again as soon as the phone's display/font size is turned
// up (which is why only some Android devices showed it). Anything taller than
// the box was cut off, the Latin values — telegram, instagram, email — first.
// Every cell now states a floor and grows to whatever its content needs.
const CELL_MIN_HEIGHT = scaled(19);
const CELL_H_PADDING = scaled(4);
// The label column's floor: the width it has in the design, and only a
// starting point — useLabelColumnWidth widens it to fit the labels themselves.
const MIN_LABEL_WIDTH = scaled(70);

export const fieldStyles = StyleSheet.create({
  cell: {
    minHeight: CELL_MIN_HEIGHT,
    backgroundColor: colors.pallete.gray1,
    borderRadius: scaled(4),
    justifyContent: 'center',
    marginVertical: scaled(4),
    paddingHorizontal: CELL_H_PADDING,
    paddingVertical: 2,
  },
  measureLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
  },
});

/**
 * How wide the label column has to be for the labels it is actually holding —
 * the widest of them plus the cell's own padding, never less than the design's
 * width. Every row is handed the same number, so the value cells stay aligned
 * with each other exactly as they do in the design while a longer translation
 * or a larger system font widens the whole column instead of wrapping or
 * clipping inside it.
 *
 * Render the returned `labelMeasurer` once anywhere inside the screen: it lays
 * the labels out off-screen with nothing constraining their width, which is
 * the only way to learn how wide they want to be — a label sitting in the
 * column can only ever report the column's own width back.
 */
export function useLabelColumnWidth(labels: string[]) {
  const labelKey = labels.join('\n');
  const [measured, setMeasured] = useState({key: labelKey, width: 0});
  // Switching language swaps every label, so what was measured for the old set
  // says nothing about the new one. The reset happens during render rather than
  // in an effect, and the measuring labels are re-mounted with it (hence the
  // key below), so a measurement can neither be wiped by a reset that runs
  // after it nor be skipped because the new label happened to lay out at the
  // width the old one already had.
  if (measured.key !== labelKey) {
    setMeasured({key: labelKey, width: 0});
  }

  const onLabelLayout = (e: LayoutChangeEvent) => {
    const width = Math.ceil(e.nativeEvent.layout.width);
    setMeasured(current =>
      current.key === labelKey && width > current.width
        ? {key: labelKey, width}
        : current,
    );
  };

  const widest = measured.key === labelKey ? measured.width : 0;
  return {
    labelWidth: Math.max(MIN_LABEL_WIDTH, widest + CELL_H_PADDING * 2),
    labelMeasurer: (
      <View
        key={labelKey}
        style={fieldStyles.measureLayer}
        pointerEvents="none"
        // It exists to be measured, not read: without this TalkBack would
        // announce every label a second time.
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden>
        {labels.map((label, index) => (
          <Text key={`${label}-${index}`} onLayout={onLabelLayout}>
            {label}
          </Text>
        ))}
      </View>
    ),
  };
}
