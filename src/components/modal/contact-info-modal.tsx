import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {MainModal} from './mainModal';
import {colors, scaled} from '../../theme';
import {Text} from '../text/text';
import {Divider} from '../divider/divider';
import {Button} from '../button/button';
import {ContactInfoCard, ContactInfoValue} from '../forms/contact-info-card';

interface ContactInfoModalProps {
  visible: boolean;
  value: ContactInfoValue;
  onChange: (value: ContactInfoValue) => void;
  onClose: () => void;
}

// "اطلاعات تماس" (Figma job-listing form): the single underline field shown
// inline opens this modal, which holds the same مobile/چت/ایمیل card every
// other ad form shows inline — kept as a modal here only for استخدامی to
// match the Figma field list (see CommonForm's isJobListing branch).
export function ContactInfoModal({
  visible,
  value,
  onChange,
  onClose,
}: ContactInfoModalProps) {
  const {t} = useTranslation();
  return (
    <MainModal onClose={onClose} visible={visible}>
      <View style={styles.card}>
        <Text
          preset="bold"
          size={17}
          color={colors.pallete.red2}
          style={styles.title}>
          {t('callInfo.title')}
        </Text>
        <Divider />
        <ContactInfoCard value={value} onChange={onChange} />
        <Button onPress={onClose} style={styles.confirmButton}>
          <Text color="white">{t('common.confirm')}</Text>
        </Button>
        <Divider />
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
    paddingHorizontal: scaled(16),
    paddingTop: scaled(16),
    backgroundColor: colors.pallete.gray1,
  },
  title: {
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: colors.main,
    height: scaled(40),
    borderRadius: scaled(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
