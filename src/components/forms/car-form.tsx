import {Alert, FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AdsOptionsModal,
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
  optionsTypes,
} from '../../components';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import {SelectAdsCategory} from '../../components';

export function CarForm({subCategory, send, onSend}) {
  const [state, setState] = useState({
    title: '',
    description: '',
    contact_info: '',
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
    city: '',
    cityModal: false,
    selectCategoryModal: false,
    optionType: '',
    optionModal: false,
  });

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
          brand,
          operation_amount,
          product_year,
          payType,
        } = state;
        const ad_type = optionsTypes.adsType.findIndex(
          item => item.title === adsType,
        );
        const tempB = optionsTypes.adsType.findIndex(
          item => item.title === brand,
        );
        const is_cash = payType == 'اقساطی';
        onSend({
          title,
          description,
          price,
          contact_info,
          city_id: city?.id,
          operation_amount,
          product_year,
          is_cash,
          ad_type,
          brand: tempB,
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
        {subCategory?.title?.includes('سواری') && (
          <>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({...s, optionModal: true, optionType: 'brand'}))
              }>
              <UnderlineTextField
                onPressIn={() =>
                  setState(s => ({
                    ...s,
                    optionModal: true,
                    optionType: 'brand',
                  }))
                }
                value={state.brand}
                keyboardType="number-pad"
                placeholder="برند"
                editable={false}
              />
            </Button>
            <Divider />
            <Button
              onPress={() =>
                setState(s => ({...s, optionModal: true, optionType: 'chassi'}))
              }>
              <UnderlineTextField
                onPressIn={() =>
                  setState(s => ({
                    ...s,
                    optionModal: true,
                    optionType: 'chassi',
                  }))
                }
                value={state.chassi}
                keyboardType="number-pad"
                placeholder="نوع شاسی"
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
            onPressIn={() =>
              setState(s => ({...s, optionModal: true, optionType: 'payType'}))
            }
            value={state.payType}
            keyboardType="number-pad"
            placeholder="نقد/اقساط"
            editable={false}
          />
        </Button>
        <Divider />
        <UnderlineTextField
          value={state.product_year}
          onChangeText={text => setState(s => ({...s, product_year: text}))}
          keyboardType="number-pad"
          placeholder="سال تولید"
        />
        <Divider />
        <UnderlineTextField
          value={state.operation_amount}
          onChangeText={text => setState(s => ({...s, operation_amount: text}))}
          keyboardType="number-pad"
          placeholder="کارکرد (کیلومتر)"
        />

        <Divider />
        {/* <Button onPress={() => setState(s => ({ ...s, optionModal: true, optionType: 'price' }))}> */}
        <UnderlineTextField
          value={state.price}
          onChangeText={text => setState(s => ({...s, price: text}))}
          // onPressIn={() => setState(s => ({ ...s, optionModal: true, optionType: 'price' }))}
          keyboardType="number-pad"
          placeholder="قیمت"
          // editable={false}
        />
        {/* </Button> */}
        <Divider />
        <Button
          onPress={() =>
            setState(s => ({...s, optionModal: true, optionType: 'adsType'}))
          }>
          <UnderlineTextField
            onPressIn={() =>
              setState(s => ({...s, optionModal: true, optionType: 'adsType'}))
            }
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
              optionType: 'carAdsCreator',
            }))
          }>
          <UnderlineTextField
            editable={false}
            placeholder="نوع آگهی دهنده"
            value={state.carAdsCreator}
          />
        </Button>

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
            onPressIn={() => setState(s => ({...s, cityModal: true}))}
            placeholder="تعیین موقعیت"
            value={state?.city?.title}
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
