import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Screen,
  Text,
  Divider,
  Button,
  HeaderBackButton,
  TextField,
} from '../../components';
import {colors, scaled} from '../../theme';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMutation} from 'react-query';
import {PickedImage, sendActivationCode} from '../../services';

// The route isn't typed anywhere (this stack is built from a plain array of
// name/component pairs), so the shape is asserted here — `username` and
// `profileImage` only arrive from the sign-up screen, which collects them
// before there is an account to attach them to.
interface CodeInputParams {
  mobile: string;
  username?: string;
  profileImage?: PickedImage;
  otpCode?: string;
}

export function CodeInput() {
  const {t} = useTranslation();
  const params = useRoute<any>().params as CodeInputParams | undefined;
  const {goBack} = useNavigation<any>();
  const [state, setState] = useState({
    code: '',
    codeError: '',
  });

  const {mutate, isLoading} = useMutation(sendActivationCode);

  // A rejected mutation isn't necessarily a bad code — sendActivationCode also
  // reads the profile back afterwards, so a dropped connection at that point
  // would otherwise be reported as "wrong code". Only errors coming from the
  // verify call itself are translated to a code-specific message; anything
  // else falls back to a generic "try again".
  const describeError = (error: any) => {
    const url: string = error?.config?.url ?? '';
    if (!url.includes('/auth/otp/verify')) {
      return t('auth.codeGenericError');
    }
    const message = String(error?.response?.data?.message ?? '');
    if (message.includes('expired')) {
      return t('auth.codeExpired');
    }
    if (message.includes('Too many attempts')) {
      return t('auth.codeTooManyAttempts');
    }
    if (error?.response?.status === 401) {
      return t('auth.codeInvalid');
    }
    return t('auth.codeGenericError');
  };

  const handleNext = () => {
    const isValid = handleValidation();
    if (isValid) {
      // Only onError is wired up. On success sendActivationCode writes the
      // token to redux itself, which swaps the whole auth stack out and
      // unmounts this screen — and react-query v3 stops delivering a
      // mutation's callbacks the moment its observer unmounts, so an
      // onSuccess here would never run. On failure the screen is still
      // mounted, so this callback does arrive.
      mutate(
        {
          mobile: params!.mobile,
          activation_code: state.code,
          // Only set when arriving from the sign-up screen; sendActivationCode
          // writes them onto the new account before the session reaches redux.
          username: params!.username,
          profileImage: params!.profileImage,
        },
        {
          onError: error =>
            setState(s => ({...s, codeError: describeError(error)})),
        },
      );
    }
  };
  const handleValidation = () => {
    if (state.code.length < 4) {
      return false;
    }
    return true;
  };
  const enableButton = useCallback(handleValidation, [state.code]);
  return (
    <Screen style={{flex: 1}} statusbarBackgroundColor={colors.main}>
      <View style={sytles.topColor}>
        {/* The «تغییر شماره» link below does the same goBack(), but it reads as
            an action on the number rather than as leaving the screen — this is
            the plain back affordance every pushed screen gets. */}
        <HeaderBackButton style={sytles.back} />
        <Text
          style={{textAlign: 'center'}}
          preset="default"
          size={20}
          color="white">
          {t('auth.codeIntro', {mobile: params?.mobile})}
        </Text>
        {params?.otpCode ? (
          <Text
            style={{textAlign: 'center', marginTop: scaled(8)}}
            preset="default"
            size={18}
            color="white">
            {t('auth.testCode', {code: params.otpCode})}
          </Text>
        ) : null}
      </View>
      <View style={sytles.formContainer}>
        <Divider />
        <View style={sytles.codeContainer}>
          <TextField
            style={{
              borderRadius: scaled(8),
              borderColor: colors.pallete.gray2,
              width: '100%',
            }}
            labelStyle={{
              color: 'black',
              fontSize: scaled(17),
              marginTop: scaled(-5),
            }}
            label={t('auth.verificationCode')}
            inputMode="tel"
            error={state.codeError}
            // Same reason as the mobile field on the login screen: the failure
            // message sits above the confirm button, so its slot is reserved
            // up-front instead of pushing the button down (27 of the 60pt gap
            // below belongs to it).
            reserveErrorSpace
            // Clear the previous failure as soon as the code is edited, so a
            // stale "wrong code" doesn't sit under a freshly typed one.
            onChangeText={text =>
              setState(s => ({...s, code: text, codeError: ''}))
            }
            // No hard cap here: OTP_CODE_LENGTH on the backend is
            // configurable (currently 5), so a fixed maxLength would silently
            // truncate the code and make verification always fail.
            maxLength={8}
          />
        </View>
        <Divider height={33} />
        <Button
          loading={isLoading}
          disabled={!enableButton() || isLoading}
          onPress={handleNext}
          style={{
            ...sytles.button,
            backgroundColor: enableButton()
              ? colors.main
              : colors.pallete.gray1,
          }}>
          <Text
            color={enableButton() ? 'white' : colors.pallete.gray2}
            size={19}>
            {t('auth.finalConfirm')}
          </Text>
        </Button>
        <Divider height={20} />
        {/* A mistyped number is only recoverable before verification — after
            it, the account already exists and the only way out is the
            sign-out action on the complete-profile screen. This is a plain
            goBack() within the auth stack, so the number can be corrected. */}
        <TouchableOpacity onPress={goBack}>
          <Text
            size={14}
            color={colors.pallete.gray2}
            style={sytles.changeNumber}>
            {t('auth.changeNumber')}
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
const sytles = StyleSheet.create({
  topColor: {
    backgroundColor: colors.main,
    height: scaled(137),
    padding: scaled(16),
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    top: scaled(6),
    right: scaled(8),
    zIndex: 1,
  },
  formContainer: {
    paddingHorizontal: scaled(24),
    paddingTop: scaled(16),
  },
  button: {
    height: scaled(52),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaled(12),
  },
  changeNumber: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  codeContainer: {
    alignItems: 'center',
  },
});
