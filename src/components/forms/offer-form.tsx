import {Alert, View} from 'react-native';
import {AdFormProps} from './form.props';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '../button/button';
import {ContactInfoCard} from './contact-info-card';
import {Divider} from '../divider/divider';
import {DurationModal} from '../modal/duration-modal';
import {LocationSelectModal} from '../modal/location-select-modal';
import {Row} from '../row/row';
import {Text} from '../text/text';
import {UnderlineTextField} from '../text-field/underline-text-field';
import {scaled} from '../../theme';

// "ثبت آگهی- تخفیف یاب" (Figma node 106:8559) — the field list and their
// order come straight from that frame: عنوان / درصد تخفیف / قیمت اصلی /
// مدت زمان تخفیف / اطلاعات تماس / تعیین موقعیت / ویژگی ها / توضیحات. The
// category line above them is drawn by CreateAdsDetailsScreen, not here.
//
// originalPrice, discountPercent and features are sent as category-specific
// attributes (see ads.ts' createAds — anything not one of its known fields
// is auto-nested under `attributes`, same as CarForm/EstateForm's fields);
// `price` itself is set to the discounted price so this ad behaves like any
// other in price search/sort. Duration is collected as days/hours/minutes
// and converted to an absolute `expiresAt`.
//
// expiresAt is stored as an absolute timestamp, not a duration — reverse it
// back into days/houres/minutes so re-saving without touching the duration
// fields resends (approximately) the same expiry instead of silently
// clearing it (attributes is replaced wholesale on update, not merged).
// Already-expired/unset discounts start blank rather than negative.
function remainingDuration(expiresAt?: string | null) {
  const blank = {minutes: '', houres: '', days: ''};
  if (!expiresAt) {
    return blank;
  }
  const remainingMinutes = Math.floor(
    (new Date(expiresAt).getTime() - Date.now()) / 60000,
  );
  if (remainingMinutes <= 0) {
    return blank;
  }
  const days = Math.floor(remainingMinutes / (24 * 60));
  const houres = Math.floor((remainingMinutes % (24 * 60)) / 60);
  const minutes = remainingMinutes % 60;
  return {
    days: days > 0 ? String(days) : '',
    houres: houres > 0 ? String(houres) : '',
    minutes: minutes > 0 ? String(minutes) : '',
  };
}

// ویژگی‌ها is a single free-text line like CarForm/EstateForm's, but ads
// created before that change stored it as a list — flatten those so editing
// an old discount doesn't blank the field out.
function featuresToText(features: unknown) {
  if (Array.isArray(features)) {
    return features.join('، ');
  }
  return typeof features === 'string' ? features : '';
}

