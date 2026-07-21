import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {setUserCity} from '../../stateManager/reducers/user';
import {setFilters} from '../../stateManager/reducers/filters';
import {getCities, updateUser} from '../../services';
import {Text} from '../text/text';
import {colors} from '../../theme';

const {width: screenWidth} = Dimensions.get('window');
const DROPDOWN_WIDTH = Math.min(220, screenWidth * 0.6);

export interface CityAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CitySelectionMenuProps {
  visible: boolean;
  onClose: () => void;
  anchor: CityAnchor | null;
}

// Header's city selector — a small dropdown that opens directly below the
// city trigger (measured via `anchor`) instead of a full-width modal
// disconnected from where the user tapped.
export function CitySelectionMenu({
  visible,
  onClose,
  anchor,
}: CitySelectionMenuProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const {mutate} = useMutation(updateUser);
  const {data} = useQuery(['cities'], getCities, {enabled: visible});
  const translateY = useRef(new Animated.Value(-12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(-12);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const onSelectCity = (city: {id: string; title: string}) => {
    mutate({city_id: city.id}, {onSuccess: () => {}});
    // Wipe every cached query so the freshly-remounted app (RootNavigator
    // keys the app stack on cityId) pulls ads/banners/splash/etc. fresh
    // from the server for the new city instead of a stale previous-city
    // cache lingering around.
    queryClient.clear();
    dispatch(setUserCity({city: city.title, cityId: city.id}));
    dispatch(setFilters({city: undefined}));
    onClose();
  };

  if (!visible || !anchor) {
    return null;
  }

  const left = Math.min(
    Math.max(8, anchor.x + anchor.width - DROPDOWN_WIDTH),
    screenWidth - DROPDOWN_WIDTH - 8,
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.dropdown,
          {
            top: anchor.y + anchor.height + 6,
            left,
            width: DROPDOWN_WIDTH,
            opacity,
            transform: [{translateY}],
          },
        ]}>
        <FlatList
          data={data?.data || []}
          keyExtractor={item => String(item.id)}
          style={styles.list}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelectCity(item)}>
              <Text>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  list: {
    maxHeight: 320,
  },
  item: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.pallete.gray2,
  },
});
