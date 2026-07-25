import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from 'react-query';
import {RootState} from '../../stateManager';
import {getNotifications} from '../../services';
import {localizeCity} from '../../i18n/display-maps';

interface Header {
  showLocation?: boolean;
  title: string;
  showNews?: boolean;
  // When provided, a menu button is shown next to the city selector — used by
  // the تخفیف‌یاب screens to open the discount options bottom sheet.
  onMenuPress?: () => void;
  // When true, a back arrow is shown next to the logo — for screens reached
  // by pushing (not a tab's own root screen) that don't already have a
  // GradiantHeader of their own to carry a back button.
  showBack?: boolean;
  // Overrides the back arrow's default navigation.goBack(). Used by the
  // filter's step-by-step category screens, where "back" pops one tree level
  // (an in-screen step) rather than leaving the FilterScreen entirely.
  onBack?: () => void;
}
export function MainHeader({
  showLocation,
  title,
  showNews,
  onMenuPress,
  showBack,
  onBack,
}: Header) {
  useTranslation(); // re-render on language change so the city label localizes
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
  const {navigate, goBack} = useNavigation();
  const {data: notifData} = useQuery(
    ['notifications', 'unread-badge'],
    () => getNotifications({page: 1, limit: 1}),
    {enabled: !!showNews && !!user?.token, refetchInterval: 30000},
  );
  const unreadCount = notifData?.data?.unreadCount ?? 0;

  return (
    <Row style={styles.container}>
      <Row style={{alignItems: 'flex-end'}}>
        {showBack && (
          <TouchableOpacity
            onPress={() => (onBack ? onBack() : goBack())}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={{paddingLeft: 4}}>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={26}
              color="white"
            />
          </TouchableOpacity>
        )}
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

      <Row style={{alignItems: 'flex-end'}}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Ionicons color="white" name="options" size={26} />
          </TouchableOpacity>
        )}
        {showLocation ? (
          <TouchableOpacity ref={cityTriggerRef} onPress={toggleModalVisible}>
            <Row style={{alignItems: 'flex-end'}}>
              <Text color="white">{localizeCity(user.city)}</Text>
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
  menuButton: {
    marginLeft: 12,
    paddingBottom: 2,
  },
});
