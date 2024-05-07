import {
  View,
  StyleSheet,
  Image,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {CitySelectionMenu, Row, Text} from '../';
import {colors} from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {RootState} from '../../stateManager';

interface Header {
  showLocation?: boolean;
  title: string;
  showNews?: boolean;
}
export function MainHeader({showLocation, title, showNews}: Header) {
  const user = useSelector((s: RootState) => s.user);
  const [state, setState] = useState({
    modalVisible: false,
  });
  const toggleModalVisible = () => {
    setState(s => ({...s, modalVisible: !s.modalVisible}));
  };
  const {navigate} = useNavigation();

  return (
    <Row style={styles.container}>
      <Row style={{alignItems: 'flex-end'}}>
        <Image source={require('../../assets/images/logo.png')} />
        <Text
          size={15}
          style={{fontWeight: 'bold', paddingHorizontal: 8}}
          color="white">
          {title}
        </Text>
        {showNews && (
          <TouchableOpacity onPress={() => navigate('notif' as never)}>
            <FontAwesome color={'black'} name="envelope-o" size={24} />
          </TouchableOpacity>
        )}
      </Row>

      {showLocation ? (
        <TouchableOpacity onPress={toggleModalVisible}>
          <Row style={{alignItems: 'flex-end'}}>
            <Text color="white">{user.city}</Text>
            <Ionicons color={'white'} name="location" size={30} />
          </Row>
          <CitySelectionMenu
            onClose={toggleModalVisible}
            visible={state.modalVisible}
          />
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </Row>
  );
}
const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: colors.main,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});
