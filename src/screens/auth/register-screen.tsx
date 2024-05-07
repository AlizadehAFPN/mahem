import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Button,
  Divider,
  FilePickerModal,
  Screen,
  Text,
  TextField,
} from '../../components';
import {colors} from '../../theme';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {mobileValidation} from '../../utiles';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {setUser} from '../../stateManager/reducers/user';
import {useMutation} from 'react-query';
import {register} from '../../services';

export function RegisterScreen() {
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();
  const {navigate} = useNavigation();
  const [state, setState] = useState({
    mobile: '',
    username: '',
    pickerModal: false,
    profileImage: undefined,
    mobileError: '',
    usernameError: '',
  });

  const handleChangeText = (value, label) => {
    setState(s => ({...s, [label]: value, [`${label}Error`]: ''}));
  };

  useEffect(() => {
    if (state.mobile) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!mobileValidation(state.mobile)) {
          setState(s => ({
            ...s,
            mobileError: 'شماره موبایل خود را به درستی وارد کنید!',
          }));
        }
      }, 500);
    }
  }, [state.mobile]);

  const {mutate, isLoading} = useMutation(register);

  const onPressRegister = () => {
    const isValid = handleValidation();
    const data = {username: state.username, mobile: state.mobile};
    if (isValid)
      mutate(data, {
        onSuccess: data => {
          console.log(data, 'dataiiiii');
          navigate('codeInput', {mobile: state.mobile});
        },
      });
    // if(handleValidation()){
    //     dispatch(setUser({mobile: state.mobile, username: state.username}))
    //     navigate("codeInput")
    // }
  };
  const handleValidation = () => {
    const {mobile, username} = state;
    if (mobile.length < 9) {
      // setState(s => ({ ...s, mobileError: "شماره موبایل خود را وارد کنید!" }))
      return false;
    } else if (state.mobileError) {
      return false;
    } else if (!username) {
      // setState(s => ({ ...s, usernameError: 'نام کاربری را وارد کنید' }))
      return false;
    }
    return true;
  };
  const enableButton = useCallback(handleValidation, [
    state.mobile,
    state.username,
  ]);
  return (
    <Screen statusbarBackgroundColor={colors.main}>
      <View style={sytles.topColor}>
        <Text preset="default" size={20} color="white">
          برای ثبت نام کافیست شماره همراه خود را وارد نمایید تا کد فعال سازی
          برایتان ارسال شود.
        </Text>
      </View>
      <View style={sytles.grayCard}>
        <TouchableOpacity
          onPress={() => setState(s => ({...s, pickerModal: true}))}
          style={sytles.cammeraButton}>
          {state?.profileImage?.uri ? (
            <Image
              source={{uri: state?.profileImage?.uri}}
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
          label="نام کاربری"
          error={state.usernameError}
          onChangeText={text => handleChangeText(text, 'username')}
        />
        <Divider height={40} />
        <TextField
          style={{borderRadius: 8, borderColor: colors.pallete.gray2}}
          labelStyle={{color: 'black', fontSize: 17, marginTop: -5}}
          label="شماره همراه"
          inputMode="tel"
          error={state.mobileError}
          onChangeText={text => handleChangeText(text, 'mobile')}
        />
        <Divider height={80} />
        <Button
          loading={isLoading}
          disabled={!enableButton() || isLoading}
          onPress={onPressRegister}
          style={{
            ...sytles.button,
            backgroundColor: enableButton()
              ? colors.main
              : colors.pallete.gray1,
          }}>
          <Text color={enableButton() ? 'white' : 'black'} size={20}>
            ثبت نام
          </Text>
        </Button>
      </View>
      <FilePickerModal
        onSelectFile={file => setState(s => ({...s, profileImage: file}))}
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
