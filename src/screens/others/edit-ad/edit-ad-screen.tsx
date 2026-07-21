import {View, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {
  Button,
  Divider,
  MainHeader,
  Screen,
  Text,
  UnderlineTextField,
} from '../../../components';
import {colors} from '../../../theme';
import {useMutation, useQueryClient} from 'react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import {updateAds} from '../../../services';

// Lightweight edit for the fields every ad category shares (title,
// description, price, contact info). Category-specific attributes (car
// brand/year, real-estate area/floor, etc.) live in CarForm/EstateForm's own
// internal state and aren't editable from here — re-create the ad instead
// if those need to change.
export function EditAdScreen() {
  const {goBack} = useNavigation();
  const {params} = useRoute();
  const ad = params?.ad;
  const queryClient = useQueryClient();
  const [state, setState] = useState({
    title: ad?.title ?? '',
    description: ad?.description ?? '',
    price: ad?.price != null ? String(ad.price) : '',
    contact_info: ad?.contact_info ?? '',
  });

  const {mutate, isLoading} = useMutation(
    (data: any) => updateAds(ad.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myAds');
        goBack();
      },
    },
  );

  const onSave = () => {
    mutate(state);
  };

  return (
    <Screen style={{flex: 1}}>
      <MainHeader title="ویرایش آگهی" />
      <View style={styles.form}>
        <UnderlineTextField
          value={state.title}
          onChangeText={text => setState(s => ({...s, title: text}))}
          placeholder="عنوان آگهی"
        />
        <Divider />
        <UnderlineTextField
          value={state.price}
          onChangeText={text => setState(s => ({...s, price: text}))}
          placeholder="قیمت"
          keyboardType="number-pad"
        />
        <Divider />
        <UnderlineTextField
          value={state.contact_info}
          onChangeText={text => setState(s => ({...s, contact_info: text}))}
          placeholder="اطلاعات تماس"
        />
        <Divider />
        <UnderlineTextField
          value={state.description}
          onChangeText={text => setState(s => ({...s, description: text}))}
          placeholder="توضیحات"
        />
        <Divider height={40} />
        <Text size={13} color={colors.pallete.grayText}>
          پس از ویرایش، آگهی مجدداً در صف بررسی مدیر قرار می‌گیرد.
        </Text>
        <Divider height={20} />
        <Button
          loading={isLoading}
          disabled={isLoading}
          onPress={onSave}
          style={styles.button}>
          <Text color="white" size={17}>
            ذخیره تغییرات
          </Text>
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  button: {
    height: 48,
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
