import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import React, {useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useQueryClient, useMutation} from 'react-query';
import {
  Button,
  GradiantHeader,
  GridOfferCard,
  ListState,
  MainHeader,
  Row,
  Screen,
  Text,
} from '../../../components';
import {getMyAds, getMyStore, renewStore} from '../../../services';
import {colors} from '../../../theme';
import {useAdsCategories} from '../../../hooks/use-cached-categories';

const {width} = Dimensions.get('window');

// Mirrors STORE_FEE_TOMAN in store-terms-screen.tsx — Store has no fee
// amount stored in the backend (see Store model), so this is purely a
// client-side display figure for the payment gateway screen.
const STORE_FEE_TOMAN = 300000;

// A readable dark scrim works over any background (plain gray placeholder
// or an actual cover photo) — the lighter glass gradient only reads over a
// sufficiently dark/colorful photo, and a fresh store has no cover yet.
const READABLE_HEADER_GRADIENT = ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.45)'];

// Store owner dashboard (store_v4.png design): cover/logo/name, "ثبت تخفیف"
// (post a new discount under this store) and "تمدید فروشگاه" (renew the
// monthly subscription — a manual bank-transfer flow, see renewStore), then
// a grid of the store's own discount ads (including its own pending/
// rejected ones, unlike the public store profile).
export function MyStoreScreen() {
  const {t} = useTranslation();
  const {navigate, goBack} = useNavigation<any>();
  const queryClient = useQueryClient();

  const {data: store, isLoading} = useQuery(['myStore'], getMyStore);
  const {data: cats} = useAdsCategories();
  const discountCategory = useMemo(
    () => cats?.data?.find((c: any) => c.title === 'تخفیف یاب'),
    [cats],
  );

  const {
    data: offersData,
    isLoading: offersLoading,
    isError: offersError,
  } = useQuery(
    ['myStoreOffers', store?.id],
    () => getMyAds({storeId: store!.id}),
    {enabled: !!store?.id},
  );
  const offers = offersData?.data?.ads ?? [];

  const {mutate: renew, isLoading: renewing} = useMutation(
    () => renewStore(store!.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['myStore']);
        Alert.alert(t('store.renewRequested'), t('store.renewRequestedBody'));
      },
      onError: () => Alert.alert(t('common.error'), t('store.renewError')),
    },
  );

  // Same test-payment-gateway detour as store creation (StoreTermsScreen) —
  // the actual renewal (subscriptionExpiresAt push-out) only happens once
  // an admin confirms the payment in mahem-admin (see renew()'s doc comment
  // above).
  const onRenewPress = () => {
    navigate('bankGateway', {
      amount: STORE_FEE_TOMAN,
      description: t('store.renewDescription', {name: store?.name ?? ''}),
      onSuccess: async () => {
        goBack();
        renew();
      },
    });
  };

  // MyStoreScreen lives in the root AppStack (a sibling of the "dashboard"
  // screen), while createAdsDetails is nested two levels deep: AppStack ->
  // "dashboard" (Dashboard tab navigator) -> "newAdvertising" tab
  // (CreateAdsStack) -> "createAdsDetails" screen. A flat
  // navigate('createAdsDetails', ...) only works from within CreateAdsStack
  // itself, so this has to spell out the full nested path (see
  // https://reactnavigation.org/docs/nesting-navigators#navigating-to-a-screen-in-a-nested-navigator).
  // presetMainCategory skips the category/subcategory picker screens
  // entirely (see CreateAdsDetailsScreen) and drops straight into OfferForm
  // pinned to this store.
  const onCreateOffer = () => {
    navigate('dashboard', {
      screen: 'newAdvertising',
      params: {
        screen: 'createAdsDetails',
        params: {
          presetMainCategory: discountCategory,
          storeId: store?.id,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <Screen withoutScroll>
        <ListState isLoading />
      </Screen>
    );
  }

  if (!store) {
    return (
      <Screen withoutScroll>
        <View style={styles.header}>
          <Row style={styles.headerRow}>
            <Button onPress={goBack}>
              <Row style={{alignItems: 'center'}}>
                <MaterialIcons
                  color="white"
                  size={25}
                  name="keyboard-arrow-right"
                />
                <Text color="white" size={17}>
                  {t('home.discountFinder')}
                </Text>
              </Row>
            </Button>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </Row>
        </View>
        <View style={styles.emptyState}>
          <Ionicons
            name="storefront-outline"
            size={64}
            color={colors.pallete.gray3}
          />
          <Text style={{marginTop: 12, textAlign: 'center'}}>
            {t('store.noStoreYet')}
          </Text>
          <Button
            style={styles.createStoreButton}
            onPress={() => navigate('createStore')}>
            <Text color="white" size={15}>
              {t('store.createStore')}
            </Text>
          </Button>
        </View>
      </Screen>
    );
  }

  const subscriptionLabel = () => {
    if (store.paymentStatus === 'PENDING') {
      return t('store.pendingPayment');
    }
    if (store.subscriptionExpiresAt) {
      const expired = new Date(store.subscriptionExpiresAt) < new Date();
      const date = new Date(store.subscriptionExpiresAt).toLocaleDateString(
        'fa-IR',
      );
      return expired
        ? t('store.subscriptionExpired', {date})
        : t('store.subscriptionActiveUntil', {date});
    }
    return '';
  };

  return (
    <Screen withoutScroll>
      <MainHeader title={t('home.discountFinder')} showLocation />
      <View style={{flex: 1}}>
        <View style={styles.overlayNav}>
          <GradiantHeader
            title=""
            details={false}
            onCreatePress={undefined}
            onBookMark={undefined}
            colors={READABLE_HEADER_GRADIENT}
            iconColor="white"
          />
        </View>
        <FlatList
          data={offers}
          numColumns={2}
          keyExtractor={(item: any) => item.id}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 12,
          }}
          ItemSeparatorComponent={() => <View style={{height: 12}} />}
          ListHeaderComponent={
            <View>
              <View style={styles.coverBox}>
                {store.banner ? (
                  <Image
                    source={{uri: store.banner}}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
              </View>
              <View style={styles.nameStrip}>
                <View style={styles.logoBox}>
                  {store.logo ? (
                    <Image
                      source={{uri: store.logo}}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : (
                    <Ionicons
                      name="storefront-outline"
                      size={22}
                      color={colors.pallete.gray3}
                    />
                  )}
                </View>
                <Text
                  preset="bold"
                  size={17}
                  color={colors.main}
                  style={styles.storeName}>
                  {store.name}
                </Text>
              </View>
              {store.approvalStatus === 'PENDING' && (
                <Text style={styles.noticeBanner}>
                  {t('store.pendingApproval')}
                </Text>
              )}
              {store.approvalStatus === 'REJECTED' && (
                <Text
                  style={[styles.noticeBanner, {color: colors.pallete.red2}]}>
                  {t('store.storeRejected', {reason: store.rejectionReason})}
                </Text>
              )}
              {store.status === 'ARCHIVED' && (
                <Text
                  style={[styles.noticeBanner, {color: colors.pallete.red2}]}>
                  {t('store.archivedNotice')}
                </Text>
              )}
              {!!subscriptionLabel() && (
                <Text style={styles.subscriptionLabel}>
                  {subscriptionLabel()}
                </Text>
              )}

              <Row style={styles.actionsRow}>
                <Button
                  style={styles.actionCard}
                  onPress={onRenewPress}
                  loading={renewing}>
                  <MaterialCommunityIcons
                    name="handshake-outline"
                    size={44}
                    color={colors.main}
                  />
                  <Text color={colors.main} size={14} style={{marginTop: 6}}>
                    {t('store.renewStore')}
                  </Text>
                </Button>
                <Button style={styles.actionCard} onPress={onCreateOffer}>
                  <Ionicons name="add" size={52} color={colors.main} />
                  <Text color={colors.main} size={14} style={{marginTop: 6}}>
                    {t('store.postDiscount')}
                  </Text>
                </Button>
              </Row>
            </View>
          }
          renderItem={({item}) => (
            <View style={{width: width / 2 - 18}}>
              <GridOfferCard
                item={item}
                onPress={() => navigate('singleProduct', {ads: item})}
              />
            </View>
          )}
          ListEmptyComponent={
            <ListState
              isLoading={offersLoading}
              isError={offersError}
              emptyMessage={t('store.noDiscountsYet')}
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.main,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  overlayNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  createStoreButton: {
    marginTop: 16,
    backgroundColor: colors.main,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  coverBox: {
    width: '100%',
    aspectRatio: 360 / 156,
    backgroundColor: colors.pallete.gray1,
  },
  nameStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pallete.gray1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  logoBox: {
    width: 69,
    height: 69,
    marginTop: -46,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storeName: {
    marginRight: 12,
  },
  noticeBanner: {
    textAlign: 'center',
    color: colors.pallete.grayText,
    marginTop: 4,
  },
  subscriptionLabel: {
    textAlign: 'center',
    color: colors.pallete.grayText,
    marginTop: 4,
    marginBottom: 4,
  },
  actionsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  actionCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.pallete.gray3,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
