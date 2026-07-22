import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {MainModal} from '../modal/mainModal';
import {colors} from '../../theme';
import {Text} from '../text/text';
import {UnderlineTextField} from '../text-field/underline-text-field';

const {height} = Dimensions.get('window');

interface PickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (...path: any[]) => void;
  data: any[];
  title?: string;
  labelField?: string;
  valueField?: string;
  getChildren?: (item: any) => any[] | undefined;
  searchable?: boolean;
  // Ad creation must always end at a leaf (every ad needs one specific
  // category), so this defaults off there. Browsing screens want the
  // opposite — the ability to stop at any level, including before picking
  // anything at all, and see everything under that branch.
  allowSelectParent?: boolean;
  allItemsLabel?: string;
}

// Shared single-select list/tree picker backing CityPicker, CategoryPicker,
// and OptionPicker — the one place this "pick from a list" interaction is
// implemented, instead of every screen/form hand-rolling its own modal.
export function Picker({
  visible,
  onClose,
  onSelect,
  data,
  title,
  labelField = 'title',
  valueField = 'id',
  getChildren,
  searchable = false,
  allowSelectParent = false,
  allItemsLabel = 'همه موارد',
}: PickerProps) {
  const [path, setPath] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) {
      setPath([]);
      setQuery('');
    }
  }, [visible]);

  const currentLevel =
    path.length === 0 ? data : getChildren?.(path[path.length - 1]) || [];
  const visibleItems =
    query && currentLevel
      ? currentLevel.filter(item =>
          String(item[labelField] ?? '')
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : currentLevel;

  const onPressItem = item => {
    const children = getChildren?.(item);
    const nextPath = [...path, item];
    if (children && children.length > 0) {
      setPath(nextPath);
      setQuery('');
    } else {
      onSelect(...nextPath);
      onClose();
    }
  };

  const onSelectAll = () => {
    onSelect(...path);
    onClose();
  };

  return (
    <MainModal onClose={onClose} visible={visible}>
      <View style={styles.card}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {searchable && (
          <UnderlineTextField
            value={query}
            onChangeText={setQuery}
            placeholder="جست‌وجو"
          />
        )}
        <FlatList
          data={visibleItems || []}
          keyExtractor={(item, index) => String(item?.[valueField] ?? index)}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => onPressItem(item)}
              style={styles.item}>
              <Text>{item[labelField]}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            allowSelectParent && !query ? (
              <TouchableOpacity onPress={onSelectAll} style={styles.item}>
                <Text preset="bold">{allItemsLabel}</Text>
              </TouchableOpacity>
            ) : null
          }
          ListFooterComponent={<View style={{height: 100}} />}
        />
      </View>
    </MainModal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 4,
    borderColor: colors.pallete.gray2,
    paddingHorizontal: 8,
    paddingTop: 16,
    backgroundColor: colors.pallete.gray1,
    maxHeight: height * 0.75,
  },
  title: {
    textAlign: 'center',
    paddingBottom: 8,
  },
  item: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
