import {Alert, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {AdsOptionsModal} from '../modal/ads-options-modal';
import {Button} from '../button/button';
import {CitySelectModal} from '../modal/city-select-modal';
import {Divider} from '../divider/divider';
import {DurationModal} from '../modal/duration-modal';
import {LocationSelectModal} from '../modal/location-select-modal';
import {Row} from '../row/row';
import {Text} from '../text/text';
import {UnderlineTextField} from '../text-field/underline-text-field';
import {colors} from '../../theme';

// تخفیف‌یاب's own fields on top of the common ones (title/city/contact/
// description/location) every other category already collects: the price
// before/after discount and how long the discount lasts. originalPrice and
// discountPercent are sent as category-specific attributes (see ads.ts'
// createAds — anything not one of its known fields is auto-nested under
// `attributes`, same as CarForm/EstateForm's fields); `price` itself is set
// to the discounted price so this ad behaves like any other in price
// search/sort. Duration is collected as days/hours/minutes (matching the
// old create-offer-screen.tsx) and converted to an absolute `expiresAt`.
export function OfferForm({send, onSend}) {
  const [state, setState] = useState({
    title: '',
    description: '',
    contact_info: '',
    originalPrice: '',
    discountPercent: '',
    city: '',
    cityModal: false,
    locationModal: false,
    durationModal: false,
    duration: {
      minutes: '',
      houres: '',
      days: '',
    },
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  const handleToggleDurationModal = () => {
    setState(s => ({...s, durationModal: !s.durationModal}));
  };
  const handleChangeDuration = (text: string, label: string) => {
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

  useEffect(() => {
    if (send?.includes('send')) {
      const isValid = handleValidation();
      if (isValid) {
        const {
          title,
          description,
          contact_info,
          city,
          originalPrice,
          discountPercent,
          lat,
          lng,
        } = state;
        const discount = Number(discountPercent) || 0;
        const price = Math.round(
          Number(originalPrice) * (1 - discount / 100),
        );
        onSend({
          title,
          description,
          price,
          contact_info,
          city_id: city?.id,
          originalPrice: Number(originalPrice),
          discountPercent: discount,
          expiresAt: durationToExpiresAt(),
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
    const {title, city, contact_info, originalPrice, discountPercent} = state;
    if (!title) {
      isValid = false;
      Alert.alert('عنوان را وارد کنید');
    } else if (!originalPrice) {
      isValid = false;
      Alert.alert('قیمت قبل از تخفیف را وارد کنید');
    } else if (!discountPercent) {
      isValid = false;
      Alert.alert('درصد تخفیف را وارد کنید');
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
          placeholder="عنوان تخفیف (حداقل ۱۰ حرف)"
        />
        <Divider />
        <UnderlineTextField
          value={state.originalPrice}
          onChangeText={text => setState(s => ({...s, originalPrice: text}))}
          keyboardType="number-pad"
          placeholder="قیمت قبل از تخفیف"
        />
        <Divider />
        <UnderlineTextField
          value={state.discountPercent}
          onChangeText={text => setState(s => ({...s, discountPercent: text}))}
          keyboardType="number-pad"
          placeholder="درصد تخفیف"
        />
        <Divider />
        <Button onPress={handleToggleDurationModal}>
          {!state.duration.minutes &&
          !state.duration.houres &&
          !state.duration.days ? (
            <UnderlineTextField
              editable={false}
              placeholder="مدت زمان تخفیف (اختیاری)"
            />
          ) : (
            <Row style={{paddingVertical: 8}}>
              <Text>{state.duration.days || '0'} روز</Text>
              <Divider style={{width: 10}} />
              <Text>{state.duration.houres || '0'} ساعت</Text>
              <Divider style={{width: 10}} />
              <Text>{state.duration.minutes || '0'} دقیقه</Text>
            </Row>
          )}
        </Button>
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
      <DurationModal
        visible={state.durationModal}
        onClose={handleToggleDurationModal}
        onChangeText={handleChangeDuration}
      />
    </>
  );
}
