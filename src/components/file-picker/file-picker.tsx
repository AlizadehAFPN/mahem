import React, {FunctionComponent} from 'react';
import {Modal, View, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Button} from '../button/button';
import {Divider} from '../divider/divider';
import {Row} from '../row/row';
import {Text} from '../text/text';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {colors, scaled} from '../../theme';

// Every image the app picks is uploaded over a mobile connection and then shown
// at most full-screen-width, so there is no reason to carry a phone camera's
// full resolution: an avatar picked from the gallery during sign-up arrived as
// 2.75 MB and took tens of seconds to upload on 4G. 1440px on the long edge at
// quality 0.8 lands in the low hundreds of KB and still looks sharp on a 3x
// screen — and stays well clear of the backend's 5 MB limit, which a modern
// phone photo can otherwise exceed outright.
const IMAGE_OPTIONS = {
  mediaType: 'photo',
  maxWidth: 1440,
  maxHeight: 1440,
  quality: 0.8,
} as const;

interface FilePickerModalProps {
  visible?: boolean;
  handleClose?: () => void;
  onSelectFile?: (photo: any) => void;
  multiple?: boolean;
  onPreviewImages?: () => any;
  // The picker started life as an avatar picker, hence the selfie camera by
  // default. Callers photographing something other than the user (a chat
  // attachment) ask for the rear one.
  cameraType?: 'front' | 'back';
}

export const FilePickerModal: FunctionComponent<FilePickerModalProps> = ({
  visible,
  handleClose,
  onSelectFile,
  multiple = false,
  cameraType = 'front',
}) => {
  const {t} = useTranslation();
  const lounchcamera = async () => {
    const result = await launchCamera({
      cameraType,
      ...IMAGE_OPTIONS,
    });
    if (result.assets) {
      if (multiple) {
        onSelectFile?.(result.assets);
      } else {
        onSelectFile?.(result.assets[0]);
      }
      handleClose();
    }
  };
  const lounchMedia = async () => {
    // Each call to this modal fills exactly one image slot, so the picker
    // itself should only allow a single selection — letting the user select
    // several photos here was misleading since only the first was ever used.
    const result = await launchImageLibrary({
      selectionLimit: 1,
      ...IMAGE_OPTIONS,
    });
    if (result.assets) {
      onSelectFile?.(result.assets[0]);
      handleClose();
    }
  };
  return (
    <Modal visible={visible} transparent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.background} />
      </TouchableWithoutFeedback>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <View style={styles.cart}>
          <Divider />
          <Row style={{paddingHorizontal: scaled(16)}}>
            <Button style={styles.button} onPress={lounchMedia}>
              <Text>{t('common.gallery')}</Text>
            </Button>
            <Divider style={{width: scaled(30)}} />
            <Button style={styles.button} onPress={lounchcamera}>
              <Text>{t('common.camera')}</Text>
            </Button>
          </Row>
          <Divider />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cart: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: scaled(10),
    paddingHorizontal: scaled(20),
    // borderRadius: 20,
    // borderWidth: 1,
    // borderColor: colors.pallete.gray1,
    zIndex: 100,
  },
  background: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,.8)',
    position: 'absolute',
    zIndex: -1,
  },
  button: {
    paddingHorizontal: scaled(8),
    flex: 1,
    height: scaled(37),
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaled(8),
    borderWidth: 1,
    borderColor: colors.pallete.gray2,
  },
});
