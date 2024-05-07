import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import React from 'react';
import {colors} from '../../../theme';
import {Text, Row} from '../../';
import {useNavigation} from '@react-navigation/native';
export function ChatItem({item}) {
  //   console.log('----', item);
  const {navigate} = useNavigation();
  return (
    <TouchableOpacity
      onPress={() =>
        navigate('chat', {
          title: item?.title,
          id: item?.id,
          receiver: item?.receiver,
        })
      }
      style={styles.container}>
      <Text size={22}>{item?.title}</Text>
      <Row style={{width: '100%', justifyContent: 'space-between'}}>
        <View />
        <Row style={{}}>
          <Text style={{marginLeft: 8}} size={17}>
            {item?.sender}
          </Text>
          <Image
            style={{
              resizeMode: 'contail',
              marginLeft: -30,
              height: 45,
              width: 45,
              borderRadius: 12,
            }}
            source={require('../../../assets/images/userMarketAvatar.png')}
          />
        </Row>
      </Row>
      <Text style={{marginBottom: 10}} size={12} color={colors.pallete.blue}>
        3ساعت قبل
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // height:96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    marginLeft: 23,
    paddingHorizontal: 8,
  },
});
