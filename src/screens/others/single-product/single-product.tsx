import {View, StyleSheet, Image} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  GradiantHeader,
  ImageSlider,
  MainHeader,
  OfferPriceDetails,
  Screen,
  Row,
  Button,
  Divider,
  Text,
  ProductLocation,
  CallInfo,
  ImageViewerModal,
  ReportProblem,
  optionsTypes,
  Rate,
} from '../../../components';
import {colors, scaled} from '../../../theme';
import Entypo from 'react-native-vector-icons/Entypo';
import {useTranslation} from 'react-i18next';
import {numberWithCommas, translations} from '../../../utiles';
import {
  localizeCategory,
  localizeCity,
  localizeOption,
} from '../../../i18n/display-maps';
import {
  formatRelativeTime,
  getLegacyImagePaths,
} from '../../../utiles/utiles_funcs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useSelector} from 'react-redux';
import {
  addBookmark,
  findMainCategory,
  getBookmarks,
  getSingleAds,
  rateAd,
  removeBookmark,
} from '../../../services';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {useMissingEntityGuard} from '../../../hooks/use-missing-entity-guard';
import {buildAdLink} from '../../../navigation/deep-links';

// Frosted look for the nav bar so it reads as an overlay on the hero image
// rather than an opaque bar sitting above it (the previous solid white-white
// gradient hid the top of the photo instead of blending with it).
const GLASS_HEADER_GRADIENT = [
  'rgba(255,255,255,0.55)',
  'rgba(255,255,255,0.15)',
];
export function SinlgeProduct() {
  const {t} = useTranslation();
  const [state, setState] = useState({
    callInfoModal: false,
    reportModal: false,
    ads: undefined,
  });
  // The photo currently open full-screen, if any — same pattern (and same
  // viewer) as the chat thread's image messages.
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const {params} = useRoute<any>();
  const [ad, setAd] = useState(params?.ads);
  const currentUser = useSelector(s => s.user);
  const isOwnAd = ad?.userId && ad.userId === currentUser?.id;
  // Whether this ad offers chat at all. Absent means yes: the toggle is on by
  // default when posting (see ContactInfoCard) and ads created before it
  // existed carry nothing, so only an explicit `false` — the owner having
  // turned it off — takes chat away.
  const chatEnabled = ad?.chatEnabled !== false;
  // A تخفیف‌یاب listing always carries a discount percent; the generic
  // attribute list is replaced with the boxed ویژگی‌ها/توضیحات layout for it.
  const isOffer = !!ad?.discountPercent;
  // ویژگی‌ها is a single line now (see OfferForm), but discounts posted
  // before that change stored a list — render both shapes.
  const offerFeatures: string[] = Array.isArray(ad?.features)
    ? ad.features
    : ad?.features
    ? [String(ad.features)]
    : [];
  const queryClient = useQueryClient();
  const {data: bookmarksData} = useQuery(['bookmarks'], getBookmarks);
  const bookmarks = bookmarksData?.data;
  const {mutate: addBookmarkMutate} = useMutation(addBookmark, {
    onSuccess: () => queryClient.invalidateQueries(['bookmarks']),
  });
  const {mutate: removeBookmarkMutate} = useMutation(removeBookmark, {
    onSuccess: () => queryClient.invalidateQueries(['bookmarks']),
  });
  const {mutate: rateMutate} = useMutation(
    (value: number) => rateAd(ad.id, value),
    {onSuccess: res => setAd((prev: any) => ({...prev, ...res.data}))},
  );
  const missingAdGuard = useMissingEntityGuard('product.adDeleted');
  const {data} = useQuery(
    [`singleAd-${params?.ads?.id}`, params?.ads?.id],
    () => getSingleAds(params?.ads?.id),
    missingAdGuard,
  );
  const {navigate} = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const toggleCallInfoModal = () => {
    setState(s => ({...s, callInfoModal: !s.callInfoModal}));
  };
  const toggleReportModal = () => {
    setState(s => ({...s, reportModal: !s.reportModal}));
  };

  const {data: categoriesData} = useAdsCategories();
  // استخدامی ads use `price` for a proposed salary rather than a sale price
  // (see CommonForm) — ads are only ever tagged with leaf categories, so
  // this walks up the tree to find which top-level branch the ad's category
  // actually belongs to.
  const isJobListing = useMemo(
    () =>
      findMainCategory(categoriesData?.data ?? [], ad?.category_id?.id)
        ?.title === 'استخدامی',
    [categoriesData, ad?.category_id?.id],
  );

  const adsProps = useMemo(() => {
    if (ad) {
      const arr = [];
      Object.keys(ad).forEach(item => {
        if (ad[item] !== null && !!translations[item]) {
          let value;
          if (item == 'contract_type') {
            value = localizeOption(optionsTypes.contractType[ad[item]].title);
          } else if (item == 'degree') {
            value = localizeOption(optionsTypes.education[ad[item]].title);
          } else if (item == 'parking') {
            value = ad[item] ? t('product.has') : t('product.hasNot');
          } else if (item == 'is_cash') {
            value = ad[item] ? t('product.installment') : t('product.cash');
          } else if (item == 'by_person') {
            value = ad[item] ? t('product.personal') : t('product.agency');
          } else if (item == 'suburbs') {
            value = ad[item] ? t('common.yes') : t('common.no');
          } else if (item == 'elevator') {
            value = ad[item] ? t('product.has') : t('product.hasNot');
          } else {
            value = ad[item];
          }
          const label =
            item === 'price' && isJobListing
              ? t('product.proposedSalaryLabel')
              : t(`fields.${item}`);
          arr.push({label, value});
        }
      });
      return arr;
    }
    return [];
  }, [ad, isJobListing, t]);
  useEffect(() => {
    if (data) {
      setAd(data?.data);
    }
  }, [data]);
  const images = useMemo(() => getLegacyImagePaths(ad), [ad]);
  const isBookmarked = useMemo(() => {
    return !!bookmarks?.find((item: any) => item.id === params?.ads?.id);
  }, [bookmarks]);

  const onBookMark = () => {
    if (isBookmarked) {
      removeBookmarkMutate(params?.ads?.id);
    } else {
      addBookmarkMutate(params?.ads?.id);
    }
  };

  return (
    <Screen
      style={{backgroundColor: 'transparent'}}
      withoutScroll
      statusbarBackgroundColor={colors.main}>
      <MainHeader />
      <View style={styles.nav}>
        <GradiantHeader
          isBookmarked={isBookmarked}
          onBookMark={onBookMark}
          title={
            isOffer
              ? t('home.discountFinder')
              : localizeCategory(data?.data?.category_id?.title)
          }
          // Without these the share fell through to GradiantHeader's `title`
          // fallback and sent the *category name* — "املاک" — with no link.
          shareText={ad?.title}
          shareLink={ad?.id ? buildAdLink(ad.id) : undefined}
          colors={isOffer ? GLASS_HEADER_GRADIENT : undefined}
          iconColor={isOffer ? 'white' : undefined}
          onCreatePress={undefined}
        />
      </View>
      <Screen unsafe style={{paddingBottom: insets.bottom + 90}}>
        <View>
          <View>
            <ImageSlider
              images={images}
              autoPlay={false}
              loop={false}
              onPressImage={(uri: string) => setViewerUri(uri)}
            />
            {isOffer && (
              <View style={styles.ratingOverlay}>
                <Rate
                  rate={ad?.myRating ?? 0}
                  size={20}
                  emptyColor="white"
                  onRate={value => rateMutate(value)}
                />
              </View>
            )}
          </View>
          <View style={[styles.topDetail, isOffer && styles.topDetailOffer]}>
            <Text preset="bold" size={20}>
              {ad?.title}
            </Text>
            {isOffer && !!ad?.store && (
              <Button
                onPress={() =>
                  navigate('storeProfile', {storeId: ad.store.id})
                }>
                <Row style={{alignItems: 'center', marginTop: scaled(6)}}>
                  <View style={styles.storeLogoDot}>
                    {ad.store.logo ? (
                      <Image
                        source={{uri: ad.store.logo}}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : (
                      <Entypo
                        name="shop"
                        size={scaled(12)}
                        color={colors.pallete.grayText}
                      />
                    )}
                  </View>
                  <Text
                    size={13}
                    color={colors.pallete.grayText}
                    style={{marginRight: scaled(6)}}>
                    {t('product.storeLabel', {name: ad.store.name})}
                  </Text>
                </Row>
              </Button>
            )}
            {ad?.approvalStatus && ad.approvalStatus !== 'APPROVED' && (
              <View
                style={[
                  styles.statusBanner,
                  ad.approvalStatus === 'REJECTED'
                    ? styles.statusBannerRejected
                    : styles.statusBannerPending,
                ]}>
                <Text size={13} color="white">
                  {ad.approvalStatus === 'REJECTED'
                    ? ad.rejectionReason
                      ? t('product.adRejectedWithReason', {
                          reason: ad.rejectionReason,
                        })
                      : t('product.adRejected')
                    : t('product.adPending')}
                </Text>
              </View>
            )}

            <Divider />
            <Row style={{justifyContent: 'space-between'}}>
              <Text color={colors.main}>
                {ad?.createdAt ? formatRelativeTime(ad.createdAt) : ''}
              </Text>
              <Text preset="bold" size={20}>
                {localizeCity(ad?.city?.title)}
              </Text>
              <Button onPress={toggleReportModal}>
                <Row>
                  <Text>{t('product.reportProblem')}</Text>
                  <Entypo size={scaled(20)} name="attachment" />
                </Row>
              </Button>
            </Row>
          </View>
          {isOffer ? (
            <>
              <OfferPriceDetails item={ad} />

              <View
                style={{paddingHorizontal: scaled(16), paddingTop: scaled(14)}}>
                {offerFeatures.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionLabel}>
                      <Text preset="bold" size={14} color="white">
                        {t('product.features')}
                      </Text>
                    </View>
                    <View style={styles.sectionBox}>
                      {offerFeatures.map((feature: string, index: number) => (
                        <Text key={index} size={15} style={styles.sectionLine}>
                          • {feature}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {!!ad?.description && (
                  <View style={styles.section}>
                    <View style={styles.sectionLabel}>
                      <Text preset="bold" size={14} color="white">
                        {t('common.description')}
                      </Text>
                    </View>
                    <View style={styles.sectionBox}>
                      <Text size={15} style={styles.sectionLine}>
                        {ad.description}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View
              style={{paddingHorizontal: scaled(16), paddingTop: scaled(16)}}>
              {adsProps.map((item, index) => {
                return (
                  <Row
                    key={index}
                    style={{marginVertical: 2, alignItems: 'flex-start'}}>
                    <Text
                      size={17}
                      style={{width: scaled(120), textAlign: 'right'}}>
                      {item.label}:
                    </Text>
                    <Divider style={{width: scaled(40)}} />
                    <Text size={17} style={{flex: 1, textAlign: 'right'}}>
                      {item.type == 'price'
                        ? `${numberWithCommas(item.value)} ${t('common.toman')}`
                        : item.value}
                    </Text>
                  </Row>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.mapSection}>
          <ProductLocation
            lat={ad?.lat}
            lng={ad?.lng}
            zoomEnabled={false}
            scrollEnabled={false}
          />
        </View>
        <CallInfo
          phone={ad?.contact_info}
          email={ad?.email}
          hideEmail={ad?.hideEmail}
          visible={state.callInfoModal}
          onClose={toggleCallInfoModal}
        />
        <ReportProblem
          visible={state.reportModal}
          onClose={toggleReportModal}
          advertisementId={params?.ads?.id}
        />
        <ImageViewerModal
          visible={!!viewerUri}
          uri={viewerUri}
          onClose={() => setViewerUri(null)}
        />
      </Screen>
      <Row
        style={{
          ...styles.buttons,
        }}>
        <Button style={styles.button} onPress={toggleCallInfoModal}>
          <Row style={{alignItems: 'center'}}>
            <Image
              source={require('../../../assets/images/phone.png')}
              style={{width: scaled(31), height: scaled(31)}}
            />
            <Divider style={{width: scaled(5)}} />
            <Text size={20} preset="bold">
              {t('callInfo.title')}
            </Text>
          </Row>
        </Button>
        {/* `chatEnabled` (see ContactInfoCard) defaults to true for new ads
            and is undefined on ads posted before that field existed — either
            way, the button only disappears when the owner explicitly turned
            chat off, and the backend refuses to open a thread on such an ad
            too (ChatService.getOrCreateConversation), so turning the toggle
            off really does remove the capability rather than just hide a
            button.

            On your own ad the button stays put — its absence was the one
            thing that made an ad with chat *on* look like an ad with chat
            off — but it leads to the conversations this ad has received
            instead of a thread with yourself, which the backend has never
            allowed. */}
        {chatEnabled && (
          <>
            <Divider style={{width: scaled(30)}} />
            <Button
              onPress={() =>
                isOwnAd
                  ? navigate('userpanel', {mode: 'chats'})
                  : navigate('chat', {
                      title: data?.data?.title,
                      advertisementId: data?.data?.id,
                      avatar: data?.data?.user?.avatar,
                    })
              }
              style={styles.button}>
              <Row style={{alignItems: 'center'}}>
                <Image
                  source={require('../../../assets/images/chat.png')}
                  style={{width: scaled(27), height: scaled(27)}}
                />
                <Divider style={{width: scaled(5)}} />
                <Text size={20} preset="bold">
                  {isOwnAd ? t('product.adChats') : t('product.chat')}
                </Text>
              </Row>
            </Button>
          </>
        )}
      </Row>
    </Screen>
  );
}
const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    top: scaled(50),
  },
  topDetail: {
    backgroundColor: colors.pallete.gray1,
    borderBottomLeftRadius: scaled(16),
    borderBottomRightRadius: scaled(16),
    padding: scaled(16),
  },
  // For تخفیف‌یاب the title sits on white and the gray price bar
  // (OfferPriceDetails) flows flush beneath it, matching the design.
  topDetailOffer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: scaled(8),
  },
  ratingOverlay: {
    position: 'absolute',
    left: scaled(8),
    bottom: scaled(8),
    flexDirection: 'row',
    paddingHorizontal: scaled(8),
    paddingVertical: scaled(4),
    borderRadius: scaled(12),
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  storeLogoDot: {
    width: scaled(20),
    height: scaled(20),
    borderRadius: scaled(10),
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: scaled(20),
  },
  // The map is full-bleed and has no spacing of its own (ProductLocation is
  // shared with the job screens), so the gap that separates it from whatever
  // content precedes it lives here — same 20 rhythm as between the sections.
  mapSection: {
    marginTop: scaled(20),
  },
  // A tab that straddles the box's top edge: pulled down with a negative
  // margin so half its height sits over the box and half floats above it,
  // and given zIndex so it renders in front of (not hidden behind) the box.
  sectionLabel: {
    alignSelf: 'flex-end',
    zIndex: 1,
    marginBottom: scaled(-14),
    backgroundColor: colors.pallete.gray2,
    borderRadius: scaled(8),
    paddingHorizontal: scaled(14),
    paddingVertical: scaled(6),
  },
  sectionBox: {
    backgroundColor: colors.pallete.gray1,
    borderRadius: scaled(8),
    padding: scaled(12),
    paddingTop: scaled(20),
  },
  sectionLine: {
    lineHeight: scaled(24),
    marginBottom: 2,
  },
  statusBanner: {
    marginTop: scaled(8),
    padding: scaled(8),
    borderRadius: scaled(8),
  },
  statusBannerPending: {
    backgroundColor: '#E8A317',
  },
  statusBannerRejected: {
    backgroundColor: colors.pallete.red2,
  },
  button: {
    paddingHorizontal: scaled(8),
    flex: 1,
    height: scaled(37),
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaled(8),
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
  buttons: {
    paddingHorizontal: scaled(16),
    zIndex: 10001,
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: scaled(10),
  },
});
