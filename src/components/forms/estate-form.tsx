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

// Booleans (parking/elevator/suburbs/by_person) are stored as plain
// booleans on the ad but presented as one of two Persian labels here — this
// reverses that mapping for prefill. Returns '' (unset) rather than
// guessing when the ad genuinely has no value yet.
function boolToLabel(
  value: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string,
) {
  if (value === true) return trueLabel;
  if (value === false) return falseLabel;
  return '';
}

export function EstateForm({subCategory, subsubCategory, editItem, send, onSend}) {
  const {navigate} = useNavigation();
  const [state, setState] = useState(() =>
    editItem
      ? {
          title: editItem.title ?? '',
          contact_info: editItem.contact_info ?? '',
          area: editItem.area != null ? String(editItem.area) : '',
          adsType: editItem.ad_type ?? '',
          adsCreator: boolToLabel(editItem.by_person, 'شخصی', 'املاک'),
          description: editItem.description ?? '',
          floor: editItem.floor ?? '',
          elevator: boolToLabel(editItem.elevator, 'دارد', 'ندارد'),
          parking: boolToLabel(editItem.parking, 'دارد', 'ندارد'),
          suburb: boolToLabel(editItem.suburbs, 'هست', 'نیست'),
          price: editItem.price != null ? String(editItem.price) : '',
          features: editItem.features ?? '',
          city: editItem.city ?? '',
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
          contact_info: '',
          area: '',
          adsType: '',
          adsCreator: '',
          description: '',
          floor: '',
          elevator: '',
          parking: '',
          suburb: '',
          price: '',
          features: '',
          city: '',
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
          suburb,
          parking,
          floor,
          elevator,
          description,
          price,
          adsType,
          contact_info,
          city,
          adsCreator,
          area,
          features,
          lat,
          lng,
        } = state;
        // `floor`/`ad_type` are stored as the plain label (not an index into
        // the admin-managed option list) so adding/reordering/removing
        // options never invalidates already-created ads; parking/elevator/
        // suburb are genuinely binary, so they're stored as booleans.
        const suburbs = suburb == 'هست';
        const tempParking = parking == 'دارد';
        const tempEelevator = elevator == 'دارد';
        const by_person = adsCreator == 'شخصی';
        onSend({
          title,
          suburbs,
          parking: tempParking,
          floor,
          elevator: tempEelevator,
          by_person,
          description,
          price,
          contact_info,
          city_id: city?.id,
          ad_type: adsType,
          area,
          features,
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
    const {title, city, contact_info} = state;
    if (!title) {
      isValid = false;
      Alert.alert('عنوان را وارد کنید');
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

        {!subCategory?.title?.includes('عقد مشارکت') && (
          <>
            <Divider />
            <UnderlineTextField
              value={state.area}
              onChangeText={text => setState(s => ({...s, area: text}))}
              keyboardType="number-pad"
              placeholder="متراژ (متر مربع)"
            />
            <Divider />
            {/* <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'price' }))}> */}
            <UnderlineTextField
              value={state.price}
              onChangeText={text => setState(s => ({...s, price: text}))}
              keyboardType="number-pad"
              placeholder="قیمت"
              // editable={false}
            />
            {/* </Button> */}
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({
                  ...s,
                  optionModal: true,
                  optionType: 'adsType',
                }))
              }>
              <UnderlineTextField
                editable={false}
                placeholder="نوع آگهی"
                value={state.adsType}
              />
            </Button>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({
                  ...s,
                  optionModal: true,
                  optionType: 'adsCreator',
                }))
              }>
              <UnderlineTextField
                editable={false}
                placeholder="نوع آگهی دهنده"
                value={state.adsCreator}
              />
            </Button>
          </>
        )}

        <Divider />
        <UnderlineTextField
          value={state.features}
          onChangeText={text => setState(s => ({...s, features: text}))}
          placeholder="ویژگی ها"
        />

        <Divider />
        <UnderlineTextField
          value={state.contact_info}
          onChangeText={text => setState(s => ({...s, contact_info: text}))}
          placeholder="اطلاعات تماس"
          keyboardType="number-pad"
        />
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
        {!subCategory?.title?.includes('عقد مشارکت') && (
          <>
            {!subsubCategory?.title?.includes('زمین') && (
              <>
                <Divider />
                <Button
                  onPress={() =>
                    setState(s => ({
                      ...s,
                      optionModal: true,
                      optionType: 'floor',
                    }))
                  }>
                  <UnderlineTextField
                    editable={false}
                    placeholder="طبقه"
                    value={state.floor}
                  />
                </Button>
                <Divider />
                <Button
                  onPress={() =>
                    setState(s => ({
                      ...s,
                      optionModal: true,
                      optionType: 'elevator',
                    }))
                  }>
                  <UnderlineTextField
                    editable={false}
                    placeholder="آسانسور"
                    value={state.elevator}
                  />
                </Button>
                <Divider />
                <Button
                  onPress={() =>
                    setState(s => ({
                      ...s,
                      optionModal: true,
                      optionType: 'parking',
                    }))
                  }>
                  <UnderlineTextField
                    editable={false}
                    placeholder="پارکینگ"
                    value={state.parking}
                  />
                </Button>
              </>
            )}
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({...s, optionModal: true, optionType: 'suburb'}))
              }>
              <UnderlineTextField
                editable={false}
                placeholder="حومه شهر"
                value={state.suburb}
              />
            </Button>
          </>
        )}
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