export function OfferForm({editItem, send, onSend, storeId}: AdFormProps) {
  const {t} = useTranslation();
  const [state, setState] = useState(() =>
    editItem
      ? {
          title: editItem.title ?? '',
          description: editItem.description ?? '',
          contact_info: editItem.contact_info ?? '',
          email: editItem.email ?? '',
          chatEnabled: !!editItem.chatEnabled,
          hideEmail: !!editItem.hideEmail,
          originalPrice:
            editItem.originalPrice != null
              ? String(editItem.originalPrice)
              : '',
          discountPercent:
            editItem.discountPercent != null
              ? String(editItem.discountPercent)
              : '',
          features: featuresToText(editItem.features),
          locationModal: false,
          durationModal: false,
          duration: remainingDuration(editItem.expiresAt),
          lat: editItem.lat ?? undefined,
          lng: editItem.lng ?? undefined,
        }
      : {
          title: '',
          description: '',
          contact_info: '',
          email: '',
          chatEnabled: true,
          hideEmail: false,
          originalPrice: '',
          discountPercent: '',
          features: '',
          locationModal: false,
          durationModal: false,
          duration: {
            minutes: '',
            houres: '',
            days: '',
          },
          lat: undefined as number | undefined,
          lng: undefined as number | undefined,
        },
  );

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
          email,
          chatEnabled,
          hideEmail,
          originalPrice,
          discountPercent,
          features,
          lat,
          lng,
        } = state;
        const discount = Number(discountPercent) || 0;
        const price = Math.round(Number(originalPrice) * (1 - discount / 100));
        onSend?.({
          title,
          description,
          price,
          contact_info,
          email,
          chatEnabled,
          hideEmail,
          originalPrice: Number(originalPrice),
          discountPercent: discount,
          features,
          expiresAt: durationToExpiresAt(),
          lat,
          lng,
          ...(storeId ? {store_id: storeId} : {}),
        });
      } else {
        onSend?.(false);
      }
    }
  }, [send]);

  const handleValidation = () => {
    let isValid = true;
    const {title, description, contact_info, originalPrice, discountPercent} =
      state;
    if (!title) {
      isValid = false;
      Alert.alert(t('forms.validation.enterTitle'));
    } else if (!discountPercent) {
      isValid = false;
      Alert.alert(t('forms.validation.enterDiscountPercent'));
    } else if (!originalPrice) {
      isValid = false;
      Alert.alert(t('forms.validation.enterOriginalPrice'));
    } else if (!contact_info) {
      isValid = false;
      Alert.alert(t('forms.validation.enterContactInfo'));
      // Backend rejects anything shorter (CreateAdvertisementDto:
      // @Length(10, 5000) on description) — catching it here instead of
      // letting the request 400 after the whole form's been filled in.
    } else if (description.trim().length < 10) {
      isValid = false;
      Alert.alert(t('forms.validation.descriptionMinLength'));
    }
    return isValid;
  };

  return (
    <>
      <View>
        <UnderlineTextField
          value={state.title}
          onChangeText={text => setState(s => ({...s, title: text}))}
          placeholder={t('forms.adTitlePlaceholder')}
        />
        <Divider />
        <UnderlineTextField
          value={state.discountPercent}
          onChangeText={text => setState(s => ({...s, discountPercent: text}))}
          keyboardType="number-pad"
          placeholder={t('forms.discountPercent')}
        />
        <Divider />
        <UnderlineTextField
          value={state.originalPrice}
          onChangeText={text => setState(s => ({...s, originalPrice: text}))}
          keyboardType="number-pad"
          thousandSeparator
          placeholder={t('forms.originalPrice')}
        />
        <Divider />
        <Button onPress={handleToggleDurationModal}>
          {!state.duration.minutes &&
          !state.duration.houres &&
          !state.duration.days ? (
            <UnderlineTextField
              editable={false}
              placeholder={t('forms.discountDurationOptional')}
            />
          ) : (
            <Row style={{paddingVertical: scaled(8)}}>
              <Text>
                {state.duration.days || '0'} {t('common.day')}
              </Text>
              <Divider style={{width: scaled(10)}} />
              <Text>
                {state.duration.houres || '0'} {t('common.hour')}
              </Text>
              <Divider style={{width: scaled(10)}} />
              <Text>
                {state.duration.minutes || '0'} {t('common.minute')}
              </Text>
            </Row>
          )}
        </Button>
        <Divider />
        <ContactInfoCard
          value={{
            contact_info: state.contact_info,
            email: state.email,
            chatEnabled: state.chatEnabled,
            hideEmail: state.hideEmail,
          }}
          onChange={contact => setState(s => ({...s, ...contact}))}
        />
        <Divider />
        <Button onPress={() => setState(s => ({...s, locationModal: true}))}>
          <UnderlineTextField
            placeholder={t('forms.setLocationOptional')}
            value={state.lat && state.lng ? t('forms.locationSelected') : ''}
            editable={false}
          />
        </Button>
        <Divider />
        <UnderlineTextField
          value={state.features}
          onChangeText={text => setState(s => ({...s, features: text}))}
          placeholder={t('forms.features')}
        />
        <Divider />
        <UnderlineTextField
          value={state.description}
          onChangeText={text => setState(s => ({...s, description: text}))}
          placeholder={t('common.description')}
        />
      </View>
      <LocationSelectModal
        visible={state.locationModal}
        onClose={() => setState(s => ({...s, locationModal: false}))}
        onSelect={(lat, lng) => setState(s => ({...s, lat, lng}))}
      />
      <DurationModal
        visible={state.durationModal}
        onClose={handleToggleDurationModal}
        onChangeText={handleChangeDuration}
        value={state.duration}
      />
    </>
  );
}
