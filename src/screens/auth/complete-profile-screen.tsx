import {Alert, View, StyleSheet, TouchableOpacity, Image} from 'react-native';
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
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useNavigation} from '@react-navigation/native';
import {
  isSupportedImageType,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
} from '../../utiles/utiles_funcs';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation} from 'react-query';
import {logout, updateUser, upload} from '../../services';
import {RootState} from '../../stateManager';
import {removeUser, setUser} from '../../stateManager/reducers/user';

// Backend contract for `username` on PATCH /users/me (@Length(3, 32)) —
// mirrored here so a rejected name is caught before the request instead of
// coming back as an opaque 400.
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 32;

// Shown to anyone who is authenticated but has no username yet — both brand
// new accounts and older ones whose name never saved. Unlike the old register
// screen this runs *after* verification, so there is already an access token:
// the photo uploads the moment it's picked instead of being carried through
// navigation and uploaded later.
export function CompleteProfileScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {navigate} = useNavigation<any>();
  const user = useSelector((s: RootState) => s.user);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [state, setState] = useState({
    username: '',
    pickerModal: false,
    // This is the point where the account actually comes into existence, so
    // this is where accepting the rules is an explicit tick rather than the
    // implicit "by continuing…" line on the login screen.
    acceptedTerms: false,
    // Local preview of the picked file, shown immediately while it uploads.
    profileImage: undefined as {uri?: string} | undefined,
    // The uploaded URL. Seeded from the account's existing photo so someone
    // who already has one (but no name) doesn't lose it by passing through.
    uploadedAvatar: user?.avatar,
    usernameError: '',
  });

  const trimmedUsername = state.username.trim();
  const isUsernameValid =
    trimmedUsername.length >= USERNAME_MIN_LENGTH &&
    trimmedUsername.length <= USERNAME_MAX_LENGTH;

  const handleChangeUsername = (value: string) => {
    setState(s => ({...s, username: value, usernameError: ''}));
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (
        value.trim().length > 0 &&
        value.trim().length < USERNAME_MIN_LENGTH
      ) {
        setState(s => ({
          ...s,
          usernameError: t('auth.usernameLengthError', {
            min: USERNAME_MIN_LENGTH,
          }),
        }));
      }
    }, 500);
  };

  const {mutate: uploadMutate, isLoading: isUploading} = useMutation(upload);

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
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.fileName,
      type: file.type,
    } as any);
    uploadMutate(form, {
      onSuccess: uploaded =>
        setState(s => ({...s, uploadedAvatar: uploaded?.data?.id})),
      onError: () => {
        // Drop the preview so the UI doesn't promise a photo that isn't
        // stored anywhere — the name can still be saved without it.
        setState(s => ({...s, profileImage: undefined}));
        Alert.alert(t('common.error'), t('auth.avatarUploadError'));
      },
    });
  };

  const {mutateAsync, isLoading: isSaving} = useMutation(updateUser);

  // mutateAsync + await, not fire-and-forget mutate(): the dispatch below sets
  // `username`, which moves RootNavigator on to city selection and unmounts
  // this screen — and react-query v3 drops a mutation's callbacks once its
  // observer unmounts, so a failure would otherwise pass silently and leave
  // the account without the name the user just typed.
  const onPressContinue = async () => {
    if (!isUsernameValid || !state.acceptedTerms || isUploading) {
      return;
    }
    try {
      await mutateAsync({
        username: trimmedUsername,
        avatar: state.uploadedAvatar,
      });
    } catch {
      Alert.alert(t('common.error'), t('auth.profileSaveError'));
      return;
    }
    dispatch(
      setUser({username: trimmedUsername, avatar: state.uploadedAvatar}),
    );
  };

  // Escape hatch: verification happens before this screen, so someone who
  // typed the wrong number would otherwise be authenticated as an account
  // they don't own with no way back to the login screen.
  const onPressUseAnotherNumber = () => {
    Alert.alert(t('auth.useAnotherNumber'), t('auth.useAnotherNumberBody'), [
      {text: t('common.cancel'), style: 'cancel'},
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () => {
          // Revokes the refresh token server-side; the local session is
          // cleared either way so a network failure can't trap the user.
          logout().finally(() => dispatch(removeUser()));
        },
      },
    ]);
  };

  const previewUri = state.profileImage?.uri ?? state.uploadedAvatar;
  const canContinue =
    isUsernameValid && state.acceptedTerms && !isUploading && !isSaving;

  return (
    <Screen statusbarBackgroundColor={colors.main}>
      <View style={styles.topColor}>
        <Text preset="default" size={20} color="white">
          {t('auth.completeProfileTitle')}
        </Text>
        <Text size={15} color="white" style={styles.topSubtitle}>
          {t('auth.completeProfileIntro')}
        </Text>
      </View>
      <View style={styles.grayCard}>
        <TouchableOpacity
          onPress={() => setState(s => ({...s, pickerModal: true}))}
          style={styles.cameraButton}>
          {previewUri ? (
            <Image source={{uri: previewUri}} style={styles.avatar} />
          ) : (
            <SimpleLineIcons name="camera" color="black" size={scaled(45)} />
          )}
        </TouchableOpacity>
        <Text
          size={13}
          color={colors.pallete.grayText}
          style={styles.photoHint}>
          {isUploading
            ? t('auth.avatarUploading')
            : t('auth.profilePhotoOptional')}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <TextField
          style={styles.input}
          labelStyle={styles.inputLabel}
          label={t('auth.username')}
          error={state.usernameError}
          maxLength={USERNAME_MAX_LENGTH}
          onChangeText={handleChangeUsername}
        />
        <Divider height={12} />
        <Text size={13} color={colors.pallete.grayText}>
          {t('auth.usernameHint')}
        </Text>
        <Divider height={22} />
        {/* Tapping the label opens the rules themselves and the box beside it
            is the acceptance — the same split the ad and job forms use. The
            continue button stays disabled until it's ticked. */}
        <Checkbox
          value={state.acceptedTerms}
          onToggle={value => setState(s => ({...s, acceptedTerms: value}))}
          onTextPress={() => navigate('privacy' as never)}
          text={t('auth.acceptTerms')}
          labelStyle={styles.termsLabel}
          multiline
        />
        <Divider height={22} />
        <Button
          loading={isSaving}
          disabled={!canContinue}
          onPress={onPressContinue}
          style={{
            ...styles.cta,
            backgroundColor: canContinue ? colors.main : colors.pallete.gray1,
          }}>
          <Text color={canContinue ? 'white' : colors.pallete.gray2} size={19}>
            {t('common.continue')}
          </Text>
        </Button>
        <Divider height={20} />
        <TouchableOpacity onPress={onPressUseAnotherNumber}>
          <Text
            size={14}
            color={colors.pallete.gray2}
            style={styles.secondaryAction}>
            {t('auth.useAnotherNumber')}
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

const styles = StyleSheet.create({
  topColor: {
    backgroundColor: colors.main,
    paddingHorizontal: scaled(16),
    paddingTop: scaled(20),
    paddingBottom: scaled(24),
  },
  topSubtitle: {
    marginTop: scaled(8),
    lineHeight: scaled(26),
  },
  cameraButton: {
    width: scaled(94),
    height: scaled(94),
    borderRadius: scaled(47),
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaled(-47),
    alignSelf: 'center',
    backgroundColor: colors.pallete.gray1,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  grayCard: {
    backgroundColor: colors.pallete.gray1,
    alignItems: 'center',
    paddingBottom: scaled(12),
  },
  photoHint: {
    marginTop: scaled(8),
  },
  formContainer: {
    paddingHorizontal: scaled(24),
    paddingTop: scaled(24),
  },
  input: {
    borderRadius: scaled(12),
    borderColor: colors.pallete.gray2,
  },
  inputLabel: {
    color: 'black',
    fontSize: scaled(17),
    marginTop: scaled(-5),
  },
  cta: {
    height: scaled(52),
    borderRadius: scaled(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsLabel: {
    fontSize: scaled(15),
  },
  secondaryAction: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
