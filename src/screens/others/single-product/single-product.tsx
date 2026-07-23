import {View, StyleSheet, Image, Platform} from 'react-native';
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
  ReportProblem,
  optionsTypes,
  Rate,
} from '../../../components';
import {colors} from '../../../theme';
import Entypo from 'react-native-vector-icons/Entypo';
import {numberWithCommas, translations} from '../../../utiles';
import {formatRelativeTime, getLegacyImagePaths} from '../../../utiles/utiles_funcs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useSelector} from 'react-redux';
import {
  addBookmark,
  findMainCategory,
  getAdsCategories,
  getBookmarks,
  getSingleAds,
  rateAd,
  removeBookmark,
} from '../../../services';

const images = [require('../../../assets/images/products/productSlider1.png')];
// Frosted look for the nav bar so it reads as an overlay on the hero image
// rather than an opaque bar sitting above it (the previous solid white-white
// gradient hid the top of the photo instead of blending with it).
const GLASS_HEADER_GRADIENT = [
  'rgba(255,255,255,0.55)',
  'rgba(255,255,255,0.15)',
];
const productProps = [
  {label: 'متراژ(متر مربع)', value: '120'},
  {label: 'رهن', value: 100000000, type: 'price'},
  {label: 'اجاره ماهیانه', value: 1000000, type: 'price'},
  {label: 'نوع', value: 'ارایه'},
  {label: 'آگهی دهنده', value: 'مشاور املاک'},
  {label: 'تعداد اتاق', value: '3'},
  {label: 'محل', value: 'گنبد کاووس'},
];
export function SinlgeProduct() {
  const [state, setState] = useState({
    callInfoModal: false,
    reportModal: false,
    ads: undefined,
  });
  const {params} = useRoute();
  const [ad, setAd] = useState(params?.ads);
  const currentUser = useSelector(s => s.user);
  const isOwnAd = ad?.userId && ad.userId === currentUser?.id;
  // A تخفیف‌یاب listing always carries a discount percent; the generic
  // attribute list is replaced with the boxed ویژگی‌ها/توضیحات layout for it.
  const isOffer = !!ad?.discountPercent;
  const offerFeatures: string[] = Array.isArray(ad?.features) ? ad.features : [];
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
  const {data} = useQuery(
    [`singleAd-${params?.ads?.id}`, params?.ads?.id],
    () => getSingleAds(params?.ads?.id),
  );
  const {navigate} = useNavigation();
  const insets = useSafeAreaInsets();
  const toggleCallInfoModal = () => {
    setState(s => ({...s, callInfoModal: !s.callInfoModal}));
  };
  const toggleReportModal = () => {
    setState(s => ({...s, reportModal: !s.reportModal}));
  };

  const {data: categoriesData} = useQuery(['adsCategories'], getAdsCategories);
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
            value = optionsTypes.contractType[ad[item]].title;
          } else if (item == 'degree') {
            value = optionsTypes.education[ad[item]].title;
          } else if (item == 'parking') {
            value = ad[item] ? 'دارد' : 'ندارد';
          } else if (item == 'is_cash') {
            value = ad[item] ? 'قسطی' : 'نقد';
          } else if (item == 'by_person') {
            value = ad[item] ? 'شخصی' : 'بنگاه';
          } else if (item == 'suburbs') {
            value = ad[item] ? 'بله' : 'خیر';
          } else if (item == 'elevator') {
            value = ad[item] ? 'دارد' : 'ندارد';
          } else {
            value = ad[item];
          }
          const label =
            item === 'price' && isJobListing ? 'حقوق پیشنهادی' : translations[item];
          arr.push({label, value});
        }
      });
      return arr;
    }
    return [];
  }, [ad, isJobListing]);
  useEffect(() => {
    if (data) {
      setAd(data?.data);
    }
  }, [data]);
  const images = useMemo(() => getLegacyImagePaths(ad), [ad]);
  const isBookmarked = useMemo(() => {
    return !!bookmarks?.find(item => item.id === params?.ads?.id);
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
          title={isOffer ? 'تخفیف یاب' : data?.data?.category_id?.title}
          colors={isOffer ? GLASS_HEADER_GRADIENT : undefined}
          iconColor={isOffer ? 'white' : undefined}
          onCreatePress={undefined}
        />
      </View>
      <Screen unsafe style={{paddingBottom: insets.bottom + 90}}>
        <View>
          <View>
            <ImageSlider images={images} autoPlay={false} loop={false} />
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
                onPress={() => navigate('storeProfile', {storeId: ad.store.id})}>
                <Row style={{alignItems: 'center', marginTop: 6}}>
                  <View style={styles.storeLogoDot}>
                    {ad.store.logo ? (
                      <Image
                        source={{uri: ad.store.logo}}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : (
                      <Entypo name="shop" size={12} color={colors.pallete.grayText} />
                    )}
                  </View>
                  <Text size={13} color={colors.pallete.grayText} style={{marginRight: 6}}>
                    فروشگاه {ad.store.name}
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
                    ? `این آگهی رد شده است${
                        ad.rejectionReason ? `: ${ad.rejectionReason}` : ''
                      }`
                    : 'این آگهی در انتظار تایید مدیر است و فقط برای شما نمایش داده می‌شود.'}
                </Text>
              </View>
            )}

            <Divider />
            <Row style={{justifyContent: 'space-between'}}>
              <Text color={colors.main}>
                {ad?.createdAt ? formatRelativeTime(ad.createdAt) : ''}
              </Text>
              <Text preset="bold" size={20}>
                {ad?.city?.title}
              </Text>
              <Button onPress={toggleReportModal}>
                <Row>
                  <Text>گزارش مشکل آگهی</Text>
                  <Entypo size={20} name="attachment" />
                </Row>
              </Button>
            </Row>
          </View>
          {isOffer ? (
            <>
              <OfferPriceDetails item={ad} />

              <View style={{paddingHorizontal: 16, paddingTop: 14}}>
                {(offerFeatures.length > 0 || !!ad?.installment) && (
                  <View style={styles.section}>
                    <View style={styles.sectionLabel}>
                      <Text preset="bold" size={14} color="white">
                        ویژگی‌ها
                      </Text>
                    </View>
                    <View style={styles.sectionBox}>
                      {!!ad?.installment && (
                        <Text size={15} style={styles.sectionLine}>
                          • امکان خرید اقساطی
                        </Text>
                      )}
                      {offerFeatures.map((feature: string, index: number) => (
                        <Text key={index} size={15} style={styles.sectionLine}>
                          • {feature}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {(!!ad?.description ||
                  !!ad?.usagePeriodText ||
                  !!ad?.testPeriodText) && (
                  <View style={styles.section}>
                    <View style={styles.sectionLabel}>
                      <Text preset="bold" size={14} color="white">
                        توضیحات
                      </Text>
                    </View>
                    <View style={styles.sectionBox}>
                      {!!ad?.description && (
                        <Text size={15} style={styles.sectionLine}>
                          {ad.description}
                        </Text>
                      )}
                      {!!ad?.usagePeriodText && (
                        <Text size={15} style={styles.sectionLine}>
                          {ad.usagePeriodText}
                        </Text>
                      )}
                      {!!ad?.testPeriodText && (
                        <Text size={15} style={styles.sectionLine}>
                          {ad.testPeriodText}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={{padding: 16}}>
              {adsProps.map((item, index) => {
                return (
                  <Row key={index} style={{marginVertical: 2}}>
                    <Text size={17} style={{width: 120, textAlign: 'left'}}>
                      {item.label}:
                    </Text>
                    <Divider style={{width: 40}} />
                    <Text size={17}>
                      {item.type == 'price'
                        ? `${numberWithCommas(item.value)} تومان`
                        : item.value}
                    </Text>
                  </Row>
                );
              })}
            </View>
          )}
        </View>

        <ProductLocation
          lat={ad?.lat}
          lng={ad?.lng}
          zoomEnabled={false}
          scrollEnabled={false}
        />
        <CallInfo
          phone={ad?.contact_info}
          visible={state.callInfoModal}
          onClose={toggleCallInfoModal}
        />
        <ReportProblem
          visible={state.reportModal}
          onClose={toggleReportModal}
          advertisementId={params?.ads?.id}
        />
      </Screen>
      <Row
        style={{
          ...styles.buttons,
          bottom: Platform.OS == 'ios' ? insets.bottom : 10,
        }}>
        <Button style={styles.button} onPress={toggleCallInfoModal}>
          <Row style={{alignItems: 'center'}}>
            <Image source={require('../../../assets/images/phone.png')} />
            <Divider style={{width: 5}} />
            <Text size={20} preset="bold">
              اطلاعات تماس
            </Text>
          </Row>
        </Button>
        {/* `chatEnabled` (see ContactInfoCard) defaults to true for new ads
            and is undefined on ads posted before that field existed —
            either way, chat only actually hides when the owner explicitly
            turned it off. */}
        {!isOwnAd && ad?.chatEnabled !== false && (
          <>
            <Divider style={{width: 30}} />
            <Button
              onPress={() =>
                navigate('chat', {
                  title: data?.data?.title,
                  advertisementId: data?.data?.id,
                })
              }
              style={styles.button}>
              <Row style={{alignItems: 'center'}}>
                <Image source={require('../../../assets/images/chat.png')} />
                <Divider style={{width: 5}} />
                <Text size={20} preset="bold">
                  چت
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
    top: 50,
  },
  topDetail: {
    backgroundColor: colors.pallete.gray1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
  },
  // For تخفیف‌یاب the title sits on white and the gray price bar
  // (OfferPriceDetails) flows flush beneath it, matching the design.
  topDetailOffer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 8,
  },
  ratingOverlay: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  storeLogoDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.pallete.gray1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 20,
  },
  // A tab that straddles the box's top edge: pulled down with a negative
  // margin so half its height sits over the box and half floats above it,
  // and given zIndex so it renders in front of (not hidden behind) the box.
  sectionLabel: {
    alignSelf: 'flex-end',
    zIndex: 1,
    marginBottom: -14,
    backgroundColor: colors.pallete.gray2,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sectionBox: {
    backgroundColor: colors.pallete.gray1,
    borderRadius: 8,
    padding: 12,
    paddingTop: 20,
  },
  sectionLine: {
    lineHeight: 24,
    marginBottom: 2,
  },
  statusBanner: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  statusBannerPending: {
    backgroundColor: '#E8A317',
  },
  statusBannerRejected: {
    backgroundColor: colors.pallete.red2,
  },
  button: {
    paddingHorizontal: 8,
    flex: 1,
    height: 37,
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
  buttons: {
    paddingHorizontal: 16,
    zIndex: 10001,
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
  },
});
