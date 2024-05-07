import React, {useState} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {colors} from '../../theme';
export function CodeFields(props) {
  const {value, setValue, cellcount} = props;
  // const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: cellcount});
  const [propse, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <CodeField
      ref={ref}
      {...propse}
      // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
      value={value}
      onChangeText={setValue}
      cellCount={cellcount}
      rootStyle={styles.codeFieldRoot}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={({index, symbol, isFocused}) => (
        <View
          key={String(index)}
          style={[styles.cell, isFocused && styles.focusCell]}>
          <Text
            key={index}
            style={styles.textCell}
            onLayout={getCellOnLayoutHandler(index)}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cell: {
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderColor: '#00000030',

    marginHorizontal: 3,
  },
  textCell: {
    fontSize: 24,
    lineHeight: 38,
    textAlign: 'center',
    color: 'black',
  },
  focusCell: {
    borderColor: colors.main,
  },
});
