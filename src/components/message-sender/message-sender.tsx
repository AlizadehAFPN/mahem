import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Row} from '../row/row';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {colors, normalFont, scaled} from '../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {FilePickerModal} from '../file-picker/file-picker';

interface MessageSenderProps {
  onPressButton: (text: string) => void;
  // Called with the picked photo (a {uri, fileName, type} picker ref) — the
  // screen owns the upload, because it also owns the socket the message goes
  // out on. Omitted, the attach button isn't rendered at all.
  onSelectImage?: (image: any) => void;
  // True while that upload is in flight: the paperclip becomes a spinner so a
  // second photo can't be queued on top of the first.
  uploadingImage?: boolean;
}

export function MessageSender({
  onPressButton,
  onSelectImage,
  uploadingImage,
}: MessageSenderProps) {
  const {t} = useTranslation();
  const [text, setText] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <Row
      style={{
        paddingHorizontal: scaled(10),
        alignItems: 'flex-end',
        paddingBottom: scaled(10),
      }}>
      <Button
        onPress={() => {
          onPressButton(text);
          setText('');
        }}>
        <Row style={{paddingBottom: scaled(5)}}>
          <Text size={17} color={colors.pallete.green}>
            {t('common.send')}
          </Text>
          <View style={{width: scaled(8)}} />
          <MaterialCommunityIcons
            name="message-text-outline"
            size={scaled(25)}
            color={colors.pallete.green1}
          />
        </Row>
      </Button>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder={t('chat.inputPlaceholder')}
        style={styles.textinput}
      />
      {/* RTL is forced app-wide, so this last child lands at the far left of
          the row — where the design puts the paperclip. */}
      {!!onSelectImage && (
        <TouchableOpacity
          style={styles.attachButton}
          disabled={uploadingImage}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel={t('chat.attachImage')}
          onPress={() => setPickerVisible(true)}>
          {uploadingImage ? (
            <ActivityIndicator size="small" color={colors.pallete.green} />
          ) : (
            <Entypo
              color={colors.pallete.gray2}
              size={scaled(25)}
              style={{transform: [{rotate: '180deg'}]}}
              name="attachment"
            />
          )}
        </TouchableOpacity>
      )}
      <FilePickerModal
        visible={pickerVisible}
        cameraType="back"
        handleClose={() => setPickerVisible(false)}
        onSelectFile={image => onSelectImage?.(image)}
      />
    </Row>
  );
}

const styles = StyleSheet.create({
  textinput: {
    flex: 1,
    fontFamily: normalFont,
    textAlign: 'right',
    marginHorizontal: scaled(15),
    maxHeight: scaled(200),
    borderBottomWidth: 1,
    fontSize: scaled(20),
    borderColor: colors.pallete.green,
  },
  attachButton: {
    // Fixed box so swapping the paperclip for the spinner mid-upload doesn't
    // resize the input next to it.
    width: scaled(25),
    height: scaled(30),
    paddingBottom: scaled(5),
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
