import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  AdsOptionsModal,
  Button,
  CarForm,
  Checkbox,
  CitySelectModal,
  CommonForm,
  CreateAdsHeader,
  Divider,
  DurationModal,
  EstateForm,
  MainHeader,
  Row,
  Screen,
  TextField,
  UnderlineTextField,
} from '../../components';
import {boldFont, colors, normalFont} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {SelectAdsCategory} from '../../components';
import {useMutation} from 'react-query';
import {createAds, upload} from '../../services';

export function CreateAdsScreen() {
  const {navigate} = useNavigation();
  const [state, setState] = useState({
    step: '1',
    mainCategory: '',
    subCategory: '',
    subsubCategory: '',
    images: ['', '', '', '', ''],
    education: '',
    contractType: '',
    adsType: '',
    adsCreator: '',
    floor: '',
    elevator: '',
    parking: '',
    suburb: '',
    price: '',
    duration: {
      minutes: '',
      houres: '',
      days: '',
    },
    city: '',
    cityModal: false,
    acceptance: false,
    selectCategoryModal: false,
    durationModal: false,
    optionType: '',
    optionModal: false,
    send: 'no',
    uploadingCount: 0,
  });

  const {mutate} = useMutation(upload);
  const {mutate: createAdsMutate} = useMutation(createAds);
  const handleSelectImage = (
    image: {fileName: any; type: any; uri: any},
    index: string | number,
  ) => {
    const {fileName, type, uri} = image;
    const doc = {name: fileName, type, uri};
    const form = new FormData();
    form.append('file', doc);
    setState(s => ({...s, uploadingCount: s.uploadingCount + 1}));
    mutate(form, {
      onSuccess: data => {
        const images = state.images;
        images[index] = data?.data;
        setState(s => ({...s, images, uploadingCount: s.uploadingCount - 1}));
      },
      onError: () => {
        Alert.alert('خطا در آپلود تصویر', 'لطفا دوباره تلاش کنید');
        setState(s => ({...s, uploadingCount: s.uploadingCount - 1}));
      },
    });
  };

  const onSendPress = () => {
    if (state.uploadingCount > 0) {
      Alert.alert('لطفا صبر کنید', 'تصاویر در حال آپلود هستند');
      return;
    }
    setState(s => ({...s, send: `send-${new Date()}`}));
  };
  const onToggleSelectCategory = () => {
    setState(s => ({
      ...s,
      selectCategoryModal: !s.selectCategoryModal,
      send: 'no',
    }));
  };

  const hanldeCreateAd = (data: any) => {
    if (data) {
      const {images, mainCategory}: any = state;
      if (!mainCategory) {
        return Alert.alert('دسته بندی را انتخاب کنید');
      }
      let imageData: any = {};
      images.forEach((item: {id: any}, index: number) => {
        if (item) {
          imageData[`image_${index + 1}`] = item.id;
        }
      });
      const payload = {
        category_id: (state.subsubCategory || state.subCategory || mainCategory)
          ?.id,
        ...imageData,
        ...data,
      };
      createAdsMutate(payload, {
        onSuccess: () => {
          navigate('createAdsFinal' as never);
        },
      });
    }
  };

  const groupTitle = useMemo(() => {
    let title = '';
    if (state.mainCategory) {
      title = state?.mainCategory?.title;
    }
    if (state.subCategory) {
      title = title + ':' + state?.subCategory?.title;
    }
    if (state.subsubCategory) {
      title = title + ':' + state?.subsubCategory?.title;
    }
    return title;
  }, [state.mainCategory, state.subCategory, state.subsubCategory]);
  return (
    <Screen withoutScroll>
      <CreateAdsHeader
        onBack={() => navigate('home' as never)}
        onCreatePress={onSendPress}
        onSelectImage={handleSelectImage}
      />
      <Screen unsafe>
        <View style={styles.form}>
          <TouchableOpacity
            onPress={onToggleSelectCategory}
            style={{
              paddingVertical: 4,
              alignSelf: 'center',
              borderBottomColor: colors.main,
              borderBottomWidth: 1,
              flex: 1,
              width: Dimensions.get('window').width * 0.87,
            }}>
            <Text
              style={{
                textAlign: 'right',
                paddingBottom: 6,
                fontFamily: boldFont,
                fontSize: 16,
              }}>
              {state.mainCategory ? groupTitle : 'انتخاب گروه'}
            </Text>
          </TouchableOpacity>
          <Divider />

          {/* Matched by the top-level category's Persian name, which is what
              the backend seed data actually sets (see mahem-backend's
              prisma/seed.ts) — the previous slug check ('vehicles' /
              'real-estate') never matched real seeded slugs ('املاک',
              'وسایل-نقلیه'), so these specialized forms silently never
              rendered and every ad fell back to CommonForm. */}
          {state?.mainCategory?.title === 'وسایل نقلیه' ? (
            <CarForm
              send={state.send}
              onSend={hanldeCreateAd}
              subCategory={state.subCategory}
            />
          ) : state?.mainCategory?.title === 'املاک' ? (
            <EstateForm
              send={state.send}
              onSend={hanldeCreateAd}
              subCategory={state.subCategory}
              subsubCategory={state.subsubCategory}
            />
          ) : (
            <CommonForm
              send={state.send}
              onSend={hanldeCreateAd}
              mainCategory={state.mainCategory}
            />
          )}

          <Divider />
          <View>
            <Checkbox
              value={state.acceptance}
              onToggle={() =>
                setState(s => ({...s, acceptance: !s.acceptance}))
              }
              style={{flexDirection: 'row', alignSelf: 'center'}}
              text="با قوانین و شرایط موافقم"
            />
          </View>
        </View>
      </Screen>

      <SelectAdsCategory
        onSelect={(m: any, sc: any, ssc: any) =>
          setState(s => ({
            ...s,
            mainCategory: m,
            subCategory: sc,
            subsubCategory: ssc,
          }))
        }
        onClose={onToggleSelectCategory}
        visible={state.selectCategoryModal}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.main,
  },
  form: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  duration: {
    borderBottomWidth: 1,
    borderColor: colors.pallete.red2,
    marginHorizontal: 10,
    height: 30,
    paddingHorizontal: 5,
  },
});
