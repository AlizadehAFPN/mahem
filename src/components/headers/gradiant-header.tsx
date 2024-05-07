import {View, StyleSheet} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Button, Divider, Row, SocialShare, Text} from '../';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {colors as allColors} from '../../theme';
export function GradiantHeader({
  title,
  colors,
  details = true,
  create = false,
  onCreatePress,
  onBookMark,
  isBookmarked = false,
}) {
  const {goBack} = useNavigation();
  const onShare = () => {
    SocialShare('اپارتمان ۱۲۰ متری در گنبد کاووس');
  };
  const onBookMarkPress = () => {
    onBookMark && onBookMark();
  };
  return (
    <LinearGradient
      style={styles.container}
      colors={colors || ['#FFFFFF', '#FFFFFF']}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <Button onPress={goBack}>
        <Row>
          <MaterialIcons color="black" size={25} name="keyboard-arrow-right" />
          <Text color="black">{title}</Text>
        </Row>
      </Button>
      {details ? (
        <Row>
          <Button onPress={onShare}>
            <Octicons size={20} name="share-android" color="black" />
          </Button>
          <Divider style={{width: 5}} />
          <Button onPress={onBookMarkPress}>
            {isBookmarked ? (
              <Ionicons
                color={allColors.pallete.yellow}
                size={20}
                name="moon"
              />
            ) : (
              <Ionicons size={20} name="moon-outline" color="black" />
            )}
          </Button>
        </Row>
      ) : create ? (
        <Button onPress={onCreatePress}>
          <Row>
            <Text size={15} color="white">
              ارسال
            </Text>
            <Feather color="white" name="check" size={20} />
          </Row>
        </Button>
      ) : (
        <View />
      )}
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    height: 26,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
