import {Alert, FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {localizeOption} from '../../i18n/display-maps';
import {AdsOptionsModal} from '../modal/ads-options-modal';
import {Button} from '../button/button';
import {Checkbox} from '../checkbox/checkbox';
import {ContactInfoCard} from './contact-info-card';
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

function boolToLabel(
  value: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string,
) {
  if (value === true) return trueLabel;
  if (value === false) return falseLabel;
  return '';
}

export function CarForm({subCategory, editItem, send, onSend}) {
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
          product_year:
            editItem.product_year != null ? String(editItem.product_year) : '',
          operation_amount:
            editItem.operation_amount != null
              ? String(editItem.operation_amount)
              : '',
          price: editItem.price != null ? String(editItem.price) : '',
          brand: editItem.brand ?? '',
          chassi: editItem.base_type ?? '',
          payType: boolToLabel(editItem.is_cash, 'اقساطی', 'نقدی'),
          features: editItem.features ?? '',
          usage: '',
          adsType: editItem.ad_type ?? '',
          carAdsCreator: boolToLabel(editItem.by_person, 'شخصی', 'شرکت'),
          selectCategoryModal: false,
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
          email: '',
          chatEnabled: true,
          hideEmail: false,
          product_year: '',
          operation_amount: '',
          price: '',
          brand: '',
          chassi: '',
          payType: '',
          features: '',
          usage: '',
          adsType: '',
          carAdsCreator: '',
          selectCategoryModal: false,
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
          email,
          chatEnabled,
          hideEmail,
          brand,
          chassi,
          features,
          carAdsCreator,
          operation_amount,
          product_year,
          payType,
          lat,
          lng,
        } = state;
        // Stored as the plain label (not an index into the admin-managed
        // option list) so adding/reordering/removing options never
        // invalidates already-created ads.
        const is_cash = payType == 'اقساطی';
        const by_person = carAdsCreator == 'شخصی';
        onSend({
          title,
          description,
          price,
          contact_info,
          email,
          chatEnabled,
          hideEmail,
          // Sent as numbers (not the raw string state) so the backend's
          // minOperationAmount/maxOperationAmount and minProductYear/
          // maxProductYear range filters compare numerically.
          operation_amount:
            operation_amount !== '' ? Number(operation_amount) : undefined,
          product_year: product_year !== '' ? Number(product_year) : undefined,
          is_cash,
          ad_type: adsType,
          brand,
          base_type: chassi,
          features,
          by_person,
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
        {subCategory?.title?.includes('سواری') && (
          <>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({...s, optionModal: true, optionType: 'brand'}))
              }>
              <UnderlineTextField
                value={localizeOption(state.brand)}
                keyboardType="number-pad"
                placeholder={t('forms.brand')}
                editable={false}
              />
            </Button>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({...s, optionModal: true, optionType: 'chassi'}))
              }>
              <UnderlineTextField
                value={localizeOption(state.chassi)}
                keyboardType="number-pad"
                placeholder={t('forms.chassisType')}
                editable={false}
              />
            </Button>
          </>
        )}
        <Divider />
        <Button
          onPress={() =>
            setState(s => ({...s, optionModal: true, optionType: 'payType'}))
          }>
          <UnderlineTextField
            value={localizeOption(state.payType)}
            keyboardType="number-pad"
            placeholder={t('forms.cashOrInstallment')}
            editable={false}
          />
        </Button>
        <Divider />
        <UnderlineTextField
          value={state.product_year}
          onChangeText={text => setState(s => ({...s, product_year: text}))}
          keyboardType="number-pad"
          placeholder={t('forms.productionYear')}
        />
        <Divider />
        <UnderlineTextField
          value={state.operation_amount}
          onChangeText={text => setState(s => ({...s, operation_amount: text}))}
          keyboardType="number-pad"
          placeholder={t('forms.mileageKm')}
        />

        <Divider />
        {/* <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'price' }))}> */}
        <UnderlineTextField
          value={state.price}
          onChangeText={text => setState(s => ({...s, price: text}))}
          keyboardType="number-pad"
          placeholder={t('common.price')}
          // editable={false}
        />
        {/* </Button> */}
        <Divider />
        <Button
          onPress={() =>
            setState(s => ({...s, optionModal: true, optionType: 'adsType'}))
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
              optionType: 'carAdsCreator',
            }))
          }>
          <UnderlineTextField
            editable={false}
            placeholder={t('forms.adCreator')}
            value={localizeOption(state.carAdsCreator)}
          />
        </Button>

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
      </View>
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
