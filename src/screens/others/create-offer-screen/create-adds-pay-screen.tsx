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
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type StackParamList = Record<string, object | undefined>;

export function CreateAddsPayScreen() {
  // useNavigation()'s default typing doesn't include the native-stack-only
  // `pop`, though it's present at runtime for every navigator in this app.
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  // Pops back to the UserOfferMarketScreen instance already on the stack
  // (which still has its `store` param) instead of navigating forward to a
  // fresh instance that would be missing it.
  const onDone = () => navigation.pop(2);
  return (
    <Screen style={{flex: 1}}>
      <MainHeader />
      <Divider />
      <View style={{paddingHorizontal: 12}}>
        <Text size={17} style={{textAlign: 'center'}}>
          ثبت در زیرمجموعه استخدامی و تخفیف یاب رایگان نیست.
        </Text>
        <Divider height={50} />
        <Text color={colors.main} size={17} style={{textAlign: 'center'}}>
          هزینه ثبت {numberWithCommas(7000)} تومان
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
      <Button onPress={onDone} style={styles.button}>
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
