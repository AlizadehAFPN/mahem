import {StyleSheet, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Row} from '../row/row';
import {Button} from '../button/button';
import {Text} from '../text/text';
import {colors, normalFont} from '../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export function MessageSender({onPressButton}: any) {
  const {t} = useTranslation();
  const [text, setText] = useState('');
  // console.log(text, 'text');
  return (
    <Row
      style={{
        paddingHorizontal: 10,
        alignItems: 'flex-end',
        paddingBottom: 10,
      }}>
      <Button
        onPress={() => {
          onPressButton(text);
          setText('');
        }}>
        <Row style={{paddingBottom: 5}}>
          <Text size={17} color={colors.pallete.green}>
            {t('common.send')}
          </Text>
          <View style={{width: 8}} />
          <MaterialCommunityIcons
            name="message-text-outline"
            size={25}
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
      {/* <Button style={{paddingBottom: 5}} >
        <Entypo
          color={colors.pallete.gray2}
          size={25}
          style={{transform: [{rotate: '180deg'}]}}
          name="attachment"
        />
      </Button> */}
    </Row>
  );
}

const styles = StyleSheet.create({
  textinput: {
    flex: 1,
    fontFamily: normalFont,
    textAlign: 'right',
    marginHorizontal: 15,
    maxHeight: 200,
    borderBottomWidth: 1,
    fontSize: 20,
    borderColor: colors.pallete.green,
  },
});
