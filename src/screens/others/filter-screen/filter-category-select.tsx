import React, {useCallback, useEffect, useState} from 'react';
import {
  BackHandler,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {MainHeader, Text} from '../../../components';
import {colors, scaled} from '../../../theme';
import {localizeCategory} from '../../../i18n/display-maps';

export interface CategoryNode {
  id?: string;
  title: string;
  sub_categories?: CategoryNode[];
  [key: string]: unknown;
}

interface Props {
  visible: boolean;
  // The ads category tree (GENERAL type) — same {title, sub_categories}
  // shape the modal Picker used to receive (see getAdsCategories).
  data: CategoryNode[];
  // Close without changing the current selection (root-level back).
  onClose: () => void;
  // Fired once a leaf category is reached, with the full main→…→leaf path,
  // so FilterScreen can map it onto mainCategory/subCategory/subSubCategory.
  onSelect: (path: CategoryNode[]) => void;
  // Root-level titles to hide. تخفیف‌یاب lives in the general (GENERAL) tree
  // but has its own تخفیف‌یاب browse flow and isn't offered in the ads
  // filter (Figma "فیلتر – 1" lists 9 categories, without it).
  excludeTitles?: string[];
}

// Full-screen, step-by-step category picker matching Figma's "فیلتر – 1" /
// "فیلتر- <دسته>" list frames: each level of the tree is its own screen (red
// header + a full list of every item at that level), and drilling into a
// category pushes the next level rather than opening a nested modal card
// (which is what the old SelectAdsCategory did). Reaching a leaf commits the
// whole path back to FilterScreen. Category selection always drills to a leaf
// — ads are only ever tagged with leaf categories, so the leaf id is what the
// list query ultimately filters on (see search-screen's effectiveCategory).
export function FilterCategorySelect({
  visible,
  data,
  onClose,
  onSelect,
  excludeTitles,
}: Props) {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const [path, setPath] = useState<CategoryNode[]>([]);

  // Always (re)open at the top level.
  useEffect(() => {
    if (visible) {
      setPath([]);
    }
  }, [visible]);

  const goBackLevel = useCallback(() => {
    setPath(prev => {
      if (prev.length === 0) {
        onClose();
        return prev;
      }
      return prev.slice(0, -1);
    });
  }, [onClose]);

  // Android hardware back mirrors the header back — pop one step, or close at
  // the root — instead of unwinding the whole FilterScreen at once.
  useEffect(() => {
    if (!visible) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackLevel();
      return true;
    });
    return () => sub.remove();
  }, [visible, goBackLevel]);

  if (!visible) {
    return null;
  }

  const parent = path[path.length - 1];
  const rawLevel = parent ? parent.sub_categories || [] : data;
  const level =
    path.length === 0 && excludeTitles?.length
      ? rawLevel.filter(
          item => !excludeTitles.some(ex => (item.title || '').includes(ex)),
        )
      : rawLevel;

  const onPressItem = (item: CategoryNode) => {
    const nextPath = [...path, item];
    if ((item.sub_categories?.length ?? 0) > 0) {
      setPath(nextPath);
    } else {
      onSelect(nextPath);
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Same red app header as the FilterScreen it covers; the title is the
          current parent ("استخدامی", "املاک", …) at deeper levels and
          "فیلتر" at the root, matching the Figma frames. */}
      <MainHeader
        title={parent ? localizeCategory(parent.title) : t('filter.title')}
        showBack
        onBack={goBackLevel}
      />
      <FlatList
        data={level}
        keyExtractor={(item, index) => String(item.id ?? item.title ?? index)}
        contentContainerStyle={{
          padding: scaled(16),
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        // "همه موارد" heads every level (Figma frames omit it, but it's
        // needed so the user can filter by a whole branch — or, at the root,
        // clear the category entirely). It commits the current parent chain
        // (`path`) as-is instead of drilling deeper: [] at the root (no
        // category), [استخدامی] one level in, and so on. The ads query then
        // expands a non-leaf pick to all of its leaf ids (see search-screen).
        ListHeaderComponent={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSelect(path)}
            style={[styles.card, styles.allCard]}>
            <Text size={15} preset="bold" style={styles.allText}>
              {t('common.allItems')}
            </Text>
          </TouchableOpacity>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPressItem(item)}
            style={styles.card}>
            <Ionicons
              name="chevron-back"
              size={scaled(18)}
              color={colors.pallete.gray2}
            />
            <Text size={15} style={styles.cardText}>
              {localizeCategory(item.title)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 20,
    elevation: 20,
  },
  // The base layout direction is pinned left-to-right (AppDelegate.mm /
  // MainActivity.java) and the app reverses individual rows where it wants
  // them right-to-left, so a plain 'row' keeps the chevron on the left and
  // lets the right-aligned title fill the rest, exactly like Figma.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scaled(52),
    marginBottom: scaled(6),
    paddingHorizontal: scaled(16),
    borderRadius: scaled(6),
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#F2F2F2',
  },
  cardText: {
    flex: 1,
    textAlign: 'right',
  },
  // Distinguished from the drill-in category cards: a red tint + no chevron,
  // to read as "select everything here" rather than "go deeper".
  allCard: {
    borderColor: colors.pallete.lightRed,
    backgroundColor: '#FDECEC',
  },
  allText: {
    flex: 1,
    textAlign: 'right',
    color: colors.main,
  },
});
