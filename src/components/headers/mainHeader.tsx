import {
  View,
  StyleSheet,
  Image,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {
  CityAnchor,
  CitySelectionMenu,
} from '../city-selectionDown/city-selection-menu';
import {Row} from '../row/row';
import {Text} from '../text/text';
import {colors} from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {RootState} from '../../stateManager';
import {getNotifications} from '../../services';

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
  const cityTriggerRef = useRef<TouchableOpacity>(null);
  const [anchor, setAnchor] = useState<CityAnchor | null>(null);
  const toggleModalVisible = () => {
    if (state.modalVisible) {
      setState(s => ({...s, modalVisible: false}));
      return;
    }
    cityTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({x, y, width, height});
      setState(s => ({...s, modalVisible: true}));
    });
  };
  const {navigate} = useNavigation();
  const {data: notifData} = useQuery(
    ['notifications', 'unread-badge'],
    () => getNotifications({page: 1, limit: 1}),
    {enabled: !!showNews && !!user?.token, refetchInterval: 30000},
  );
  const unreadCount = notifData?.data?.unreadCount ?? 0;

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
          <TouchableOpacity
            onPress={() => navigate('notif' as never)}
            style={{alignItems: 'center'}}>
            <FontAwesome color={'black'} name="envelope-o" size={24} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text size={10} color="white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </Row>

      {showLocation ? (
        <TouchableOpacity ref={cityTriggerRef} onPress={toggleModalVisible}>
          <Row style={{alignItems: 'flex-end'}}>
            <Text color="white">{user.city}</Text>
            <Ionicons color={'white'} name="location" size={30} />
          </Row>
          <CitySelectionMenu
            onClose={toggleModalVisible}
            visible={state.modalVisible}
            anchor={anchor}
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
  badge: {
    position: 'absolute',
    top: -4,
    left: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    paddingHorizontal: 2,
    backgroundColor: colors.pallete.red2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
