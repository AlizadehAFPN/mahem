import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {CityPicker, MainHeader, Screen, Text} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
// import {Switch} from 'react-native-switch';
import {useLanguage} from '../../../Context/LanguageContext';
import {useMutation} from 'react-query';
import {logout, updateUser} from '../../../services';
import {removeUser, setUserCity} from '../../../stateManager/reducers/user';
import {RootState} from '../../../stateManager';

export function Settings() {
  const {goBack} = useNavigation();
  const dispatch = useDispatch();
  const [isPersian, setIsPersian] = useState(true);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const {translate, changeLanguage, language} = useLanguage();
  const toggleSwitch = () => {
    setIsPersian(previousState => !previousState);
    if (isPersian) {
      changeLanguage('en');
    } else {
      changeLanguage('fa');
    }
  };
  const user = useSelector((s: RootState) => s.user);
  const {navigate} = useNavigation();

  const {mutate} = useMutation(updateUser);

  const onSelectCity = (item: any) => {
    mutate(
      {city_id: item.id},
      {
        onSuccess: () => {},
      },
    );
    dispatch(setUserCity({city: item.title, cityId: item.id}));
    setCityModalVisible(false);
  };
  const onExit = () => {
    // Revoke the refresh token server-side first (best-effort — a network
    // failure here shouldn't block the user from signing out locally).
    logout().catch(() => {});
    // Clearing the token flips RootNavigator from AppStack to AuthStack
    // reactively — an explicit reset() would target 'register' inside the
    // wrong stack now that navigation is split into Auth/Onboarding/App.
    dispatch(removeUser());
  };

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title={translate('settings.title')} showBack />
      <View
        style={{
          width: '100%',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          flexDirection: 'row',
          marginTop: 8,
        }}>
        <View
          style={{
            paddingHorizontal: 4,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={!isPersian ? 'green' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            value={!isPersian}
            onValueChange={toggleSwitch}
          />
          <Text style={{marginHorizontal: 8}}>English</Text>
        </View>

        <View
          style={{
            paddingHorizontal: 4,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isPersian ? 'green' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            value={isPersian}
            onValueChange={toggleSwitch}
          />
          <Text style={{marginHorizontal: 8}}>
            {isPersian ? translate('settings.persian') : translate('settings.english')}
          </Text>
        </View>
      </View>

      <View style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{textAlign: 'right', fontSize: 22}}>
          {translate('settings.chooseCity')}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setCityModalVisible(true)}
        style={{
          borderBottomWidth: 1,
          borderColor: colors.pallete.gray2,
          width: '85%',
          alignSelf: 'center',
          paddingVertical: 8,
        }}>
        <Text style={{textAlign: 'center'}}>
          {user?.city || translate('settings.chooseCity')}
        </Text>
      </TouchableOpacity>
      <CityPicker
        visible={cityModalVisible}
        onClose={() => setCityModalVisible(false)}
        onSelect={onSelectCity}
      />

      <TouchableOpacity
        onPress={() => navigate('editProfile' as never)}
        style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{fontSize: 16}}>
          {translate('settings.editProfile')} ({user?.username})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            'https://cafebazaar.ir/app/com.turner.asmajormayhem?l=en',
          )
        }
        style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{fontSize: 16}}>{translate('settings.rateMahem')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onExit}
        style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{fontSize: 16}}>{translate('settings.exit')}</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    backgroundColor: colors.pallete.gray1,
    marginHorizontal: 2,
  },
  Button: {
    flex: undefined,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.main,
  },
});
