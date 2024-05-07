import {StyleSheet, View, Image} from 'react-native';
import React from 'react';
import {Row, Button, Text, Divider, AdsImageSelection} from '../';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
export function ChatHeader({onCreatePress, onSelectImage}) {
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
            source={require('../../assets/images/userMarketAvatar.png')}
          />
          <Divider style={{width: 5}} />
          <Text size={17} color="white">
            کاربر ماهم
          </Text>
        </Row>

        <Button onPress={onCreatePress}>
          <Image source={require('../../assets/images/phone-white.png')} />
        </Button>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  continer: {
    backgroundColor: colors.main,
  },
});
