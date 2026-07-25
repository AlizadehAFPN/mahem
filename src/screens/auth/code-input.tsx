import {View, StyleSheet} from 'react-native';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Screen,
  Text,
  CodeFields,
  Divider,
  Button,
  TextField,
} from '../../components';
import {colors} from '../../theme';
import {useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useMutation} from 'react-query';
import {sendActivationCode, updateUser, upload} from '../../services';
import {setUser} from '../../stateManager/reducers/user';

export function CodeInput() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {params} = useRoute();
  const [state, setState] = useState({
    code: '',
  });

  const {mutate, isLoading} = useMutation(sendActivationCode);
  const {mutate: uploadMutate} = useMutation(upload);
  const {mutate: updateUserMutate} = useMutation(updateUser);

  // Uploading the avatar picked on the register screen needs an access
  // token, which only exists once OTP verification succeeds — so it happens
  // here, right after login, instead of at pick time.
  const uploadProfileImageIfAny = () => {
    const profileImage = params?.profileImage;
    if (!profileImage?.uri) {
      return;
    }
    const {fileName, type, uri} = profileImage;
    const form = new FormData();
    form.append('file', {name: fileName, type, uri} as any);
    uploadMutate(form, {
      onSuccess: uploaded => {
        const avatarUrl = uploaded?.data?.id;
        updateUserMutate({avatar: avatarUrl});
        dispatch(setUser({avatar: avatarUrl}));
      },
    });
  };

  // The username typed on the register screen only reaches the backend
  // here — register()'s POST /auth/otp/request never accepts it (see
  // auth.ts), and there was previously no call anywhere that persisted it,
  // so every new account silently kept the backend's default/empty
  // username. Runs independently of uploadProfileImageIfAny() (parallel,
  // not merged into the same updateUser call) so a slow/failed avatar
  // upload can't also block the username from being saved.
  const persistUsernameIfAny = () => {
    const username = params?.username;
    if (!username) {
      return;
    }
    updateUserMutate(
      {username},
      {onSuccess: () => dispatch(setUser({username}))},
    );
  };

  const handleNext = () => {
    const isValid = handleValidation();
    if (isValid) {
      const data = {mobile: params.mobile, activation_code: state.code};
      mutate(data, {
        onSuccess: data => {
          // Setting `token` flips RootNavigator from AuthStack to
          // OnboardingStack (or AppStack, if cityId is already set)
          // reactively — no explicit navigate needed.
          dispatch(setUser(data.data));
          uploadProfileImageIfAny();
          persistUsernameIfAny();
        },
      });
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
        <Text
          style={{textAlign: 'center'}}
          preset="default"
          size={20}
          color="white">
          {t('auth.codeIntro')}
        </Text>
        {params?.otpCode ? (
          <Text
            style={{textAlign: 'center', marginTop: 8}}
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
              borderRadius: 8,
              borderColor: colors.pallete.gray2,
              width: '100%',
            }}
            labelStyle={{color: 'black', fontSize: 17, marginTop: -5}}
            label={t('auth.verificationCode')}
            inputMode="tel"
            // error={state.code}
            onChangeText={text => setState(s => ({...s, code: text}))}
            // No hard cap here: OTP_CODE_LENGTH on the backend is
            // configurable (currently 5), so a fixed maxLength would silently
            // truncate the code and make verification always fail.
            maxLength={8}
          />
        </View>
        <Divider height={100} />
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
          <Text color={enableButton() ? 'white' : 'black'} size={20}>
            {t('auth.finalConfirm')}
          </Text>
        </Button>
      </View>
    </Screen>
  );
}
const sytles = StyleSheet.create({
  topColor: {
    backgroundColor: colors.main,
    height: 137,
    padding: 16,
  },
  cammeraButton: {
    width: 94,
    height: 94,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -47,
    alignSelf: 'center',
    backgroundColor: colors.pallete.gray1,
    overflow: 'hidden',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  button: {
    height: 50,
    width: '50%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  codeContainer: {
    alignItems: 'center',
  },
});
