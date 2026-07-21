import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Button, Divider, MainHeader, Screen, Text} from '../../../components';
import {
  PAYMENT_CARD_HOLDER,
  PAYMENT_CARD_NUMBER,
  numberWithCommas,
} from '../../../utiles';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';

export function CreateOfferMarketPay() {
  const {navigate} = useNavigation();
  return (
    <Screen style={{flex: 1}}>
      <MainHeader title="تخفیف یاب" />
      <Divider />
      <View style={{paddingHorizontal: 12}}>
        <Text size={17} style={{textAlign: 'center'}}>
          ثبت فروشگاه تخفیف یاب رایگان نیست و بصورت اشتراک ماهانه است.
        </Text>
        <Divider />
        <Text size={17}>
          هر فروشگاه فقط می تواند توی یک صنف فعالیت کند درغیر اینصورت شرکت ماهم
          می تواند فروشگاه اش رو ببندد.
        </Text>
        <Divider height={50} />
        <Text color={colors.main} size={17} style={{textAlign: 'center'}}>
          هزینه ثبت فروشگاه {numberWithCommas(300000)} تومان
        </Text>
        <Divider height={30} />
        <View style={styles.cardBox}>
          <Text size={15} style={{textAlign: 'center'}}>
            مبلغ فوق را به شماره کارت زیر واریز کرده و منتظر تایید مدیر بمانید.
          </Text>
          <Divider />
          <Text
            size={20}
            preset="bold"
            style={{textAlign: 'center'}}
            color={colors.main}>
            {PAYMENT_CARD_NUMBER}
          </Text>
          <Text size={14} style={{textAlign: 'center'}}>
            به نام {PAYMENT_CARD_HOLDER}
          </Text>
        </View>
      </View>
      <Button onPress={() => navigate('userpanel')} style={styles.button}>
        <Text size={17} color="white">
          پرداخت را انجام دادم
        </Text>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardBox: {
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.pallete.gray1,
  },
  button: {
    backgroundColor: colors.main,
    height: 48,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
