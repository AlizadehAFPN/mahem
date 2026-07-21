import {Image, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors} from '../../../theme';

function formatDate(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString('fa-IR');
}
function formatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString('fa-IR', {hour: '2-digit', minute: '2-digit'});
}

export function NewsComp({item, onPress}: {item: any; onPress?: () => void}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 10,
      }}>
      <View
        style={{
          paddingVertical: 12,
          width: '100%',
          paddingHorizontal: 10,
          borderRadius: 4,
          backgroundColor: item?.isRead ? '#D0D0D0D0' : colors.pallete.gray1,
          borderWidth: 1,
          borderColor: item?.isRead ? '#D0D0D0' : colors.main,
        }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Image
            style={{
              width: 35,
              height: 35,
              resizeMode: 'contain',
              borderRadius: 2,
            }}
            source={require('../../../assets/images/logo.png')}
          />
          <View style={{flex: 1, marginRight: 8}}>
            <Text
              style={{
                textAlign: 'right',
                fontWeight: item?.isRead ? 'normal' : 'bold',
              }}
              numberOfLines={1}>
              {item?.title}
            </Text>
            <Text style={{textAlign: 'right'}} numberOfLines={2}>
              {item?.body}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#D0D0D0',
            width: '50%',
            borderTopRightRadius: 100,
            borderWidth: 1,
            borderColor: '#707070',
            marginTop: 6,
            paddingHorizontal: 4,
            paddingRight: 20,
            paddingVertical: 2,
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          <Text>{formatTime(item?.createdAt)}</Text>
          <Text>{formatDate(item?.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
