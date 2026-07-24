import {StyleSheet, View, Image} from 'react-native';
import React from 'react';
import {Row} from '../row/row';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {Divider} from '../divider/divider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
interface ChatHeaderProps {
  title?: string;
  avatar?: string;
  onCreatePress?: () => void;
}
export function ChatHeader({title, avatar, onCreatePress}: ChatHeaderProps) {
  const {goBack} = useNavigation();
  return (
    <View style={styles.continer}>
      <Row
        style={{
          justifyContent: 'space-between',
          paddingHorizontal: 8,
          paddingBottom: 4,
        }}>
        <Row>
          <Button onPress={() => goBack()}>
            <MaterialIcons
              color="white"
              size={30}
              name="keyboard-arrow-right"
            />
          </Button>
          <Divider style={{width: 5}} />
          <Image
            style={{
              width: 41,
              height: 41,
              borderRadius: 30,
              overflow: 'hidden',
            }}
            resizeMode={avatar ? 'cover' : 'contain'}
            source={
              avatar
                ? {uri: avatar}
                : require('../../assets/images/logo.png')
            }
          />
          <Divider style={{width: 5}} />
          <Text size={17} color="white">
            {title || 'کاربر ماهم'}
          </Text>
        </Row>

        {onCreatePress && (
          <Button onPress={onCreatePress}>
            <Image source={require('../../assets/images/phone-white.png')} />
          </Button>
        )}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  continer: {
    backgroundColor: colors.main,
  },
});
