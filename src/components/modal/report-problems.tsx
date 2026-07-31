import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {MainModal} from './mainModal';
import {colors, scaled} from '../../theme';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {Divider} from '../divider/divider';
import {Button} from '../button/button';
import {Checkbox} from '../checkbox/checkbox';
import {TextField} from '../text-field/text-field';
import {useMutation} from 'react-query';
import {createReport} from '../../services';

import {} from 'react-native-gesture-handler';
// Values match the backend's ReportCategory enum directly; `titleKey` is the
// i18n key for the label shown to the user (the enum `value` stays canonical).
const checkOptions = [
  {titleKey: 'report.reasonCategory', value: 'CATEGORY_PROBLEM'},
  {titleKey: 'report.reasonContent', value: 'CONTENT_PROBLEM'},
  {titleKey: 'report.reasonPrice', value: 'PRICE_PROBLEM'},
  {titleKey: 'report.reasonCallInfo', value: 'CALL_INFO_PROBLEM'},
  {titleKey: 'report.reasonExistency', value: 'EXISTENCY_PROBLEM'},
  {titleKey: 'report.reasonOther', value: 'OTHER'},
];

export interface ReportProblemProps {
  visible?: any;
  onClose?: any;
  advertisementId?: any;
}

export function ReportProblem({
  visible,
  onClose,
  advertisementId,
}: ReportProblemProps) {
  const {t} = useTranslation();
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
        Alert.alert(t('report.submittedTitle'), t('report.submittedBody'));
      },
      onError: () => {
        Alert.alert(t('common.error'), t('report.errorBody'));
      },
    },
  );

  const onSubmit = () => {
    if (!state.checkProb) {
      Alert.alert(t('report.selectReason'));
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
                text={t(item.titleKey)}
                style={{marginVertical: scaled(12)}}
              />
            ))}
            <TextField
              preset="underline"
              placeholder={t('common.phoneNumber')}
              inputMode="tel"
              phoneNumber
              value={state.phone}
              onChangeText={text => setState(s => ({...s, phone: text}))}
              borderColor={colors.pallete.red2}
            />
            <Divider />
            <TextField
              preset="underline"
              placeholder={t('common.email')}
              inputMode="email"
              value={state.email}
              onChangeText={text => setState(s => ({...s, email: text}))}
              borderColor={colors.pallete.red2}
            />
            <Divider />
            <TextField
              preset="underline"
              placeholder={t('common.description')}
              value={state.description}
              onChangeText={text => setState(s => ({...s, description: text}))}
              borderColor={colors.pallete.red2}
            />
            <Divider />
            <Row style={{justifyContent: 'space-between'}}>
              <Button onPress={onSubmit} disabled={isLoading}>
                <Text color={colors.pallete.red2}>
                  {isLoading ? t('common.sending') : t('common.send')}
                </Text>
              </Button>
              <Button onPress={onClose}>
                <Text color={colors.pallete.red2}>{t('common.neverMind')}</Text>
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
    borderRadius: scaled(12),
    marginBottom: scaled(4),
    borderColor: colors.pallete.gray2,
    paddingHorizontal: scaled(8),
    paddingTop: scaled(16),
    backgroundColor: colors.pallete.gray1,
  },
  textItem: {
    paddingHorizontal: scaled(10),
  },
  card2: {
    paddingHorizontal: scaled(16),
  },
});
