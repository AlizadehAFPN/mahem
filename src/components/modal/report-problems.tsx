import {View, StyleSheet, Image, ScrollView, Alert} from 'react-native';
import React, {useState} from 'react';
import {MainModal} from './mainModal';
import {colors} from '../../theme';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {Divider} from '../divider/divider';
import {Button} from '../button/button';
import {Checkbox} from '../checkbox/checkbox';
import {TextField} from '../text-field/text-field';
import {Screen} from '../screen/screen';
import {useMutation} from 'react-query';
import {createReport} from '../../services';

import {} from 'react-native-gesture-handler';
// Values match the backend's ReportCategory enum directly.
const checkOptions = [
  {title: 'دسته بندی نامناسب', value: 'CATEGORY_PROBLEM'},
  {title: 'محتوی آگهی نامناسب', value: 'CONTENT_PROBLEM'},
  {title: 'قیمت آگهی نامناسب', value: 'PRICE_PROBLEM'},
  {title: 'شماره تماس نادرست', value: 'CALL_INFO_PROBLEM'},
  {title: 'محصول دیگر موجود نیست', value: 'EXISTENCY_PROBLEM'},
  {title: 'دیگر', value: 'OTHER'},
];

export function ReportProblem({visible, onClose, advertisementId}) {
  const [state, setState] = useState({
    checkProb: '',
    phone: '',
    email: '',
    description: '',
  });

  const {mutate, isLoading} = useMutation(
    (data: any) => createReport(advertisementId, data),
    {
      onSuccess: () => {
        setState({checkProb: '', phone: '', email: '', description: ''});
        onClose();
        Alert.alert('گزارش شما ثبت شد', 'با تشکر از همراهی شما.');
      },
      onError: () => {
        Alert.alert('خطا', 'ارسال گزارش با خطا مواجه شد، دوباره تلاش کنید.');
      },
    },
  );

  const onSubmit = () => {
    if (!state.checkProb) {
      Alert.alert('لطفا نوع مشکل را انتخاب کنید');
      return;
    }
    mutate({
      category: state.checkProb,
      phone: state.phone || undefined,
      email: state.email || undefined,
      description: state.description || undefined,
    });
  };

  return (
    <MainModal onClose={onClose} visible={visible}>
      <View style={styles.card}>
        <ScrollView>
          <View style={styles.card2}>
            {checkOptions.map(item => (
              <Checkbox
                key={item.value}
                checkedColor={colors.pallete.green}
                value={state.checkProb === item.value}
                onToggle={() => setState(s => ({...s, checkProb: item.value}))}
                text={item.title}
                style={{marginVertical: 12}}
              />
            ))}
            <TextField
              inputStyle={{textAlign: 'right'}}
              preset="underline"
              placeholder="شماره موبایل"
              inputMode="tel"
              value={state.phone}
              onChangeText={text => setState(s => ({...s, phone: text}))}
              borderColor={colors.pallete.red2}
            />
            <Divider />
            <TextField
              preset="underline"
              placeholder="ایمیل"
              inputMode="email"
              value={state.email}
              onChangeText={text => setState(s => ({...s, email: text}))}
              borderColor={colors.pallete.red2}
            />
            <Divider />
            <TextField
              preset="underline"
              placeholder="توضیحات"
              value={state.description}
              onChangeText={text => setState(s => ({...s, description: text}))}
              borderColor={colors.pallete.red2}
            />
            <Divider />
            <Row style={{justifyContent: 'space-between'}}>
              <Button onPress={onSubmit} disabled={isLoading}>
                <Text color={colors.pallete.red2}>
                  {isLoading ? 'در حال ارسال...' : 'ارسال'}
                </Text>
              </Button>
              <Button onPress={onClose}>
                <Text color={colors.pallete.red2}>بیخیال</Text>
              </Button>
            </Row>
          </View>
          <Divider />
        </ScrollView>
      </View>
    </MainModal>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 4,
    borderColor: colors.pallete.gray2,
    paddingHorizontal: 8,
    paddingTop: 16,
    backgroundColor: colors.pallete.gray1,
  },
  textItem: {
    paddingHorizontal: 10,
  },
  card2: {
    paddingHorizontal: 16,
  },
});
