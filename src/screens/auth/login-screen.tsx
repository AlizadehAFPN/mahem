import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Button,
  Divider,
  HeaderBackButton,
  Screen,
  Text,
  TextField,
} from '../../components';
import {colors, scaled} from '../../theme';
import {mobileValidation} from '../../utiles';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from 'react-query';
import {checkAvailability, requestOtp} from '../../services';

// Signing back in to an account that already exists. Reached from the sign-up
// screen (the stack's initial route), never the other way round by default.
//
// Built to the same Figma construction as that screen (node 106:145): red
// instruction band, grey strip, disc across the join — with the brand mark in
// the disc where sign-up has its photo picker, since there is nothing to pick
// here.
//
// The mobile number is all this screen asks for, because that is all the
// backend keys an account on (`mobile @unique`, and verifyOtp upserts). That
// upsert is also why the number is checked against checkAvailability first: on
// its own, "signing in" with a number nobody has registered would quietly
// create a second, nameless account instead of saying so.
export function LoginScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [state, setState] = useState({
    mobile: '',
    mobileError: '',
    // The mirror of the sign-up screen's accountExists: a number that has
    // never been registered.
    noAccountFound: false,
  });

  // Debounced so the error appears once the user pauses, not on the first
  // digit of a number they're still typing.
  useEffect(() => {
    if (state.mobile) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!mobileValidation(state.mobile)) {
          setState(s => ({...s, mobileError: t('auth.mobileError')}));
        }
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mobile]);

  const {mutateAsync: checkAvailabilityAsync, isLoading: isChecking} =
    useMutation(checkAvailability);
  const {mutateAsync: requestOtpAsync, isLoading: isRequesting} =
    useMutation(requestOtp);
  const isLoading = isChecking || isRequesting;

  const canSubmit = mobileValidation(state.mobile) && !isLoading;

  const onPressContinue = async () => {
    if (!canSubmit) {
      return;
    }
    try {
      const {mobileTaken} = await checkAvailabilityAsync({
        mobile: state.mobile,
      });
      if (!mobileTaken) {
        setState(s => ({...s, noAccountFound: true}));
        return;
      }
    } catch {
      setState(s => ({...s, mobileError: t('auth.codeGenericError')}));
      return;
    }

    try {
      const response = await requestOtpAsync({mobile: state.mobile});
      navigate('codeInput', {
        mobile: state.mobile,
        // Only present while the backend runs with OTP_MOCK=true; the code
        // screen shows it so the flow is testable without SMS.
        otpCode: response?.code,
      });
    } catch {
      setState(s => ({...s, mobileError: t('auth.codeGenericError')}));
    }
  };

  return (
    <Screen statusbarBackgroundColor={colors.main} style={styles.content}>
      <View style={styles.topColor}>
        {/* Sign-up is this stack's initial route and this screen is pushed on
            top of it — so there has to be a way back to it that isn't the
            "حساب کاربری ندارید؟" link further down (which navigates forward
            and would stack the two screens up). */}
        <HeaderBackButton style={styles.back} />
        <Text size={20} color="white" style={styles.intro}>
          {t('auth.loginIntro')}
        </Text>
      </View>
      {/* Same disc as the sign-up screen, pulled up out of the grey strip so it
          straddles the boundary. It holds the ماهم mark rather than a photo —
          "ماهم" is Turkmen for "my moon", which is what the white disc against
          the red band is meant to read as. */}
      <View style={styles.grayCard}>
        <View style={styles.moon}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.moonMark}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.form}>
        <TextField
          style={styles.input}
          // Passed as the prop rather than in `style`, because TextField's own
          // borderColor (focused red / error red / this) is applied after the
          // style override and would otherwise win.
          borderColor="black"
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          label={t('auth.mobile')}
          // Shows the shape of the thing being asked for (11 digits, leading
          // 09) without spending a line of hint text on it.
          placeholder={t('auth.mobilePlaceholder')}
          phoneNumber
          inputMode="tel"
          maxLength={11}
          error={state.mobileError}
          // Occupies the supporting-text slot under the field. Reserved even
          // when empty, so a rejected number doesn't shove the button and
          // everything under it down the screen.
          reserveErrorSpace
          onChangeText={text =>
            setState(s => ({
              ...s,
              mobile: text,
              mobileError: '',
              noAccountFound: false,
            }))
          }
        />
        {/* The mirror of the sign-up screen's notice: this number has no
            account yet, and sign-up is one tap away. */}
        {state.noAccountFound && (
          <View style={styles.notice}>
            <Text size={15} color={colors.error} style={styles.noticeText}>
              {t('auth.noAccountFound')}
            </Text>
            <Divider height={8} />
            <TouchableOpacity onPress={() => navigate('register' as never)}>
              <Text size={15} color={colors.main} style={styles.noticeAction}>
                {t('auth.goToRegister')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Divider height={16} />
        <Button
          loading={isLoading}
          disabled={!canSubmit}
          onPress={onPressContinue}
          style={{
            ...styles.cta,
            backgroundColor: canSubmit ? colors.main : colors.pallete.gray1,
            borderColor: canSubmit ? colors.main : colors.pallete.gray2,
          }}>
          <Text color={canSubmit ? 'white' : 'black'} size={20}>
            {t('auth.getCode')}
          </Text>
        </Button>
        <Divider height={22} />
        <TouchableOpacity onPress={() => navigate('register' as never)}>
          <Text
            size={15}
            color={colors.pallete.grayText}
            style={styles.altPath}>
            {t('auth.noAccount')}{' '}
            <Text size={15} color={colors.main} style={styles.altPathAction}>
              {t('auth.registerAction')}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pushes the terms line to the bottom of whatever room is left — and
          collapses to nothing when the keyboard takes that room away. */}
      <View style={styles.spacer} />

      {/* Accepting the rules is implicit in signing back in — the explicit tick
          lives on the sign-up screen, where the account is created. They still
          have to be readable from here, so the name of the document is the
          link to it. */}
      <View style={styles.footer}>
        <Text size={13} color={colors.pallete.grayText} style={styles.terms}>
          {t('auth.loginTermsPrefix')}
          <Text
            size={13}
            color={colors.main}
            style={styles.termsLink}
            onPress={() => navigate('privacy' as never)}>
            {t('auth.loginTermsLink')}
          </Text>
          {t('auth.loginTermsSuffix')}
        </Text>
      </View>
    </Screen>
  );
}

