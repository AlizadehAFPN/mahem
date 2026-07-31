import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {colors, scaled} from '../../theme';
import {FilePickerModal} from './file-picker';
const {width} = Dimensions.get('window');
export interface AdsImageSelectionProps {
  onSelectImage?: any;
  onRemoveImage?: any;
  uploading?: any;
  initialImageUri?: any;
}

export function AdsImageSelection({
  onSelectImage,
  onRemoveImage,
  uploading,
  initialImageUri,
}: AdsImageSelectionProps) {
  // initialImageUri only matters on mount (edit mode prefilling an existing
  // remote image into this slot) — the slot's own state takes over from
  // there, same as before.
  const [state, setState] = useState(() => ({
    image: initialImageUri ? {uri: initialImageUri} : '',
    filepickerModal: false,
  }));
  const onSelectFile = (image: any) => {
    onSelectImage(image);
    setState(s => ({...s, image}));
  };
  const onRemove = () => {
    setState(s => ({...s, image: ''}));
    onRemoveImage && onRemoveImage();
  };
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setState(s => ({...s, filepickerModal: true}))}>
      <Image
        style={state.image ? {width: '100%', height: '100%'} : {}}
        source={
          state.image
            ? {uri: state.image.uri}
            : require('../../assets/images/icons/camera.png')
        }
      />
      {!!state.image && !uploading && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      )}
      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="white" />
        </View>
      )}
      <FilePickerModal
        onSelectFile={onSelectFile}
        visible={state.filepickerModal}
        handleClose={() => setState(s => ({...s, filepickerModal: false}))}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (width - 40) / 5,
    aspectRatio: 1,
    borderRadius: scaled(8),
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: scaled(20),
    height: scaled(20),
    borderRadius: scaled(10),
    backgroundColor: 'rgba(0,0,0,.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: scaled(14),
    lineHeight: scaled(16),
  },
});
