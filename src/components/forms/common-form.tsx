import {Alert, View} from 'react-native';
import {AdFormProps} from './form.props';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {localizeOption} from '../../i18n/display-maps';
import {AdsOptionsModal} from '../modal/ads-options-modal';
import {Button} from '../button/button';
import {ContactInfoCard} from './contact-info-card';
import {ContactInfoModal} from '../modal/contact-info-modal';
import {Divider} from '../divider/divider';
import {LocationSelectModal} from '../modal/location-select-modal';
import {UnderlineTextField} from '../text-field/underline-text-field';

// `editItem` is the mapped ad returned from getSingleAds/getAds (see
// mapAdvertisement) — its category-specific fields are already flattened
// from `attributes` onto the object directly, under the same wire names
// this form's onSend sends them as (ad_type, not the local `adsType`).
// استخدامی is a GENERAL category like any other and goes through this same
// form, but its `price` field actually means a proposed salary — often left
// unset ("توافقی") rather than a mandatory sale price.
const JOB_CATEGORY_TITLE = 'استخدامی';

export function CommonForm({
  mainCategory,
  editItem,
  send,
  onSend,
}: AdFormProps) {
  const {t} = useTranslation();
  const isJobListing = mainCategory?.title === JOB_CATEGORY_TITLE;
  const currentUser = useSelector((s: any) => s.user);
  const [state, setState] = useState(() =>
    editItem
      ? {
          title: editItem.title ?? '',
          description: editItem.description ?? '',
          contact_info: editItem.contact_info ?? '',
          email: editItem.email ?? '',
          chatEnabled: !!editItem.chatEnabled,
          hideEmail: !!editItem.hideEmail,
          adsType: editItem.ad_type ?? '',
          education: editItem.education ?? '',
          contractType: editItem.contractType ?? '',
          price: editItem.price != null ? String(editItem.price) : '',
          acceptance: true,
          selectCategoryModal: false,
          durationModal: false,
          optionType: '',
          optionModal: false,
          locationModal: false,
          contactInfoModal: false,
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
          adsType: '',
          education: '',
          contractType: '',
          price: '',
          acceptance: false,
          selectCategoryModal: false,
          durationModal: false,
          optionType: '',
          optionModal: false,
          locationModal: false,
          contactInfoModal: false,
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
          education,
          contractType,
          contact_info,
          email,
          chatEnabled,
          hideEmail,
          lat,
          lng,
        } = state;

        onSend?.({
          title,
          description,
          // A job listing never blocks on a missing contact number — it
          // falls back to the poster's own verified account mobile instead
          // (see handleValidation, which skips this field for job ads).
          contact_info:
            contact_info || (isJobListing ? currentUser?.mobile : contact_info),
          email,
          chatEnabled,
          hideEmail,
          lat,
          lng,
          ...(isJobListing
            ? {education, contractType}
            : {price, ad_type: adsType}),
        });
      } else {
        onSend?.(false);
      }
    }
  }, [send]);
  const handleValidation = () => {
    let isValid = true;
    const {title, description, contact_info, price} = state;
    if (!title) {
      isValid = false;
      Alert.alert(t('forms.validation.enterTitle'));
      // Backend rejects anything shorter (CreateAdvertisementDto:
      // @Length(10, 5000) on description) — catching it here instead of
      // letting the request 400 after the fee's already been "paid".
    } else if (description.trim().length < 10) {
      isValid = false;
      Alert.alert(t('forms.validation.descriptionMinLength'));
    } else if (!isJobListing && !price) {
      isValid = false;
      Alert.alert(t('forms.validation.enterPrice'));
    } else if (!isJobListing && !contact_info) {
      isValid = false;
      Alert.alert(t('forms.validation.enterContactInfo'));
    }
    return isValid;
  };

  const locationField = (
    <Button onPress={() => setState(s => ({...s, locationModal: true}))}>
      <UnderlineTextField
        placeholder={t('forms.setLocationOptional')}
        value={state.lat && state.lng ? t('forms.locationSelected') : ''}
        editable={false}
      />
    </Button>
  );
  const descriptionField = (
    <UnderlineTextField
      value={state.description}
      onChangeText={text => setState(s => ({...s, description: text}))}
      placeholder={t('common.description')}
    />
  );

  return (
    <>
      <View>
        <UnderlineTextField
          value={state.title}
          onChangeText={text => setState(s => ({...s, title: text}))}
          placeholder={t('forms.adTitlePlaceholder')}
        />
        {isJobListing ? (
          <>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({
                  ...s,
                  optionModal: true,
                  optionType: 'education',
                }))
              }>
              <UnderlineTextField
                editable={false}
                placeholder={t('forms.education')}
                value={localizeOption(state.education)}
              />
            </Button>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({
                  ...s,
                  optionModal: true,
                  optionType: 'contractType',
                }))
              }>
              <UnderlineTextField
                editable={false}
                placeholder={t('forms.contractType')}
                value={localizeOption(state.contractType)}
              />
            </Button>
            <Divider />
            {descriptionField}
            <Divider />
            <Button
              onPress={() => setState(s => ({...s, contactInfoModal: true}))}>
              <UnderlineTextField
                editable={false}
                placeholder={t('callInfo.title')}
                value={state.contact_info}
              />
            </Button>
            <Divider />
            {locationField}
          </>
        ) : (
          <>
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
            {mainCategory && (
              <>
                <Divider />
                <UnderlineTextField
                  value={state.price}
                  onChangeText={text => setState(s => ({...s, price: text}))}
                  placeholder={t('common.price')}
                  keyboardType="number-pad"
                  thousandSeparator
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
              </>
            )}
            <Divider />
            {locationField}
            <Divider />
            {descriptionField}
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
      {isJobListing && (
        <ContactInfoModal
          visible={state.contactInfoModal}
          value={{
            contact_info: state.contact_info,
            email: state.email,
            chatEnabled: state.chatEnabled,
            hideEmail: state.hideEmail,
          }}
          onChange={contact => setState(s => ({...s, ...contact}))}
          onClose={() => setState(s => ({...s, contactInfoModal: false}))}
        />
      )}
    </>
  );
}
