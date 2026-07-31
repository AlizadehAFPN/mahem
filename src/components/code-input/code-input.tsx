import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {colors, scaled} from '../../theme';
import {toEnglishDigits} from '../../utiles/utiles_funcs';
export function CodeFields(props: any) {
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
      onChangeText={text => setValue(toEnglishDigits(text))}
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
  root: {flex: 1, padding: scaled(20)},
  title: {textAlign: 'center', fontSize: scaled(30)},
  codeFieldRoot: {marginTop: scaled(20)},
  cell: {
    width: scaled(40),
    height: scaled(40),
    borderBottomWidth: 2,
    borderColor: '#00000030',

    marginHorizontal: scaled(3),
  },
  textCell: {
    fontSize: scaled(24),
    lineHeight: scaled(38),
    textAlign: 'center',
    color: 'black',
  },
  focusCell: {
    borderColor: colors.main,
  },
});
