import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
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
  // Optional display-only localizer for each row's label (e.g. localizeOption
  // for backend option values). The stored value passed to onSelect stays the
  // canonical (Persian) `item`, so only what the user sees is translated.
  localizeLabel?: (value: string) => string;
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
  allItemsLabel,
  localizeLabel,
}: PickerProps) {
  const {t} = useTranslation();
  const [path, setPath] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const displayLabel = (value: any) =>
    localizeLabel ? localizeLabel(String(value ?? '')) : value;

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
          String(displayLabel(item[labelField]) ?? '')
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
            placeholder={t('common.search')}
          />
        )}
        <FlatList
          data={visibleItems || []}
          keyExtractor={(item, index) => String(item?.[valueField] ?? index)}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => onPressItem(item)}
              style={styles.item}>
              <Text size={14}>{displayLabel(item[labelField])}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            allowSelectParent && !query ? (
              <TouchableOpacity onPress={onSelectAll} style={styles.item}>
                <Text preset="bold">{allItemsLabel ?? t('common.allItems')}</Text>
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
    borderRadius: 10,
    marginBottom: 4,
    borderColor: colors.pallete.gray2,
    paddingHorizontal: 12,
    paddingTop: 16,
    backgroundColor: colors.pallete.gray1,
    maxHeight: height * 0.75,
  },
  title: {
    textAlign: 'center',
    paddingBottom: 8,
  },
  item: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.pallete.gray3,
  },
});
