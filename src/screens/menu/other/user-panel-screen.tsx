import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {
  Screen,
  Row,
  Text,
  Divider,
  Button,
  ChatItem,
} from '../../../components';
import {colors} from '../../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {deleteAds, getConversations, getMyAds} from '../../../services';
import {formatRelativeTime} from '../../../utiles/utiles_funcs';

export function UserPanelScreen() {
  const [state, setState] = useState({
    adsMode: true,
  });
  const {goBack, navigate} = useNavigation();
  const queryClient = useQueryClient();

  const {data: myAds} = useQuery('myAds', getMyAds);
  const {mutate: deleteAdMutate} = useMutation(deleteAds, {
    onSuccess: () => queryClient.invalidateQueries('myAds'),
  });
  const {data: conversations} = useQuery('conversations', getConversations, {
    enabled: !state.adsMode,
  });

  const onEditAd = (item: any) => navigate('editAd', {ad: item});
  const onDeleteAd = (item: any) => {
    Alert.alert('حذف آگهی', 'آیا از حذف این آگهی مطمئن هستید؟', [
      {text: 'انصراف', style: 'cancel'},
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => deleteAdMutate(item.id),
      },
    ]);
  };

  return (
    <Screen withoutScroll>
      <Row style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <MaterialIcons size={25} color="white" name="arrow-forward-ios" />
        </TouchableOpacity>
      </Row>
      <View style={styles.avatarCon}>
        <View style={styles.avatar}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={require('../../../assets/images/userav1.png')}
          />
        </View>
        <Text size={20}>پنل مدیریت کاربر</Text>
      </View>
      {state.adsMode ? (
        <FlatList
          data={myAds?.data.ads}
          ItemSeparatorComponent={<Divider height={4} />}
          renderItem={({item}) => (
            <View>
              <TouchableOpacity
                onPress={() => navigate('singleProduct', {ads: item})}
                style={{paddingHorizontal: 8}}>
                <Image
                  style={{width: '100%', height: 80, resizeMode: 'contain'}}
                  source={require('../../../assets/images/adlist.png')}
                />
                {item.approvalStatus && item.approvalStatus !== 'APPROVED' && (
                  <View
                    style={[
                      styles.statusBadge,
                      item.approvalStatus === 'REJECTED'
                        ? styles.statusBadgeRejected
                        : styles.statusBadgePending,
                    ]}>
                    <Text size={11} color="white">
                      {item.approvalStatus === 'REJECTED'
                        ? 'رد شده'
                        : 'در انتظار تایید'}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    position: 'absolute',
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 0,
                    paddingHorizontal: 8,
                    paddingTop: 7,
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{paddingHorizontal: 8}} size={17}>
                    {item.title}
                  </Text>
                  {item.approvalStatus === 'REJECTED' &&
                    item.rejectionReason && (
                      <Text
                        style={{paddingHorizontal: 8}}
                        size={12}
                        color={colors.pallete.red}>
                        دلیل رد: {item.rejectionReason}
                      </Text>
                    )}
                  <Row style={{marginBottom: 2}}>
                    <View style={{flex: 1.1}} />
                    <Row
                      style={{
                        flex: 0.9,
                        justifyContent: 'space-between',
                        paddingHorizontal: 10,
                      }}>
                      <Text size={12} color={colors.main}>
                        {item.createdAt ? formatRelativeTime(item.createdAt) : ''}
                      </Text>
                      <Text size={12} color={colors.main}>
                        1399/02/15
                      </Text>
                    </Row>
                  </Row>
                </View>
              </TouchableOpacity>
              <Row style={{paddingHorizontal: 16, marginTop: 4}}>
                <Button
                  onPress={() => navigate('adViewStats', {advertisementId: item.id})}
                  style={styles.rowActionButton}>
                  <Text size={13} color={colors.text}>
                    آمار بازدید
                  </Text>
                </Button>
                <Divider style={{width: 10}} />
                <Button
                  onPress={() => onEditAd(item)}
                  style={styles.rowActionButton}>
                  <Text size={13} color={colors.main}>
                    ویرایش
                  </Text>
                </Button>
                <Divider style={{width: 10}} />
                <Button
                  onPress={() => onDeleteAd(item)}
                  style={styles.rowActionButton}>
                  <Text size={13} color={colors.pallete.red2}>
                    حذف
                  </Text>
                </Button>
              </Row>
            </View>
          )}
          ListHeaderComponent={<Divider height={10} />}
          ListFooterComponent={<Divider height={120} />}
        />
      ) : (
        <FlatList
          style={{paddingHorizontal: 8}}
          data={conversations || []}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ChatItem item={item} />}
          ListFooterComponent={<Divider height={120} />}
          ListHeaderComponent={<Divider height={10} />}
          ItemSeparatorComponent={<Divider height={8} />}
        />
      )}

      <View style={styles.absButtons}>
        <TouchableOpacity
          onPress={() => setState(s => ({...s, adsMode: !s.adsMode}))}
          style={styles.circle}>
          {state.adsMode ? (
            <Image
              style={{width: 30, height: 30}}
              source={require('../../../assets/images/chatwhite.png')}
            />
          ) : (
            <Image
              style={{width: 30, height: 30}}
              source={require('../../../assets/images/speaker.png')}
            />
          )}
        </TouchableOpacity>
        <Divider height={10} />
        <TouchableOpacity
          onPress={() => navigate('newAdvertising')}
          style={styles.circle}>
          <Entypo name="plus" color="white" size={40} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 77,
    backgroundColor: colors.main,
  },
  rowActionButton: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
  avatarCon: {
    height: 83,
    backgroundColor: colors.pallete.gray1,
    alignItems: 'center',
  },
  avatar: {
    height: 94,
    width: 94,
    borderRadius: 50,
    marginTop: -47,
    overflow: 'hidden',
    borderWidth: 1,
  },
  absButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  circle: {
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
  statusBadge: {
    position: 'absolute',
    top: 6,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgePending: {
    backgroundColor: '#E8A317',
  },
  statusBadgeRejected: {
    backgroundColor: colors.pallete.red2,
  },
});
