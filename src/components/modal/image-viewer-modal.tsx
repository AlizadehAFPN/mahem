import {
  ActivityIndicator,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {scaled} from '../../theme';

interface ImageViewerModalProps {
  visible: boolean;
  uri?: string | null;
  onClose: () => void;
}

// Full-screen viewer for a single image — what tapping an image message in the
// chat opens. `contain` rather than `cover`: the thumbnail in the thread is the
// cropped view, this one is meant to show the whole photo.
//
// The close button is pinned top-left with an explicit `left` (not
// alignSelf/flex-start) because the app runs with RTL forced, which would
// otherwise flip it to the side the status-bar clock occupies.
export function ImageViewerModal({
  visible,
  uri,
  onClose,
}: ImageViewerModalProps) {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  // Each open is a fresh load, and reopening the same uri reuses this
  // component instance — so the spinner has to be re-armed here rather than
  // relying on onLoadStart, which a cached image may never fire.
  useEffect(() => {
    if (visible) {
      setLoading(true);
    }
  }, [visible, uri]);

  return (
    <Modal
      visible={visible && !!uri}
      transparent={false}
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View style={styles.container}>
        {!!uri && (
          <Image
            style={styles.image}
            source={{uri}}
            resizeMode="contain"
            onLoadEnd={() => setLoading(false)}
          />
        )}
        {loading && (
          <ActivityIndicator
            style={styles.spinner}
            color="white"
            size="large"
          />
        )}
        <Button
          onPress={onClose}
          style={{...styles.closeButton, top: insets.top + 12}}>
          <MaterialCommunityIcons
            name="close"
            size={scaled(22)}
            color="white"
          />
          <Text size={15} color="white" style={styles.closeLabel}>
            {t('common.close')}
          </Text>
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  spinner: {
    position: 'absolute',
  },
  closeButton: {
    position: 'absolute',
    left: scaled(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaled(8),
    paddingHorizontal: scaled(14),
    borderRadius: scaled(20),
    backgroundColor: 'rgba(0,0,0,.55)',
  },
  closeLabel: {
    marginLeft: scaled(6),
  },
});
