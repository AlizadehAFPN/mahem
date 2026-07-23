import {StyleSheet, Switch, View} from 'react-native';
import React from 'react';
import {Row} from '../row/row';
import {Text} from '../text/text';
import {UnderlineTextField} from '../text-field/underline-text-field';
import {colors} from '../../theme';

export interface ContactInfoValue {
  contact_info: string;
  email: string;
  chatEnabled: boolean;
  hideEmail: boolean;
}

interface ContactInfoCardProps {
  value: ContactInfoValue;
  onChange: (value: ContactInfoValue) => void;
}

// "تلفن" (Figma 106:8176) — phone + email + two toggles, shown inline in
// every ad-creation form in place of the old bare "اطلاعات تماس" field.
// email/chatEnabled/hideEmail aren't known top-level fields on the backend,
// so they ride into `Advertisement.attributes` the same way brand/area/etc.
// already do (see ads.ts's createAds).
export function ContactInfoCard({value, onChange}: ContactInfoCardProps) {
  const set = (patch: Partial<ContactInfoValue>) =>
    onChange({...value, ...patch});

  return (
    <View style={styles.card}>
      <Text style={styles.label}>شماره موبایل</Text>
      <UnderlineTextField
        value={value.contact_info}
        onChangeText={text => set({contact_info: text})}
        placeholder="شماره موبایل شما"
        keyboardType="number-pad"
      />
      <Text style={styles.helper}>
        {'کد تایید به شماره موبایل شما ارسال خواهد شد\nتماس و چت نیز با این شماره انجام می شود'}
      </Text>
      <Row style={styles.toggleRow}>
        <Switch
          value={value.chatEnabled}
          onValueChange={v => set({chatEnabled: v})}
          trackColor={{false: colors.pallete.gray3, true: colors.pallete.green1}}
          thumbColor={value.chatEnabled ? colors.pallete.green : '#f4f3f4'}
        />
        <Text size={15} style={styles.toggleLabel}>
          فعال کردن چت
        </Text>
      </Row>

      <Text style={[styles.label, styles.emailLabel]}>ایمیل</Text>
      <UnderlineTextField
        value={value.email}
        onChangeText={text => set({email: text})}
        placeholder="ایمیل شما"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.helper}>
        آدرس ایمیل خود را بدرستی وارد کنید. لینک «مدیریت آگهی» به ایمیل شما ارسال خواهد شد
      </Text>
      <Row style={styles.toggleRow}>
        <Switch
          value={value.hideEmail}
          onValueChange={v => set({hideEmail: v})}
          trackColor={{false: colors.pallete.gray3, true: colors.pallete.green1}}
          thumbColor={value.hideEmail ? colors.pallete.green : '#f4f3f4'}
        />
        <Text size={15} style={styles.toggleLabel}>
          عدم نمایش ایمیل در آگهی
        </Text>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.pallete.gray1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  label: {
    textAlign: 'center',
    fontSize: 15,
    opacity: 0.5,
    marginBottom: 4,
  },
  emailLabel: {
    marginTop: 16,
  },
  helper: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
    marginBottom: 8,
  },
  toggleRow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  toggleLabel: {
    marginHorizontal: 8,
  },
});
