import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {MainModal} from './mainModal';
import {colors, scaled} from '../../theme';
import {Text} from '../text/text';
import {Row} from '../row/row';
import {TextField} from '../text-field/text-field';

export interface DurationValue {
  minutes: string;
  houres: string;
  days: string;
}

interface DurationModalProps {
  visible: boolean;
  onClose: () => void;
  onChangeText: (text: string, label: keyof DurationValue) => void;
  value?: DurationValue;
}

const EMPTY_DURATION: DurationValue = {minutes: '', houres: '', days: ''};

// "تایم" (Figma 106:8706), the مدت زمان تخفیف picker on ثبت آگهی- تخفیف یاب:
// three small boxed number fields — روز/ساعت/دقیقه — with the entered figure
// in red and centred, under a muted grey label. The field boxes are a lighter
// grey than the card they sit on so they read as inputs rather than as part of
// the card, which is the whole point of the design.
//
// Fields are rendered دقیقه-first because Row lays its children out
// row-reverse (RTL), which puts the first child on the right — matching
// Figma's right-to-left دقیقه / ساعت / روز order.
export function DurationModal({
  visible,
  onClose,
  onChangeText,
  value,
}: DurationModalProps) {
  const {t} = useTranslation();
  // Fully controlled by the form that owns the duration (OfferForm's
  // state.duration) rather than keeping a second copy here — otherwise
  // reopening the modal showed empty boxes even though the form already had
  // a duration, and the red figures the design is about never appeared.
  const duration = value ?? EMPTY_DURATION;

  const field = (label: string, key: keyof DurationValue) => (
    <View style={styles.item}>
      <Text size={12} color={colors.pallete.grayText} style={styles.label}>
        {label}
      </Text>
      <TextField
        value={duration[key]}
        onChangeText={text => onChangeText(text, key)}
        keyboardType="number-pad"
        style={styles.box}
        inputStyle={styles.boxInput}
        borderColor={colors.pallete.gray2}
      />
    </View>
  );

  return (
    <MainModal onClose={onClose} visible={visible}>
      <View style={styles.card}>
        <Row style={styles.row}>
          {field(t('common.minute'), 'minutes')}
          {field(t('common.hour'), 'houres')}
          {field(t('common.day'), 'days')}
        </Row>
      </View>
    </MainModal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: scaled(10),
    marginBottom: scaled(4),
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    width: '100%',
    // Figma's card is 87 tall with the label starting 9px in and 29px of empty
    // space left under the boxes, so the padding is deliberately lopsided
    // rather than a single paddingVertical.
    paddingTop: scaled(9),
    paddingBottom: scaled(29),
  },
  row: {
    justifyContent: 'center',
  },
  // 89px between box centres in Figma, i.e. a 60px gap around 29px-wide boxes.
  item: {
    alignItems: 'center',
    marginHorizontal: scaled(30),
  },
  label: {
    marginBottom: scaled(6),
    textAlign: 'center',
  },
  box: {
    width: scaled(29),
    height: scaled(28),
    borderRadius: scaled(5),
    paddingHorizontal: 0,
    // A touch lighter than the card's #EEEEEE so the input reads as a well.
    backgroundColor: '#F3F1F1',
  },
  boxInput: {
    fontSize: scaled(15),
    color: colors.pallete.red2,
    textAlign: 'center',
    paddingHorizontal: 0,
  },
});
