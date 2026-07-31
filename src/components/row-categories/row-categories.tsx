import {View} from 'react-native';
import React from 'react';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {scaled} from '../../theme';

export function RowCategories({
  title,
  showMoreLabel,
  children,
  onPressMore,
}: any) {
  return (
    <View>
      <Row
        style={{
          marginVertical: scaled(8),
          justifyContent: 'space-between',
          paddingHorizontal: scaled(10),
        }}>
        <Text size={17}>{title}</Text>
        <Button onPress={onPressMore}>
          <Text size={17}>{showMoreLabel}</Text>
        </Button>
      </Row>
      {children}
    </View>
  );
}
