import {Alert, View, StyleSheet, TouchableOpacity, Image, Share} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Button,
  Divider,
  FilePickerModal,
  Screen,
  Text,
  TextField,
} from '../../../components';
import {colors} from '../../../theme';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation} from 'react-query';
import {updateUser, upload} from '../../../services';
import {RootState} from '../../../stateManager';
import {setUser} from '../../../stateManager/reducers/user';
import {
  isSupportedImageType,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
} from '../../../utiles/utiles_funcs';

export function EditProfile() {
  const {t} = useTranslation();
  const user = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();

  const {goBack} = useNavigation();
  const [state, setState] = useState({
    username: user?.username,
    pickerModal: false,
    profileImage: undefined as {uri?: string} | undefined,
    uploadedAvatar: user?.avatar,
    usernameError: '',
  });

  const handleChangeText = (value: string, label: string) => {
    setState(s => ({...s, [label]: value}));
  };

  const {mutate: uploadMutate, isLoading: isUploading} = useMutation(upload);
  const onSelectAvatar = (file: {fileName: any; type: any; uri: any}) => {
    if (!isSupportedImageType(file.type)) {
      Alert.alert(
        t('common.imageFormatUnsupported'),
        UNSUPPORTED_IMAGE_TYPE_MESSAGE(),
      );
      return;
    }
    setState(s => ({...s, profileImage: file}));
    const {fileName, type, uri} = file;
    const form = new FormData();
    form.append('file', {name: fileName, type, uri} as any);
    uploadMutate(form, {
      onSuccess: data => {
        setState(s => ({...s, uploadedAvatar: data?.data?.id}));
      },
    });
  };

  const {mutate, isLoading} = useMutation(updateUser);

  const onPressEdit = () => {
    const isValid = handleValidation();
    const data = {username: state.username, avatar: state.uploadedAvatar};
    if (isValid) {
      mutate(data, {
        onSuccess: () => {
          dispatch(
            setUser({username: state.username, avatar: state.uploadedAvatar}),
          );
          goBack();
        },
      });
    }
  };
  const handleValidation = () => {
    const {username} = state;
    if (!username) {
      // setState(s => ({ ...s, usernameError: 'نام کاربری را وارد کنید' }))
      return false;
    }
    return true;
  };
  const enableButton = useCallback(handleValidation, [state.username]);
  return (
    <Screen statusbarBackgroundColor={colors.main}>
      <View style={sytles.topColor}>
        <Text preset="default" size={20} color="white">
          {t('editProfile.title')}
        </Text>
      </View>
      <View style={sytles.grayCard}>
        <TouchableOpacity
          onPress={() => setState(s => ({...s, pickerModal: true}))}
          style={sytles.cammeraButton}>
          {state?.profileImage?.uri || state?.uploadedAvatar ? (
            <Image
              source={{uri: state?.profileImage?.uri ?? state?.uploadedAvatar}}
              style={{width: '100%', height: '100%', overflow: 'hidden'}}
            />
          ) : (
            <SimpleLineIcons name="camera" color="black" size={45} />
          )}
        </TouchableOpacity>
      </View>

      <View style={sytles.formContainer}>
        <TextField
          style={{borderRadius: 8, borderColor: colors.pallete.gray2}}
          labelStyle={{color: 'black', fontSize: 17, marginTop: -5}}
          label={t('auth.username')}
          value={state?.username}
          onChangeText={text => handleChangeText(text, 'username')}
        />
        <Divider height={40} />

        <Button
          loading={isLoading}
          disabled={!enableButton() || isLoading || isUploading}
          onPress={onPressEdit}
          style={{
            ...sytles.button,
            backgroundColor: enableButton()
              ? colors.main
              : colors.pallete.gray1,
          }}>
          <Text color={enableButton() ? 'white' : 'black'} size={20}>
            {t('common.edit')}
          </Text>
        </Button>
      </View>
      <FilePickerModal
        onSelectFile={onSelectAvatar}
        visible={state.pickerModal}
        handleClose={() => setState(s => ({...s, pickerModal: false}))}
      />
    </Screen>
  );
}
const sytles = StyleSheet.create({
  topColor: {
    backgroundColor: colors.main,
    height: 137,
    padding: 16,
    alignItems: 'center',
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
  grayCard: {
    backgroundColor: colors.pallete.gray1,
    alignItems: 'center',
    paddingBottom: 10,
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
});
