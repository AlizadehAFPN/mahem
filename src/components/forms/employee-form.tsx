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

export function EmployeeForm({send, onSend}) {
  const {navigate} = useNavigation();
  const [state, setState] = useState({
    education: '',
    title: '',
    features: '',
    contact_info: '',
    description: '',
    contractType: '',
    city: '',
    cityModal: false,
    acceptance: false,
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
          education,
          contractType,
          features,
          contact_info,
          city,
        } = state;
        const degree = optionsTypes.education.findIndex(
          item => item.title === education,
        );
        const contract_type = optionsTypes.contractType.findIndex(
          item => item.title === contractType,
        );
        onSend({
          title,
          description,
          features,
          contact_info,
          city_id: city?.id,
          degree,
          contract_type,
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

        <Divider />
        <Button
          onPress={() =>
            setState(s => ({...s, optionModal: true, optionType: 'education'}))
          }>
          <UnderlineTextField
            onPressIn={() =>
              setState(s => ({
                ...s,
                optionModal: true,
                optionType: 'education',
              }))
            }
            value={state.education}
            editable={false}
            placeholder="میزان تحصیلات"
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
            onPressIn={() =>
              setState(s => ({
                ...s,
                optionModal: true,
                optionType: 'contractType',
              }))
            }
            value={state.contractType}
            editable={false}
            placeholder="نوع۲ قرارداد"
          />
        </Button>
        <Divider />
        <UnderlineTextField
          placeholder="ویژگی ها"
          value={state.features}
          onChangeText={text => setState(s => ({...s, features: text}))}
        />

        <Divider />
        <UnderlineTextField
          placeholder="اطلاعات تماس"
          keyboardType="number-pad"
          value={state.contact_info}
          onChangeText={text => setState(s => ({...s, contact_info: text}))}
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
        onSelect={city => {
          setState(s => ({...s, city, cityModal: false}));
          console.log(city, 'city----');
        }}
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
