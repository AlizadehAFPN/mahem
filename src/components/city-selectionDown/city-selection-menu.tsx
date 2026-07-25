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
import {useDispatch, useSelector} from 'react-redux';
import {useMutation, useQueryClient} from 'react-query';
import {RootState} from '../../stateManager';
import {setUserCity} from '../../stateManager/reducers/user';
import {setFilters} from '../../stateManager/reducers/filters';
import {updateUser} from '../../services';
import {useCities, CITIES_QUERY_KEY} from '../../hooks/use-cached-cities';
import {ATTRIBUTE_OPTIONS_QUERY_KEY} from '../../hooks/use-cached-attribute-options';
import {
  ADS_CATEGORIES_QUERY_KEY,
  JOB_CATEGORIES_QUERY_KEY,
} from '../../hooks/use-cached-categories';
import {Text} from '../text/text';
import {colors} from '../../theme';
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
  const {data} = useCities();
  const cachedCategories = useSelector((s: RootState) => s.categories);
  const cachedAttributeOptions = useSelector(
    (s: RootState) => s.attributeOptions,
  );
  const cachedCities = useSelector((s: RootState) => s.cities);
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
    // categories/attribute-options/cities aren't city-scoped — re-prime them
    // from the persisted copy right away so the clear() above doesn't undo
    // the whole point of *SyncBridge (every screen would otherwise cold-fetch
    // them again the moment it next renders).
    if (cachedCategories.adsCategories) {
      queryClient.setQueryData(ADS_CATEGORIES_QUERY_KEY, {
        data: cachedCategories.adsCategories,
      });
    }
    if (cachedCategories.jobCategories) {
      queryClient.setQueryData(JOB_CATEGORIES_QUERY_KEY, {
        data: cachedCategories.jobCategories,
      });
    }
    if (cachedAttributeOptions.optionsByGroup) {
      queryClient.setQueryData(
        ATTRIBUTE_OPTIONS_QUERY_KEY,
        cachedAttributeOptions.optionsByGroup,
      );
    }
    if (cachedCities.cities) {
      queryClient.setQueryData(CITIES_QUERY_KEY, {data: cachedCities.cities});
    }
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
              <Text>{localizeCity(item.title)}</Text>
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