// Kept in step with register-screen.tsx, which these came from (Figma 106:145).
const MOON_SIZE = scaled(94);
const GRAY_STRIP_HEIGHT = scaled(51);
const MOON_OVERLAP = scaled(49);

const styles = StyleSheet.create({
  // Fills the viewport (this is the ScrollView's content container) so the
  // terms line can sit at the bottom of the white area — and still scrolls if a
  // short screen plus an open keyboard leaves less room than the form needs.
  content: {
    flexGrow: 1,
  },
  topColor: {
    backgroundColor: colors.main,
    height: scaled(137),
    paddingHorizontal: scaled(16),
    paddingTop: scaled(25),
  },
  // Absolute so the arrow sits in the band's top corner without pushing the
  // centred instruction text down and breaking the Figma spacing.
  back: {
    position: 'absolute',
    top: scaled(6),
    right: scaled(8),
    zIndex: 1,
  },
  intro: {
    textAlign: 'center',
    lineHeight: scaled(32),
  },
  grayCard: {
    backgroundColor: colors.pallete.gray1,
    height: GRAY_STRIP_HEIGHT,
    alignItems: 'center',
  },
  moon: {
    width: MOON_SIZE,
    height: MOON_SIZE,
    borderRadius: MOON_SIZE / 2,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -MOON_OVERLAP,
  },
  moonMark: {
    width: scaled(58),
    height: scaled(28),
    tintColor: colors.main,
  },
  form: {
    paddingHorizontal: scaled(21),
    paddingTop: scaled(19),
  },
  input: {
    height: scaled(53),
    borderRadius: scaled(8),
  },
  inputLabel: {
    color: 'black',
    fontSize: scaled(17),
    marginTop: scaled(-5),
  },
  // Alignment comes from TextField's `phoneNumber` prop (left, LTR); this is
  // only the size of the digits — 17 to match the field's label, rather than
  // shouting one point louder than every other input in the app.
  inputText: {
    fontSize: scaled(17),
    letterSpacing: 0.5,
  },
  notice: {
    backgroundColor: colors.pallete.lightRed,
    borderRadius: scaled(8),
    padding: scaled(14),
  },
  noticeText: {
    lineHeight: scaled(26),
  },
  noticeAction: {
    textDecorationLine: 'underline',
  },
  cta: {
    width: '53%',
    height: scaled(50),
    borderRadius: scaled(8),
    borderWidth: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  altPath: {
    textAlign: 'center',
    lineHeight: scaled(26),
  },
  altPathAction: {
    textDecorationLine: 'underline',
  },
  spacer: {
    // flexGrow, not flex: RN leaves flexShrink at 0, so this only ever hands
    // room back — it can't squeeze the form above it on a short screen.
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: scaled(24),
    paddingTop: scaled(16),
    paddingBottom: scaled(24),
  },
  terms: {
    textAlign: 'center',
    lineHeight: scaled(22),
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});
