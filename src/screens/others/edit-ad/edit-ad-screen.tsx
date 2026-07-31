import {Alert, StyleSheet, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  CarForm,
  CommonForm,
  CreateAdsHeader,
  EstateForm,
  OfferForm,
  Screen,
} from '../../../components';
import {scaled} from '../../../theme';
import {useTranslation} from 'react-i18next';
import {useMutation, useQueryClient} from 'react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import {findMainCategory, updateAds, upload} from '../../../services';
import {useAdsCategories} from '../../../hooks/use-cached-categories';
import {
  isSupportedImageType,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
} from '../../../utiles/utiles_funcs';

// Reuses the exact same category-specific forms CreateAdsScreen uses (see
// each form's `editItem` support) so every field collected at creation is
// also editable here — the previous version of this screen only exposed
// title/price/contact/description and had no image management at all.
export function EditAdScreen() {
  const {t} = useTranslation();
  const {goBack} = useNavigation<any>();
  const {params} = useRoute<any>();
  const ad = params?.ad;
  const queryClient = useQueryClient();

  const {data: categoriesData} = useAdsCategories();
  const mainCategory = useMemo(
    () => findMainCategory(categoriesData?.data ?? [], ad?.category_id?.id),
    [categoriesData, ad?.category_id?.id],
  );

  const [state, setState] = useState(() => ({
    images: [1, 2, 3, 4, 5].map(n => ad?.[`image${n}`]?.path ?? ''),
    isSubmitting: false,
    uploadingIndexes: [] as number[],
    send: 'no',
  }));

  const {mutate: updateAdsMutate} = useMutation(
    (data: any) => updateAds(ad.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myAds');
        // Home screen's general/تخفیف‌یاب rows and the search screen all key
        // their ads queries off ['ads', ...] and stay mounted across
        // navigation, so without this they'd keep showing this ad's
        // pre-edit data (including stale/missing images) until a manual
        // pull-to-refresh or app restart.
        queryClient.invalidateQueries(['ads']);
        queryClient.invalidateQueries([`singleAd-${ad?.id}`, ad?.id]);
        // Editing title/description/price/images/category/city resets the ad
        // to PENDING on the backend for re-review (see advertisements.service
        // .ts CONTENT_FIELDS) without touching paymentStatus — an already
        // fee-paid ad stays paid, no repeat payment needed.
        Alert.alert(t('jobs.editedTitle'), t('editAd.editedBody'), [
          {text: t('common.ok'), onPress: goBack},
        ]);
      },
      onError: () => {
        setState(s => ({...s, isSubmitting: false}));
        Alert.alert(t('common.error'), t('editAd.saveError'));
      },
    },
  );

  const handleSelectImage = (image: any, index: number) => {
    if (!isSupportedImageType(image.type)) {
      Alert.alert(
        t('common.imageFormatUnsupported'),
        UNSUPPORTED_IMAGE_TYPE_MESSAGE(),
      );
      return;
    }
    setState(s => {
      const images = [...s.images];
      images[index] = image;
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
    setState(s => ({...s, send: `send-${new Date()}`}));
  };

  // Existing (already-uploaded) images are plain strings and are resent
  // as-is; only freshly-picked local files (objects with a `uri`) get
  // uploaded here. A slot cleared via the remove button is simply absent
  // from state.images by then, so it's dropped from the final array —
  // that's how an image actually gets removed from the ad.
  const handleSave = async (data: any) => {
    if (!data) {
      return;
    }
    setState(s => ({...s, isSubmitting: true}));

    const finalImages: string[] = [];
    try {
      for (let index = 0; index < state.images.length; index++) {
        const image = state.images[index];
        if (!image) {
          continue;
        }
        if (typeof image === 'string') {
          finalImages.push(image);
          continue;
        }
        setState(s => ({
          ...s,
          uploadingIndexes: [...s.uploadingIndexes, index],
        }));
        const form = new FormData();
        form.append('file', {
          name: image.fileName,
          type: image.type,
          uri: image.uri,
        } as any);
        const uploaded = await upload(form);
        finalImages.push(uploaded?.data?.id);
        setState(s => ({
          ...s,
          uploadingIndexes: s.uploadingIndexes.filter(i => i !== index),
        }));
      }
    } catch (e) {
      setState(s => ({...s, isSubmitting: false, uploadingIndexes: []}));
      Alert.alert(t('editAd.imageUploadError'), t('editAd.pleaseTryAgain'));
      return;
    }

    updateAdsMutate({
      ...data,
      category_id: ad?.category_id?.id,
      images: finalImages,
    });
  };

  return (
    <Screen withoutScroll>
      <CreateAdsHeader
        title={t('editAd.title')}
        onCreatePress={onSendPress}
        onSelectImage={handleSelectImage}
        onRemoveImage={handleRemoveImage}
        isSending={state.isSubmitting}
        uploadingIndexes={state.uploadingIndexes}
        initialImages={state.images.map((img: any) =>
          typeof img === 'string' ? img : img?.uri,
        )}
      />
      <Screen unsafe>
        <View style={styles.form}>
          {mainCategory?.title === 'وسایل نقلیه' ? (
            <CarForm
              send={state.send}
              onSend={handleSave}
              subCategory={ad?.category_id}
              editItem={ad}
            />
          ) : mainCategory?.title === 'املاک' ? (
            <EstateForm
              send={state.send}
              onSend={handleSave}
              subCategory={ad?.category_id}
              subsubCategory={ad?.category_id}
              editItem={ad}
            />
          ) : mainCategory?.title === 'تخفیف یاب' ? (
            <OfferForm send={state.send} onSend={handleSave} editItem={ad} />
          ) : (
            <CommonForm
              send={state.send}
              onSend={handleSave}
              mainCategory={mainCategory}
              editItem={ad}
            />
          )}
        </View>
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: scaled(12),
    paddingVertical: scaled(10),
  },
});
