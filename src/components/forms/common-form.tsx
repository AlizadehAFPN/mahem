import {Alert, FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {AdsOptionsModal} from '../modal/ads-options-modal';
import {Button} from '../button/button';
import {Checkbox} from '../checkbox/checkbox';
import {CitySelectModal} from '../modal/city-select-modal';
import {CreateAdsHeader} from '../headers/create-ads-header';
import {Divider} from '../divider/divider';
import {DurationModal} from '../modal/duration-modal';
import {MainHeader} from '../headers/mainHeader';
import {LocationSelectModal} from '../modal/location-select-modal';
import {Row} from '../row/row';
import {Screen} from '../screen/screen';
import {Text} from '../text/text';
import {TextField} from '../text-field/text-field';
import {UnderlineTextField} from '../text-field/underline-text-field';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {SelectAdsCategory} from '../modal/select-ads-category';

// `editItem` is the mapped ad returned from getSingleAds/getAds (see
// mapAdvertisement) — its category-specific fields are already flattened
// from `attributes` onto the object directly, under the same wire names
// this form's onSend sends them as (ad_type, not the local `adsType`).
export function CommonForm({mainCategory, editItem, send, onSend}) {
  const {navigate} = useNavigation();
  const [state, setState] = useState(() =>
    editItem
      ? {
          title: editItem.title ?? '',
          description: editItem.description ?? '',
          contact_info: editItem.contact_info ?? '',
          city: editItem.city ?? '',
          adsType: editItem.ad_type ?? '',
          price: editItem.price != null ? String(editItem.price) : '',
          cityModal: false,
          acceptance: true,
          selectCategoryModal: false,
          durationModal: false,
          optionType: '',
          optionModal: false,
          locationModal: false,
          lat: editItem.lat ?? undefined,
          lng: editItem.lng ?? undefined,
        }
      : {
          title: '',
          description: '',
          contact_info: '',
          city: '',
          adsType: '',
          price: '',
          cityModal: false,
          acceptance: false,
          selectCategoryModal: false,
          durationModal: false,
          optionType: '',
          optionModal: false,
          locationModal: false,
          lat: undefined as number | undefined,
          lng: undefined as number | undefined,
        },
  );

  useEffect(() => {
    if (send?.includes('send')) {
      const isValid = handleValidation();
      if (isValid) {
        const {
          title,
          description,
          price,
          adsType,
          contact_info,
          city,
          lat,
          lng,
        } = state;

        onSend({
          title,
          description,
          price,
          contact_info,
          city_id: city?.id,
          ad_type: adsType,
          lat,
          lng,
        });
      } else {
        onSend(false);
      }
    }
  }, [send]);
  const handleValidation = () => {
    let isValid = true;
    const {title, city, contact_info, price} = state;
    if (!title) {
      isValid = false;
      Alert.alert('عنوان را وارد کنید');
    } else if (!price) {
      isValid = false;
      Alert.alert('قیمت را وارد کنید');
    } else if (!city) {
      isValid = false;
      Alert.alert('شهر را وارد کنید');
    } else if (!contact_info) {
      isValid = false;
      Alert.alert('اطلاعات تماس را وارد کنید');
    }
    return isValid;
  };

  return (
    <>
      <View>
        <UnderlineTextField
          value={state.title}
          onChangeText={text => setState(s => ({...s, title: text}))}
          placeholder="عنوان آگهی (حداقل ۱۰ حرف)"
        />
        <Divider />
        <Button
          onPress={() =>
            setState(s => ({...s, optionModal: true, optionType: 'adsType'}))
          }>
          <UnderlineTextField
            editable={false}
            placeholder="نوع آگهی"
            value={state.adsType}
          />
        </Button>
        {mainCategory && (
          <>
            <Divider />
            <UnderlineTextField
              value={state.price}
              onChangeText={text => setState(s => ({...s, price: text}))}
              placeholder="قیمت"
            />
            <Divider />
            <UnderlineTextField
              value={state.contact_info}
              onChangeText={text => setState(s => ({...s, contact_info: text}))}
              placeholder="اطلاعات تماس"
              keyboardType="number-pad"
            />
          </>
        )}
        <Divider />
        <Button onPress={() => setState(s => ({...s, cityModal: true}))}>
          <UnderlineTextField
            placeholder="شهر"
            value={state?.city?.title}
            editable={false}
          />
        </Button>

        <Divider />
        <Button onPress={() => setState(s => ({...s, locationModal: true}))}>
          <UnderlineTextField
            placeholder="موقعیت روی نقشه (اختیاری)"
            value={state.lat && state.lng ? 'موقعیت انتخاب شد' : ''}
            editable={false}
          />
        </Button>

        <Divider />
        <UnderlineTextField
          value={state.description}
          onChangeText={text => setState(s => ({...s, description: text}))}
          placeholder="توضیحات"
        />
      </View>
      <CitySelectModal
        onSelect={city => setState(s => ({...s, city, cityModal: false}))}
        visible={state.cityModal}
        onClose={() => setState(s => ({...s, cityModal: false}))}
      />
      <LocationSelectModal
        visible={state.locationModal}
        onClose={() => setState(s => ({...s, locationModal: false}))}
        onSelect={(lat, lng) => setState(s => ({...s, lat, lng}))}
      />
      <AdsOptionsModal
        type={state.optionType}
        visible={state.optionModal}
        onSelect={item => setState(s => ({...s, [s.optionType]: item}))}
        onClose={() => setState(s => ({...s, optionModal: false}))}
      />
    </>
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
