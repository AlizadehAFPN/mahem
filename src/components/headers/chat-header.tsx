import {StyleSheet, View, Image} from 'react-native';
import React from 'react';
import {Row} from '../row/row';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {Divider} from '../divider/divider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors, scaled} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
interface ChatHeaderProps {
  title?: string;
  avatar?: string;
  onCreatePress?: () => void;
}
export function ChatHeader({title, avatar, onCreatePress}: ChatHeaderProps) {
  const {t} = useTranslation();
  const {goBack} = useNavigation<any>();
  return (
    <View style={styles.continer}>
      <Row
        style={{
          justifyContent: 'space-between',
          paddingHorizontal: scaled(8),
          paddingBottom: scaled(4),
        }}>
        <Row>
          <Button onPress={() => goBack()}>
            <MaterialIcons
              color="white"
              size={scaled(30)}
              name="keyboard-arrow-right"
            />
          </Button>
          <Divider style={{width: scaled(5)}} />
          <Image
            style={{
              width: scaled(41),
              height: scaled(41),
              borderRadius: scaled(30),
              overflow: 'hidden',
            }}
            resizeMode={avatar ? 'cover' : 'contain'}
            source={
              avatar ? {uri: avatar} : require('../../assets/images/logo.png')
            }
          />
          <Divider style={{width: scaled(5)}} />
          <Text size={17} color="white">
            {title || t('chat.mahemUser')}
          </Text>
        </Row>

        {onCreatePress && (
          <Button onPress={onCreatePress}>
            <Image
              source={require('../../assets/images/phone-white.png')}
              style={{width: scaled(26), height: scaled(26)}}
            />
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
