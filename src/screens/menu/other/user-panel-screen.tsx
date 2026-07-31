import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Screen,
  Row,
  Text,
  Divider,
  Button,
  ChatItem,
} from '../../../components';
import {colors, scaled} from '../../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useSelector} from 'react-redux';
import {
  deleteAds,
  getConversations,
  getMyAds,
  renewAds,
} from '../../../services';
import {formatRelativeTime} from '../../../utiles/utiles_funcs';
import {RootState} from '../../../stateManager';

export function UserPanelScreen() {
  const {t} = useTranslation();
  const {params} = useRoute<any>();
  const [state, setState] = useState({
    // Opens on آگهی‌های من unless something asked for the messages list —
    // the چت button on your own ad detail page does (see SinlgeProduct).
    adsMode: params?.mode !== 'chats',
  });
  // Coming back here from an ad's چت button has to land on the messages list
  // even when this screen is already mounted further down the stack: React
  // Navigation reuses that instance and only swaps its params, so the initial
  // state above runs once and never again.
  useEffect(() => {
    if (params?.mode) {
      setState(s => ({...s, adsMode: params.mode !== 'chats'}));
    }
  }, [params?.mode]);
  const {goBack, navigate} = useNavigation<any>();
  const queryClient = useQueryClient();
  const user = useSelector((s: RootState) => s.user);

  const {data: myAds} = useQuery('myAds', getMyAds);
  const {mutate: deleteAdMutate} = useMutation(deleteAds, {
    onSuccess: () => queryClient.invalidateQueries('myAds'),
  });
  const {data: conversations} = useQuery('conversations', getConversations, {
    enabled: !state.adsMode,
  });

  const onEditAd = (item: any) => navigate('editAd', {ad: item});
  const onDeleteAd = (item: any) => {
    const isRejected = item.approvalStatus === 'REJECTED';
    Alert.alert(
      isRejected
        ? t('userPanel.deleteAdCompletelyTitle')
        : t('userPanel.deleteAdTitle'),
      isRejected
        ? t('userPanel.deleteRejectedBody')
        : t('userPanel.deleteConfirmBody'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: isRejected
            ? t('userPanel.deleteCompletely')
            : t('common.delete'),
          style: 'destructive',
          onPress: () => deleteAdMutate(item.id),
        },
      ],
    );
  };

  // Fee-required ads only (see Category.adFeeToman / item.paymentStatus) —
  // opens the same test payment gateway ad creation uses, then flags the ad
  // as awaiting a new manual bank-transfer confirmation. expiresAt only
  // actually moves once an admin confirms the payment in mahem-admin.
  const onRenewAd = (item: any) => {
    navigate('bankGateway', {
      amount: item.category_id?.adFeeToman,
      description: t('userPanel.renewAdDescription', {title: item.title}),
      onSuccess: async () => {
        try {
          await renewAds(item.id);
          queryClient.invalidateQueries('myAds');
          goBack();
          Alert.alert(
            t('store.renewRequested'),
            t('userPanel.renewRequestedBody'),
          );
        } catch (e) {
          Alert.alert(t('common.error'), t('store.renewError'));
        }
      },
    });
  };

  return (
    <Screen withoutScroll>
      <Row style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <MaterialIcons
            size={scaled(25)}
            color="white"
            name="arrow-forward-ios"
          />
        </TouchableOpacity>
      </Row>
      <View style={styles.avatarCon}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigate('editProfile')}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={
              user?.avatar
                ? {uri: user.avatar}
                : require('../../../assets/images/logo.png')
            }
            resizeMode={user?.avatar ? 'cover' : 'contain'}
          />
        </TouchableOpacity>
        <Text size={20}>{t('userPanel.title')}</Text>
      </View>
      {state.adsMode ? (
        <FlatList
          data={myAds?.data.ads}
          ItemSeparatorComponent={<Divider height={4} />}
          renderItem={({item}) => (
            <View>
              <TouchableOpacity
                onPress={() => navigate('singleProduct', {ads: item})}
                style={{paddingHorizontal: scaled(8)}}>
                <Image
                  style={{
                    width: '100%',
                    height: scaled(80),
                    resizeMode: 'contain',
                  }}
                  source={require('../../../assets/images/adlist.png')}
                />
                {item.approvalStatus === 'REJECTED' ? (
                  <View
                    style={[styles.statusBadge, styles.statusBadgeRejected]}>
                    <Text size={11} color="white">
                      {t('userPanel.statusRejected')}
                    </Text>
                  </View>
                ) : item.status === 'ARCHIVED' ? (
                  <View
                    style={[styles.statusBadge, styles.statusBadgeArchived]}>
                    <Text size={11} color="white">
                      {t('userPanel.statusExpired')}
                    </Text>
                  </View>
                ) : (
                  item.approvalStatus !== 'APPROVED' && (
                    <View
                      style={[styles.statusBadge, styles.statusBadgePending]}>
                      <Text size={11} color="white">
                        {t('userPanel.statusPending')}
                      </Text>
                    </View>
                  )
                )}
                <View
                  style={{
                    position: 'absolute',
                    left: scaled(10),
                    right: scaled(10),
                    top: 0,
                    bottom: 0,
                    paddingHorizontal: scaled(8),
                    paddingTop: scaled(7),
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{paddingHorizontal: scaled(8)}} size={17}>
                    {item.title}
                  </Text>
                  {item.approvalStatus === 'REJECTED' &&
                    item.rejectionReason && (
                      <Text
                        style={{paddingHorizontal: scaled(8)}}
                        size={12}
                        color={colors.pallete.red}>
                        {t('userPanel.rejectionReason', {
                          reason: item.rejectionReason,
                        })}
                      </Text>
                    )}
                  <Row style={{marginBottom: 2}}>
                    <View style={{flex: 1.1}} />
                    <Row
                      style={{
                        flex: 0.9,
                        justifyContent: 'space-between',
                        paddingHorizontal: scaled(10),
                      }}>
                      <Text size={12} color={colors.main}>
                        {item.createdAt
                          ? formatRelativeTime(item.createdAt)
                          : ''}
                      </Text>
                      <Text size={12} color={colors.main}>
                        1399/02/15
                      </Text>
                    </Row>
                  </Row>
                </View>
              </TouchableOpacity>
              <Row
                style={{paddingHorizontal: scaled(16), marginTop: scaled(4)}}>
                {item.approvalStatus === 'REJECTED' ? (
                  <Button
                    onPress={() => onDeleteAd(item)}
                    style={styles.rowActionButton}>
                    <Text size={13} color={colors.pallete.red2}>
                      {t('userPanel.deleteCompletely')}
                    </Text>
                  </Button>
                ) : (
                  <>
                    <Button
                      onPress={() =>
                        navigate('adViewStats', {advertisementId: item.id})
                      }
                      style={styles.rowActionButton}>
                      <Text size={13} color={colors.text}>
                        {t('userPanel.viewStats')}
                      </Text>
                    </Button>
                    <Divider style={{width: scaled(10)}} />
                    <Button
                      onPress={() => onEditAd(item)}
                      style={styles.rowActionButton}>
                      <Text size={13} color={colors.main}>
                        {t('common.edit')}
                      </Text>
                    </Button>
                    <Divider style={{width: scaled(10)}} />
                    <Button
                      onPress={() => onDeleteAd(item)}
                      style={styles.rowActionButton}>
                      <Text size={13} color={colors.pallete.red2}>
                        {t('common.delete')}
                      </Text>
                    </Button>
                  </>
                )}
              </Row>
              {item.approvalStatus === 'APPROVED' &&
                item.paymentStatus != null && (
                  <Row
                    style={{
                      paddingHorizontal: scaled(16),
                      marginTop: scaled(4),
                    }}>
                    <Button
                      onPress={() => onRenewAd(item)}
                      style={{
                        ...styles.rowActionButton,
                        ...styles.renewButton,
                      }}>
                      <Text size={13} color="white">
                        {item.status === 'ARCHIVED'
                          ? t('userPanel.renewAdExpired')
                          : t('userPanel.renewAd')}
                      </Text>
                    </Button>
                  </Row>
                )}
            </View>
          )}
          ListHeaderComponent={<Divider height={10} />}
          ListFooterComponent={<Divider height={120} />}
        />
      ) : (
        <FlatList
          style={{paddingHorizontal: scaled(8)}}
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
              style={{width: scaled(30), height: scaled(30)}}
              source={require('../../../assets/images/chatwhite.png')}
            />
          ) : (
            <Image
              style={{width: scaled(30), height: scaled(30)}}
              source={require('../../../assets/images/speaker.png')}
            />
          )}
        </TouchableOpacity>
        <Divider height={10} />
        <TouchableOpacity
          onPress={() => navigate('newAdvertising')}
          style={styles.circle}>
          <Entypo name="plus" color="white" size={scaled(40)} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: scaled(77),
    backgroundColor: colors.main,
  },
  rowActionButton: {
    flex: 1,
    height: scaled(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaled(6),
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
  avatarCon: {
    height: scaled(83),
    backgroundColor: colors.pallete.gray1,
    alignItems: 'center',
  },
  avatar: {
    height: scaled(94),
    width: scaled(94),
    borderRadius: scaled(50),
    marginTop: scaled(-47),
    overflow: 'hidden',
    borderWidth: 1,
  },
  absButtons: {
    position: 'absolute',
    bottom: scaled(20),
    right: scaled(20),
  },
  circle: {
    height: scaled(50),
    width: scaled(50),
    borderRadius: scaled(50),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
  statusBadge: {
    position: 'absolute',
    top: scaled(6),
    right: scaled(16),
    paddingHorizontal: scaled(8),
    paddingVertical: scaled(3),
    borderRadius: scaled(10),
  },
  statusBadgePending: {
    backgroundColor: '#E8A317',
  },
  statusBadgeRejected: {
    backgroundColor: colors.pallete.red2,
  },
  statusBadgeArchived: {
    backgroundColor: colors.pallete.gray3,
  },
  renewButton: {
    backgroundColor: colors.main,
    borderColor: colors.main,
  },
});
