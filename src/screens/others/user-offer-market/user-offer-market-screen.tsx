import {
  Alert,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React from 'react';
import {
  Button,
  GradiantHeader,
  ListState,
  MainHeader,
  Screen,
  Row,
  Divider,
  Text,
} from '../../../components';
import {colors} from '../../../theme';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useMutation, useQueryClient} from 'react-query';
import {deleteStore} from '../../../services';
import {getStoreOffers} from '../../../services/store-offers';
import {usePaginatedList} from '../../../hooks/use-paginated-list';
const {width} = Dimensions.get('window');

export function UserOfferMarketScreen() {
  const {navigate, goBack} = useNavigation();
  const {params} = useRoute();
  const user = useSelector(s => s.user);
  const store = params?.store;
  const isOwner = store?.userId && store.userId === user?.id;
  const queryClient = useQueryClient();
  const {mutate: deleteStoreMutate} = useMutation(() => deleteStore(store.id), {
    onSuccess: () => {
      queryClient.invalidateQueries('myStore');
      goBack();
    },
  });
  const onDeleteStore = () => {
    Alert.alert('حذف فروشگاه', 'آیا از حذف این فروشگاه مطمئن هستید؟', [
      {text: 'انصراف', style: 'cancel'},
      {text: 'حذف', style: 'destructive', onPress: () => deleteStoreMutate()},
    ]);
  };

  const {
    items: offers,
    isLoading,
    isError,
  } = usePaginatedList({
    queryKey: ['storeOffers', store?.id],
    queryFn: ({pageParam = 1}) =>
      getStoreOffers(store?.id, {page: pageParam, limit: 20}),
    selectItems: page => page?.data?.offers,
    enabled: !!store?.id,
  });

  return (
    <Screen
      style={{backgroundColor: 'transparent'}}
      withoutScroll
      statusbarBackgroundColor={colors.main}>
      <MainHeader />
      <View style={styles.nav}>
        <GradiantHeader title="تخفیف یاب" details={false} />
      </View>
      <Screen unsafe>
        <View style={styles.bannerContaier}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={{uri: params?.store?.image?.path}}
          />
        </View>
        <View style={styles.grayCard}>
          <View style={styles.avatar}>
            <Image
              style={{height: '100%', width: '100%'}}
              source={{uri: params?.store?.logo?.path}}
            />
          </View>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text size={17} preset="bold" color={colors.main}>
              {params?.store?.title}
            </Text>
          </View>
        </View>
        {isOwner && (
          <>
            <Row style={{paddingHorizontal: 10, marginTop: 8}}>
              <Button
                onPress={() => navigate('createOfferMarket', {editItem: store})}
                style={styles.ownerActionButton}>
                <Text size={13} color={colors.main}>
                  ویرایش فروشگاه
                </Text>
              </Button>
              <Divider style={{width: 10}} />
              <Button onPress={onDeleteStore} style={styles.ownerActionButton}>
                <Text size={13} color={colors.pallete.red2}>
                  حذف فروشگاه
                </Text>
              </Button>
            </Row>
            <Divider />
            <Row style={{paddingHorizontal: 10}}>
              <TouchableOpacity style={{...styles.grid, marginLeft: 4}}>
                <View style={styles.icon}>
                  <Image
                    source={require('../../../assets/images/tamdid.png')}
                  />
                </View>
                <Text size={17} color={colors.main}>
                  تمدید فروشگاه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigate('createOffer', {storeId: store?.id})}
                style={{...styles.grid, marginRight: 4}}>
                <View style={styles.icon}>
                  <Entypo name="plus" size={100} color={colors.main} />
                </View>
                <Text size={17} color={colors.main}>
                  ثبت تخفیف
                </Text>
              </TouchableOpacity>
            </Row>
          </>
        )}
        <Divider height={8} />
        <FlatList
          data={offers}
          scrollEnabled={false}
          ItemSeparatorComponent={<Divider height={8} />}
          ListEmptyComponent={
            <ListState
              isLoading={isLoading}
              isError={isError}
              emptyMessage="هنوز آگهی تخفیفی ثبت نکرده‌اید"
            />
          }
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => navigate('singleOffer', {offer: item})}
              style={{paddingHorizontal: 16}}>
              <Text size={16}>{item.title}</Text>
              {!!item.discountPercent && (
                <Text size={13} color={colors.main}>
                  ٪{item.discountPercent} تخفیف
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
        <Divider />
      </Screen>
    </Screen>
  );
}
const styles = StyleSheet.create({
  bannerContaier: {
    width: '100%',
    height: width / 1.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.pallete.gray3,
  },
  ownerActionButton: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.main,
  },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: 50,
  },
  grayCard: {
    height: 55,
    backgroundColor: colors.pallete.gray1,
    flexDirection: 'row',
  },
  avatar: {
    height: 94,
    width: 94,
    borderRadius: 16,
    marginTop: -47,
    borderWidth: 1,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray4,
  },
  grid: {
    width: (width - 28) / 2,
    aspectRatio: 0.9,
    borderWidth: 1,
    borderColor: colors.main,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '50%',
    aspectRatio: 1,
  },
});
