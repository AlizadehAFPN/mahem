import {
  FlatList,
  Image,
  NativeModules,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  CitySelectModal,
  CitySelectionMenu,
  MainHeader,
  Screen,
  Text,
} from '../../../components';
import {colors} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
// import {Switch} from 'react-native-switch';
import DropDownPicker from 'react-native-dropdown-picker';
import {useLanguage} from '../../../Context/LanguageContext';
import {useMutation, useQuery} from 'react-query';
import {getCities, updateUser} from '../../../services';
import {removeUser, setUserCity} from '../../../stateManager/reducers/user';
import {RootState} from '../../../stateManager';
import {Dropdown} from 'react-native-element-dropdown';

export function Settings() {
  const {goBack} = useNavigation();
  const dispatch = useDispatch();
  const [isPersian, setIsPersian] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const {translate, changeLanguage, language} = useLanguage();
  const toggleModalVisible = () => {
    setModalVisible(!modalVisible);
  };
  const toggleSwitch = () => {
    setIsPersian(previousState => !previousState);
    if (isPersian) changeLanguage('en');
    else changeLanguage('fa');
  };
  const user = useSelector((s: RootState) => s.user);
  const {navigate} = useNavigation();

  const {mutate} = useMutation(updateUser);
  const [value, setValue] = useState(user?.city);

  const {data} = useQuery(['cities'], getCities);

  const onSelectCity = (item: any) => {
    const myData = {city_id: item.id};
    mutate(myData, {
      onSuccess: () => {},
    });
    dispatch(setUserCity({city: item.title, cityId: item.id}));
  };
  const onExit = () => {
    dispatch(removeUser());
    setTimeout(() => {
      NativeModules.DevSettings.reload();
    }, 200);
  };

  return (
    <Screen withoutScroll style={{flex: 1}}>
      <MainHeader title={translate('setting')} />
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
          <Text style={{marginHorizontal: 8}}>فارسی</Text>
        </View>
      </View>

      <View style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{textAlign: 'right', fontSize: 22}}>
          {translate('chooseCity')}
        </Text>
      </View>
      <Dropdown
        data={data?.data || []}
        maxHeight={300}
        labelField="title"
        valueField="id"
        style={{
          borderBottomWidth: 1,
          borderColor: 'red',
          width: '85%',
          alignSelf: 'center',
        }}
        itemContainerStyle={{backgroundColor: '#EEEEEE'}}
        placeholder={user?.city}
        value={value}
        onChange={item => {
          console.log(item, '000');
          onSelectCity(item);
        }}
      />

      <TouchableOpacity
        onPress={() => navigate('editProfile' as never)}
        style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{fontSize: 16}}>
          {translate('editProfile')} ({user?.username})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{fontSize: 16}}>{translate('rateMahem')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onExit}
        style={{marginTop: 32, paddingHorizontal: 16}}>
        <Text style={{fontSize: 16}}>{translate('exit')}</Text>
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
