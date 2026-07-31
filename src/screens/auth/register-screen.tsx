import {View, StyleSheet, Image, TouchableOpacity, Alert} from 'react-native';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Button,
  Checkbox,
  Divider,
  FilePickerModal,
  Screen,
  Text,
  TextField,
} from '../../components';
import {colors, scaled} from '../../theme';
import {mobileValidation} from '../../utiles';
import {
  isSupportedImageType,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
} from '../../utiles/utiles_funcs';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from 'react-query';
import {checkAvailability, requestOtp} from '../../services';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

// Backend contract for `username` on PATCH /users/me (@Length(3, 32)) —
// mirrored here so a rejected name is caught before the request instead of
// coming back as an opaque 400.
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 32;

// Where the app starts. Laid out after the «ثبت نام» frame in Figma
// (node 106:145): red instruction band, grey strip under it, and the photo
// picker as a disc straddling the two — the same construction the
// complete-profile screen uses.
//
// Sign-up and sign-in are separate screens that meet at the same OTP step. The
// backend still keys an account on the mobile number alone (`mobile @unique`,
// and verifyOtp upserts), so what actually keeps the two paths apart is the
// availability check below — without it, someone who already had an account and
// arrived here would overwrite their own saved name and photo with whatever
// they retyped.
export function RegisterScreen() {
  const {t} = useTranslation();
  const {navigate} = useNavigation<any>();
  const mobileTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const usernameTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [state, setState] = useState({
    username: '',
    mobile: '',
    pickerModal: false,
    // Carried through to code-input and uploaded only after verification —
    // uploading needs an access token, which doesn't exist yet.
    profileImage: undefined as
      | {uri?: string; fileName?: string; type?: string}
      | undefined,
    acceptedTerms: false,
    usernameError: '',
    mobileError: '',
    // Set when the availability check comes back against us. Separate from the
    // two field errors because it isn't about the shape of what was typed —
    // it's the "you already have an account" branch, and it carries the way
    // out of it.
    accountExists: false,
  });

  const trimmedUsername = state.username.trim();

  const clearBlockers = (changes: Partial<typeof state>) =>
    setState(s => ({...s, ...changes, accountExists: false}));

  // Debounced so the message appears once the user pauses, not on the first
  // character of something they're still typing.
  const onChangeUsername = (value: string) => {
    clearBlockers({username: value, usernameError: ''});
    clearTimeout(usernameTimeoutRef.current);
    usernameTimeoutRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed.length > 0 && trimmed.length < USERNAME_MIN_LENGTH) {
        setState(s => ({
          ...s,
          usernameError: t('auth.usernameLengthError', {
            min: USERNAME_MIN_LENGTH,
          }),
        }));
      }
    }, 500);
  };

  const onChangeMobile = (value: string) => {
    clearBlockers({mobile: value, mobileError: ''});
    clearTimeout(mobileTimeoutRef.current);
    mobileTimeoutRef.current = setTimeout(() => {
      if (value && !mobileValidation(value)) {
        setState(s => ({...s, mobileError: t('auth.mobileError')}));
      }
    }, 500);
  };

  const onSelectAvatar = (file: {
    fileName?: string;
    type?: string;
    uri?: string;
  }) => {
    if (!isSupportedImageType(file.type)) {
      Alert.alert(
        t('common.imageFormatUnsupported'),
        UNSUPPORTED_IMAGE_TYPE_MESSAGE(),
      );
      return;
    }
    setState(s => ({...s, profileImage: file}));
  };

  const {mutateAsync: checkAvailabilityAsync, isLoading: isChecking} =
    useMutation(checkAvailability);
  const {mutateAsync: requestOtpAsync, isLoading: isRequesting} =
    useMutation(requestOtp);

  const isUsernameValid =
    trimmedUsername.length >= USERNAME_MIN_LENGTH &&
    trimmedUsername.length <= USERNAME_MAX_LENGTH;
  const canSubmit =
    isUsernameValid &&
    mobileValidation(state.mobile) &&
    state.acceptedTerms &&
    !isChecking &&
    !isRequesting;

  // mutateAsync + await rather than nested onSuccess callbacks: this screen
  // stays mounted throughout (navigate() pushes onto the same stack), but the
  // two calls are strictly sequential — no SMS is sent until the number is
  // known to be free.
  const onPressRegister = async () => {
    if (!canSubmit) {
      return;
    }
    try {
      const {mobileTaken, usernameTaken} = await checkAvailabilityAsync({
        mobile: state.mobile,
        username: trimmedUsername,
      });
      if (mobileTaken || usernameTaken) {
        setState(s => ({
          ...s,
          accountExists: true,
          mobileError: mobileTaken ? t('auth.mobileTaken') : '',
          usernameError: usernameTaken ? t('auth.usernameTaken') : '',
        }));
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
        // Saved onto the account by sendActivationCode, once verification has
        // produced a token to save them with.
        username: trimmedUsername,
        profileImage: state.profileImage,
        // Only present while the backend runs with OTP_MOCK=true; the code
        // screen shows it so the flow is testable without SMS.
        otpCode: response?.code,
      });
    } catch {
      setState(s => ({...s, mobileError: t('auth.codeGenericError')}));
    }
  };

  return (
    <Screen statusbarBackgroundColor={colors.main}>
      <View style={styles.topColor}>
        <Text size={20} color="white" style={styles.intro}>
          {t('auth.registerIntro')}
        </Text>
      </View>
      {/* The disc is a child of the grey strip and pulled up out of it, so it
          sits across the boundary exactly as drawn — 49 of its 94 in the red,
          the rest in the grey. */}
      <View style={styles.grayCard}>
        <TouchableOpacity
          onPress={() => setState(s => ({...s, pickerModal: true}))}
          style={styles.cameraButton}>
          {state.profileImage?.uri ? (
            <Image
              source={{uri: state.profileImage.uri}}
              style={styles.avatar}
            />
          ) : (
            /* 56 of the disc's 94, the proportion the glyph has in Figma. */
            <SimpleLineIcons name="camera" color="black" size={scaled(56)} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextField
          style={styles.input}
          // Passed as the prop rather than in `style`, because TextField's own
          // borderColor (focused red / error red / this) is applied after the
          // style override and would otherwise win.
          borderColor="black"
          labelStyle={styles.inputLabel}
          label={t('auth.username')}
          maxLength={USERNAME_MAX_LENGTH}
          error={state.usernameError}
          // The reserved slot is also the gap to the field below: without it
          // the second field, the button and everything under them jump down
          // the moment a name is rejected.
          reserveErrorSpace
          onChangeText={onChangeUsername}
        />
        <TextField
          style={styles.input}
          // Passed as the prop rather than in `style`, because TextField's own
          // borderColor (focused red / error red / this) is applied after the
          // style override and would otherwise win.
          borderColor="black"
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          label={t('auth.mobile')}
          placeholder={t('auth.mobilePlaceholder')}
          phoneNumber
          inputMode="tel"
          maxLength={11}
          error={state.mobileError}
          reserveErrorSpace
          onChangeText={onChangeMobile}
        />
        {/* Tapping the label opens the rules themselves and the box beside it
            is the acceptance — the same split the ad and job forms use. */}
        <Checkbox
          value={state.acceptedTerms}
          onToggle={value => clearBlockers({acceptedTerms: value})}
          onTextPress={() => navigate('privacy' as never)}
          text={t('auth.acceptTerms')}
          labelStyle={styles.termsLabel}
          multiline
        />
        {/* The "you already have an account" branch: the message says what
            happened, and the sign-in screen is one tap from it. */}
        {state.accountExists && (
          <>
            <Divider height={14} />
            <View style={styles.notice}>
              <Text size={15} color={colors.error} style={styles.noticeText}>
                {t('auth.accountExists')}
              </Text>
              <Divider height={8} />
              <TouchableOpacity onPress={() => navigate('login' as never)}>
                <Text size={15} color={colors.main} style={styles.noticeAction}>
                  {t('auth.goToLogin')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <Divider height={16} />
        <Button
          loading={isChecking || isRequesting}
          disabled={!canSubmit}
          onPress={onPressRegister}
          style={{
            ...styles.cta,
            backgroundColor: canSubmit ? colors.main : colors.pallete.gray1,
            borderColor: canSubmit ? colors.main : colors.pallete.gray2,
          }}>
          <Text color={canSubmit ? 'white' : 'black'} size={20}>
            {t('auth.registerAction')}
          </Text>
        </Button>
        <Divider height={22} />
        <TouchableOpacity onPress={() => navigate('login' as never)}>
          <Text
            size={15}
            color={colors.pallete.grayText}
            style={styles.altPath}>
            {t('auth.alreadyRegistered')}{' '}
            <Text size={15} color={colors.main} style={styles.altPathAction}>
              {t('auth.loginAction')}
            </Text>
          </Text>
        </TouchableOpacity>
        <Divider height={24} />
      </View>

      <FilePickerModal
        onSelectFile={onSelectAvatar}
        visible={state.pickerModal}
        handleClose={() => setState(s => ({...s, pickerModal: false}))}
      />
    </Screen>
  );
}

// Figma node 106:145 — red band 137 tall, grey strip 51, disc 94 across the
// join, fields inset 21 from each edge, button 191 of 360 wide (kept as a share
// of the width so it stays centred and proportionate on wider phones).
const CAMERA_SIZE = scaled(94);
const GRAY_STRIP_HEIGHT = scaled(51);
const CAMERA_OVERLAP = scaled(49);

const styles = StyleSheet.create({
  topColor: {
    backgroundColor: colors.main,
    height: scaled(137),
    paddingHorizontal: scaled(16),
    paddingTop: scaled(25),
  },
  intro: {
    textAlign: 'justify',
    lineHeight: scaled(32),
  },
  grayCard: {
    backgroundColor: colors.pallete.gray1,
    height: GRAY_STRIP_HEIGHT,
    alignItems: 'center',
  },
  cameraButton: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: colors.pallete.gray1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -CAMERA_OVERLAP,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
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
  termsLabel: {
    fontSize: scaled(15),
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
});
