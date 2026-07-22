import {Alert, FlatList, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {
  Button,
  Checkbox,
  CitySelectModal,
  CreateAdsHeader,
  Divider,
  DurationModal,
  MainHeader,
  Row,
  Screen,
  SelectLocation,
  Text,
  TextField,
  UnderlineTextField,
} from '../../../components';
import {offerCategories} from '../../../utiles/data';
import {CategroyItem} from '../../../components/custom/category-Item/category-item';
import {colors} from '../../../theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMutation} from 'react-query';
import {createStoreOffer, upload} from '../../../services';

export function CreateOfferScreen() {
  const {navigate} = useNavigation();
  const {params} = useRoute();
  const storeId = params?.storeId;
  const [state, setState] = useState({
    step: '1',
    category: '',
    title: '',
    discountPercent: '',
    originalPrice: '',
    contactInfo: '',
    description: '',
    images: ['', '', '', '', ''],
    durationModal: false,
    duration: {
      minutes: '',
      houres: '',
      days: '',
    },
    city: '',
    cityModal: false,
    acceptance: false,
  });

  const {mutate: uploadMutate} = useMutation(upload);
  const {mutate: createOfferMutate} = useMutation((data: any) =>
    createStoreOffer(storeId, data),
  );

  const handleSelectImage = (image: {uri: string}, index: number) => {
    const {fileName, type, uri} = image as any;
    const form = new FormData();
    form.append('file', {name: fileName, type, uri} as any);
    uploadMutate(form, {
      onSuccess: uploaded => {
        setState(s => {
          const images = [...s.images];
          images[index] = uploaded?.data?.id;
          return {...s, images};
        });
      },
    });
  };
  const handleToggleDurationModal = () => {
    setState(s => ({...s, durationModal: !s.durationModal}));
  };
  const handleChangeDuration = (text, label) => {
    setState(s => ({...s, duration: {...s.duration, [label]: text}}));
  };

  const durationToExpiresAt = () => {
    const {days, houres, minutes} = state.duration;
    if (!days && !houres && !minutes) {
      return undefined;
    }
    const ms =
      (Number(days) || 0) * 86400000 +
      (Number(houres) || 0) * 3600000 +
      (Number(minutes) || 0) * 60000;
    return new Date(Date.now() + ms).toISOString();
  };

  const onSendPress = () => {
    if (!storeId) {
      Alert.alert('خطا', 'ابتدا باید یک فروشگاه ثبت کنید.');
      return;
    }
    if (!state.title || state.title.length < 10) {
      Alert.alert('عنوان آگهی باید حداقل ۱۰ حرف باشد');
      return;
    }
    if (!state.city?.id) {
      Alert.alert('شهر را انتخاب کنید');
      return;
    }
    if (!state.acceptance) {
      Alert.alert('پذیرش قوانین و شرایط الزامی است');
      return;
    }

    const imageData: Record<string, string> = {};
    state.images.forEach((id, index) => {
      if (id) {
        imageData[`image_${index + 1}`] = id;
      }
    });

    createOfferMutate(
      {
        title: state.title,
        discountPercent: state.discountPercent,
        originalPrice: state.originalPrice,
        contactInfo: state.contactInfo,
        description: state.description,
        cityId: state.city.id,
        expiresAt: durationToExpiresAt(),
        ...imageData,
      },
      {
        onSuccess: () => {
          navigate('createAddsPay');
        },
        onError: () => {
          Alert.alert('خطا', 'ثبت آگهی تخفیف با خطا مواجه شد.');
        },
      },
    );
  };

  return (
    <Screen withoutScroll>
      {state.step == '1' ? (
        <>
          <MainHeader title="تخفیف یاب" />
          <FlatList
            ListHeaderComponent={<Divider height={8} />}
            ListFooterComponent={<Divider />}
            data={offerCategories}
            style={{paddingHorizontal: 8}}
            ItemSeparatorComponent={<View style={{height: 4}} />}
            renderItem={({item}) => (
              <CategroyItem
                item={item}
                onPress={() =>
                  setState(s => ({...s, category: item.title, step: '2'}))
                }
              />
            )}
          />
        </>
      ) : (
        <>
          <CreateAdsHeader
            onCreatePress={onSendPress}
            onSelectImage={handleSelectImage}
          />
          <Screen unsafe>
            <View style={styles.form}>
              <Button onPress={() => setState(s => ({...s, step: '1'}))}>
                <UnderlineTextField
                  editable={false}
                  value={state.category}
                />
              </Button>
              <Divider />
              <UnderlineTextField
                value={state.title}
                onChangeText={text => setState(s => ({...s, title: text}))}
                placeholder="عنوان آگهی (حداقل ۱۰ حرف)"
              />
              <Divider />
              <UnderlineTextField
                value={state.discountPercent}
                onChangeText={text =>
                  setState(s => ({...s, discountPercent: text}))
                }
                placeholder="درصد تخفیف"
                keyboardType="number-pad"
              />
              <Divider />
              <UnderlineTextField
                value={state.originalPrice}
                onChangeText={text =>
                  setState(s => ({...s, originalPrice: text}))
                }
                placeholder="قیمت اصلی"
                keyboardType="number-pad"
              />
              <Divider />
              <Button onPress={handleToggleDurationModal}>
                {!state.duration.minutes &&
                !state.duration.houres &&
                !state.duration.days ? (
                  <UnderlineTextField
                    editable={false}
                    placeholder="مدت زمان تخفیف"
                  />
                ) : (
                  <Row style={styles.duration}>
                    <Text>{state.duration.days || '0'} روز</Text>
                    <View style={{width: 10}} />
                    <Text>{state.duration.houres || '0'} ساعت</Text>
                    <View style={{width: 10}} />
                    <Text>{state.duration.minutes || '0'} دقیقه</Text>
                  </Row>
                )}
              </Button>
              <Divider />
              <UnderlineTextField
                value={state.contactInfo}
                onChangeText={text =>
                  setState(s => ({...s, contactInfo: text}))
                }
                placeholder="اطلاعات تماس"
              />
              <Divider />
              <Button onPress={() => setState(s => ({...s, cityModal: true}))}>
                <UnderlineTextField
                  placeholder="تعیین موقعیت"
                  value={state.city?.title}
                  editable={false}
                />
              </Button>
              <Divider />
              <UnderlineTextField
                value={state.description}
                onChangeText={text =>
                  setState(s => ({...s, description: text}))
                }
                placeholder="توضیحات"
              />
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

              <SelectLocation />
            </View>
          </Screen>
        </>
      )}

      <DurationModal
        visible={state.durationModal}
        onClose={handleToggleDurationModal}
        onChangeText={handleChangeDuration}
      />
      <CitySelectModal
        onSelect={city => setState(s => ({...s, city, cityModal: false}))}
        visible={state.cityModal}
        onClose={() => setState(s => ({...s, cityModal: false}))}
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
