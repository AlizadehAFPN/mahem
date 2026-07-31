import {Alert, View} from 'react-native';
import {AdFormProps} from './form.props';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {localizeOption} from '../../i18n/display-maps';
import {AdsOptionsModal} from '../modal/ads-options-modal';
import {Button} from '../button/button';
import {Checkbox} from '../checkbox/checkbox';
import {ContactInfoCard} from './contact-info-card';
import {Divider} from '../divider/divider';
import {LocationSelectModal} from '../modal/location-select-modal';
import {UnderlineTextField} from '../text-field/underline-text-field';

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

export function EstateForm({
  subCategory,
  subsubCategory,
  editItem,
  send,
  onSend,
}: AdFormProps) {
  const {t} = useTranslation();
  const [state, setState] = useState(() =>
    editItem
      ? {
          title: editItem.title ?? '',
          contact_info: editItem.contact_info ?? '',
          email: editItem.email ?? '',
          chatEnabled: !!editItem.chatEnabled,
          hideEmail: !!editItem.hideEmail,
          area: editItem.area != null ? String(editItem.area) : '',
          rooms: editItem.rooms ?? '',
          product_year:
            editItem.product_year != null ? String(editItem.product_year) : '',
          adsType: editItem.ad_type ?? '',
          adsCreator: boolToLabel(editItem.by_person, 'شخصی', 'مشاور املاک'),
          description: editItem.description ?? '',
          floor: editItem.floor ?? '',
          elevator: boolToLabel(editItem.elevator, 'دارد', 'ندارد'),
          parking: boolToLabel(editItem.parking, 'دارد', 'ندارد'),
          suburb: boolToLabel(editItem.suburbs, 'هست', 'نیست'),
          price: editItem.price != null ? String(editItem.price) : '',
          rehn: editItem.rehn != null ? String(editItem.rehn) : '',
          ejare: editItem.ejare != null ? String(editItem.ejare) : '',
          convertible: !!editItem.convertible,
          documentType: editItem.documentType ?? '',
          features: editItem.features ?? '',
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
          email: '',
          chatEnabled: true,
          hideEmail: false,
          area: '',
          rooms: '',
          product_year: '',
          adsType: '',
          adsCreator: '',
          description: '',
          floor: '',
          elevator: '',
          parking: '',
          suburb: '',
          price: '',
          rehn: '',
          ejare: '',
          convertible: false,
          documentType: '',
          features: '',
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
          rehn,
          ejare,
          convertible,
          documentType,
          rooms,
          product_year,
          adsType,
          contact_info,
          email,
          chatEnabled,
          hideEmail,
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
        onSend?.({
          title,
          suburbs,
          parking: tempParking,
          floor,
          elevator: tempEelevator,
          by_person,
          description,
          // رهن و اجاره listings collect rehn/ejare instead of a single
          // price (see the رهن و اجاره conditional in the render below);
          // both ride into `attributes` since neither is a known top-level
          // field (see ads.ts's createAds). Sent as numbers (not the raw
          // string state) so the backend's range filters (minArea/maxArea,
          // minRehn/maxRehn, etc. — plain Prisma JSON gte/lte on the stored
          // value) compare numerically instead of lexicographically.
          price,
          rehn: rehn !== '' ? Number(rehn) : undefined,
          ejare: ejare !== '' ? Number(ejare) : undefined,
          convertible,
          documentType,
          rooms,
          product_year: product_year !== '' ? Number(product_year) : undefined,
          contact_info,
          email,
          chatEnabled,
          hideEmail,
          ad_type: adsType,
          area: area !== '' ? Number(area) : undefined,
          features,
          lat,
          lng,
        });
      } else {
        onSend?.(false);
      }
    }
  }, [send]);
  const handleValidation = () => {
    let isValid = true;
    const {title, contact_info} = state;
    if (!title) {
      isValid = false;
      Alert.alert(t('forms.validation.enterTitle'));
    } else if (!contact_info) {
      isValid = false;
      Alert.alert(t('forms.validation.enterContactInfo'));
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

        {!subCategory?.title?.includes('عقد مشارکت') && (
          <>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({...s, optionModal: true, optionType: 'rooms'}))
              }>
              <UnderlineTextField
                editable={false}
                placeholder={t('forms.roomsCount')}
                value={localizeOption(state.rooms)}
              />
            </Button>
            <Divider />
            <UnderlineTextField
              value={state.area}
              onChangeText={text => setState(s => ({...s, area: text}))}
              keyboardType="number-pad"
              placeholder={t('forms.areaSquareMeters')}
            />
            <Divider />
            <UnderlineTextField
              value={state.product_year}
              onChangeText={text => setState(s => ({...s, product_year: text}))}
              keyboardType="number-pad"
              placeholder={t('forms.buildYear')}
            />
            <Divider />
            {/* رهن و اجاره مسکونی/اداری needs separate رهن/اجاره amounts
                instead of one price (Figma "ثبت آگهی – اجاره مسکونی3") —
                every other estate subcategory keeps the single price field. */}
            {subCategory?.title?.includes('رهن و اجاره') ? (
              <>
                <UnderlineTextField
                  value={state.rehn}
                  onChangeText={text => setState(s => ({...s, rehn: text}))}
                  keyboardType="number-pad"
                  thousandSeparator
                  placeholder={t('forms.enterMortgageToman')}
                />
                <Divider />
                <UnderlineTextField
                  value={state.ejare}
                  onChangeText={text => setState(s => ({...s, ejare: text}))}
                  keyboardType="number-pad"
                  thousandSeparator
                  placeholder={t('forms.enterRentToman')}
                />
                <Divider />
                <Checkbox
                  value={state.convertible}
                  onToggle={() =>
                    setState(s => ({...s, convertible: !s.convertible}))
                  }
                  style={{flexDirection: 'row', alignSelf: 'center'}}
                  text={t('forms.convertibleMortgage')}
                />
              </>
            ) : (
              <UnderlineTextField
                value={state.price}
                onChangeText={text => setState(s => ({...s, price: text}))}
                keyboardType="number-pad"
                thousandSeparator
                placeholder={t('common.price')}
              />
            )}
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
                placeholder={t('forms.adType')}
                value={localizeOption(state.adsType)}
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
                placeholder={t('forms.adCreator')}
                value={localizeOption(state.adsCreator)}
              />
            </Button>
            {subCategory?.title?.includes('اداری و تجاری') && (
              <>
                <Divider />
                <UnderlineTextField
                  value={state.documentType}
                  onChangeText={text =>
                    setState(s => ({...s, documentType: text}))
                  }
                  placeholder={t('forms.officeDocument')}
                />
              </>
            )}
          </>
        )}

        <Divider />
        <UnderlineTextField
          value={state.features}
          onChangeText={text => setState(s => ({...s, features: text}))}
          placeholder={t('forms.features')}
        />

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
          value={state.description}
          onChangeText={text => setState(s => ({...s, description: text}))}
          placeholder={t('common.description')}
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
                    placeholder={t('forms.floor')}
                    value={localizeOption(state.floor)}
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
                    placeholder={t('forms.elevator')}
                    value={localizeOption(state.elevator)}
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
                    placeholder={t('forms.parking')}
                    value={localizeOption(state.parking)}
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
                placeholder={t('forms.suburb')}
                value={localizeOption(state.suburb)}
              />
            </Button>
          </>
        )}
      </View>
      <LocationSelectModal
        visible={state.locationModal}
        onClose={() => setState(s => ({...s, locationModal: false}))}
        onSelect={(lat, lng) => setState(s => ({...s, lat, lng}))}
      />
      <AdsOptionsModal
        type={state.optionType}
        visible={state.optionModal}
        onSelect={(item: any) => setState(s => ({...s, [s.optionType]: item}))}
        onClose={() => setState(s => ({...s, optionModal: false}))}
      />
    </>
  );
}
