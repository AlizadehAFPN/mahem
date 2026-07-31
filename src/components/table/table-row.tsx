import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {Row} from '../row/row';
import {Text} from '../text/text';
import {colors, scaled} from '../../theme';
export interface TableRowProps {
  onPress?: any;
  item?: any;
  header?: any;
}

export function TableRow({onPress, item, header = false}: TableRowProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Row style={{paddingHorizontal: scaled(8), paddingVertical: scaled(4)}}>
        <View style={{...styles.cell1}}>
          <Text style={styles.text} size={15}>
            {item[0]}
          </Text>
        </View>
        <View
          style={{
            ...styles.cell2,
            flex: 2,
            alignItems: header ? 'center' : 'flex-end',
          }}>
          <Text style={styles.text} size={15}>
            {item[1]}
          </Text>
        </View>
        <View
          style={{
            ...styles.cell2,
            flex: 1.5,
            alignItems: header ? 'center' : 'flex-end',
          }}>
          <Text style={styles.text} size={15}>
            {item[2]}
          </Text>
        </View>
        <View
          style={{
            ...styles.cell2,
            flex: 1,
            alignItems: header ? 'center' : 'flex-end',
            marginLeft: 0,
          }}>
          <Text style={styles.text} size={15}>
            {item[3]}
          </Text>
        </View>
      </Row>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  cell1: {
    width: scaled(35),
    height: scaled(25),
    backgroundColor: colors.pallete.gray1,
    borderRadius: scaled(4),
    marginLeft: scaled(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell2: {
    height: scaled(25),
    backgroundColor: colors.pallete.gray1,
    borderRadius: scaled(4),
    marginLeft: scaled(8),
    justifyContent: 'center',
  },
  text: {
    // lineHeight: 20,
  },
});
