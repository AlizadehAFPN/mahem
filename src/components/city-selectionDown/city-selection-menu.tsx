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
import {useTranslation} from 'react-i18next';
import {ALL_CITIES_ID, setBrowseCity} from '../../stateManager/reducers/user';
import {useCities} from '../../hooks/use-cached-cities';
import {useBrowseCity} from '../../hooks/use-browse-city';
import {Text} from '../text/text';
import {colors, scaled} from '../../theme';
import {localizeCity} from '../../i18n/display-maps';

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

interface CityRow {
  id: string;
  title: string;
}

// Header's city selector — a small dropdown that opens directly below the
// city trigger (measured via `anchor`) instead of a full-width modal
// disconnected from where the user tapped.
//
// This only sets the *browse* filter (which city's listings to view), never
// the account's home/posting city — that's the Settings screen's job. Picking
// a city here dispatches setBrowseCity, so every list screen (whose queries
// key on the browse city, see useBrowseCity) re-fetches for the new city; no
// updateUser call and no full app remount. The «کل استان» row clears the city
// filter entirely, showing every city's listings.
export function CitySelectionMenu({
  visible,
  onClose,
  anchor,
}: CitySelectionMenuProps) {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const {data} = useCities();
  const {cityKey, isAllCities} = useBrowseCity();
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

  const onSelectCity = (city: CityRow) => {
    if (city.id === ALL_CITIES_ID) {
      dispatch(setBrowseCity({cityId: ALL_CITIES_ID}));
    } else {
      dispatch(setBrowseCity({cityId: city.id, cityName: city.title}));
    }
    onClose();
  };

  if (!visible || !anchor) {
    return null;
  }

  const left = Math.min(
    Math.max(8, anchor.x + anchor.width - DROPDOWN_WIDTH),
    screenWidth - DROPDOWN_WIDTH - 8,
  );

  // «کل استان» is pinned to the top so the "show everything" option is always
  // the first thing in the list, above the alphabetical cities.
  const rows: CityRow[] = [
    {id: ALL_CITIES_ID, title: t('home.allProvince')},
    ...((data?.data || []) as CityRow[]),
  ];

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
          data={rows}
          keyExtractor={item => String(item.id)}
          style={styles.list}
          renderItem={({item}) => {
            const isAllRow = item.id === ALL_CITIES_ID;
            const selected = isAllRow ? isAllCities : cityKey === item.id;
            return (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelectCity(item)}>
                <Text
                  color={selected ? colors.main : undefined}
                  style={selected ? styles.selectedText : undefined}>
                  {isAllRow ? item.title : localizeCity(item.title)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: scaled(10),
    paddingVertical: scaled(4),
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: scaled(4)},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  list: {
    maxHeight: scaled(320),
  },
  item: {
    height: scaled(44),
    justifyContent: 'center',
    paddingHorizontal: scaled(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.pallete.gray2,
  },
  selectedText: {
    fontWeight: 'bold',
  },
});
