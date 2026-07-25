import {Alert, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Button,
  CarForm,
  Checkbox,
  CommonForm,
  CreateAdsHeader,
  Divider,
  EstateForm,
  OfferForm,
  Screen,
  SelectAdsCategory,
  Text,
  UnderlineTextField,
} from '../../components';
import {boldFont, colors} from '../../theme';
import {createAdsWithImages} from '../../services';
import {
  isSupportedImageType,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
} from '../../utiles/utiles_funcs';

// "ثبت آگهی – <دسته>" full-form frames in Figma: reached from
// CreateAdsSubcategoryScreen (route param `path`, the accumulated
// main/sub/subsub category chain) or, for the تخفیف‌یاب "ثبت تخفیف"
// shortcut from MyStoreScreen, `presetMainCategory`/`storeId` directly —
// same shortcut create-ads-screen.tsx used to support, preserved here.
// Keeps CreateAdsHeader (image grid + "ثبت رایگان آگهی"/"ارسال", already
// pixel-matches Figma) and the existing Car/Estate/Offer/Common form
// components — this screen just supplies the full-page chrome + submit
// wiring Figma shows around them.
export function CreateAdsDetailsScreen() {
  const {t} = useTranslation();
  const {navigate, goBack} = useNavigation<any>();
  const {params} = useRoute<any>();
  const path: any[] = params?.path ?? [];
  const presetMainCategory = params?.presetMainCategory;
  const storeId = params?.storeId;

  const [mainCategory, setMainCategory] = useState<any>(
    presetMainCategory ?? path[0] ?? '',
  );
  const isJobListing = mainCategory?.title === 'استخدامی';
  const [subCategory, setSubCategory] = useState<any>(path[1] ?? '');
  const [subsubCategory, setSubsubCategory] = useState<any>(path[2] ?? '');

  const [state, setState] = useState({
    images: ['', '', '', '', ''] as any[],
    acceptance: false,
    selectCategoryModal: false,
    send: 'no',
    isSubmitting: false,
    uploadingIndexes: [] as number[],
  });

  const handleSelectImage = (
    image: {fileName: any; type: any; uri: any},
    index: number,
  ) => {
    if (!isSupportedImageType(image.type)) {
      Alert.alert(
        t('common.imageFormatUnsupported'),
        UNSUPPORTED_IMAGE_TYPE_MESSAGE(),
      );
      return;
    }
    setState(s => {
      const images = [...s.images];
      images[index] = image as any;
      return {...s, images};
    });
  };
  const handleRemoveImage = (index: number) => {
    setState(s => {
      const images = [...s.images];
      images[index] = '';
      return {...s, images};
    });
  };

  const onSendPress = () => {
    if (!state.acceptance) {
      Alert.alert(t('createAds.mustAcceptTerms'));
      return;
    }
    setState(s => ({...s, send: `send-${Date.now()}`}));
  };
  const onToggleSelectCategory = () => {
    setState(s => ({
      ...s,
      selectCategoryModal: !s.selectCategoryModal,
      send: 'no',
    }));
  };

  const handleFormResult = async (data: any) => {
    if (!data) {
      return;
    }
    if (!mainCategory) {
      Alert.alert(t('createAds.selectCategory'));
      return;
    }
    const categoryId = (subsubCategory || subCategory || mainCategory)?.id;
    const payload = {category_id: categoryId, ...data};

    // Fee-required categories (استخدامی/تخفیف‌یاب — see
    // Category.adFeeToman, seeded on the root category and carried through
    // untouched by buildCategoryTree) show the fee before anything is
    // created, mirroring StoreTermsScreen: hand off to the payment step
    // instead of submitting here.
    if (mainCategory?.adFeeToman > 0) {
      navigate('createAdsPayment', {
        images: state.images,
        payload,
        mainCategory,
      });
      return;
    }

    setState(s => ({...s, isSubmitting: true}));
    try {
      await createAdsWithImages(state.images, payload, uploadingIndexes =>
        setState(s => ({...s, uploadingIndexes})),
      );
      navigate('createAdsFinal');
    } catch (e) {
      setState(s => ({...s, isSubmitting: false, uploadingIndexes: []}));
      Alert.alert(t('common.error'), t('createAds.submitError'));
    }
  };

  const groupTitle = useMemo(() => {
    let title = '';
    if (mainCategory) {
      title = mainCategory.title;
    }
    if (subCategory) {
      title = title + ':' + subCategory.title;
    }
    if (subsubCategory) {
      title = title + ':' + subsubCategory.title;
    }
    return title;
  }, [mainCategory, subCategory, subsubCategory]);

  return (
    <Screen withoutScroll>
      <CreateAdsHeader
        onBack={
          presetMainCategory ? () => goBack() : () => navigate('home')
        }
        onCreatePress={onSendPress}
        onSelectImage={handleSelectImage}
        onRemoveImage={handleRemoveImage}
        isSending={state.isSubmitting}
        uploadingIndexes={state.uploadingIndexes}
      />
      <ScrollView
        style={{flex: 1, backgroundColor: 'white'}}
        keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {isJobListing ? (
            <Button
              disabled={!!presetMainCategory}
              onPress={onToggleSelectCategory}>
              <UnderlineTextField
                editable={false}
                placeholder={t('createAds.category')}
                value={mainCategory ? groupTitle : ''}
              />
            </Button>
          ) : (
            <TouchableOpacity
              disabled={!!presetMainCategory}
              onPress={onToggleSelectCategory}
              style={styles.groupField}>
              <Text style={styles.groupText}>
                {mainCategory ? groupTitle : t('createAds.selectGroup')}
              </Text>
            </TouchableOpacity>
          )}
          <Divider />

          {mainCategory?.title === 'وسایل نقلیه' ? (
            <CarForm
              send={state.send}
              onSend={handleFormResult}
              subCategory={subCategory}
              editItem={undefined}
            />
          ) : mainCategory?.title === 'املاک' ? (
            <EstateForm
              send={state.send}
              onSend={handleFormResult}
              subCategory={subCategory}
              subsubCategory={subsubCategory}
              editItem={undefined}
            />
          ) : mainCategory?.title === 'تخفیف یاب' ? (
            <OfferForm
              send={state.send}
              onSend={handleFormResult}
              editItem={undefined}
              storeId={storeId}
            />
          ) : (
            <CommonForm
              send={state.send}
              onSend={handleFormResult}
              mainCategory={mainCategory}
              editItem={undefined}
            />
          )}

          <Divider />
          <View>
            <Checkbox
              value={state.acceptance}
              onToggle={() =>
                setState(s => ({...s, acceptance: !s.acceptance}))
              }
              onTextPress={() => navigate('privacy')}
              style={{flexDirection: 'row', alignSelf: 'center'}}
              text={t('createAds.acceptTerms')}
            />
          </View>
        </View>
      </ScrollView>

      <SelectAdsCategory
        onSelect={(m: any, sc: any, ssc: any) => {
          setMainCategory(m);
          setSubCategory(sc);
          setSubsubCategory(ssc);
        }}
        onClose={onToggleSelectCategory}
        visible={state.selectCategoryModal}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  groupField: {
    paddingVertical: 4,
    alignSelf: 'center',
    borderBottomColor: colors.main,
    borderBottomWidth: 1,
    flex: 1,
    width: '87%',
  },
  groupText: {
    textAlign: 'right',
    paddingBottom: 6,
    fontFamily: boldFont,
    fontSize: 16,
  },
});
