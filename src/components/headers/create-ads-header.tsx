import {StyleSheet, View, BackHandler} from 'react-native';
import React, {useEffect} from 'react';
import {Row, Button, Text, Divider, AdsImageSelection} from '../';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
export function CreateAdsHeader({onCreatePress, onSelectImage, onBack}: any) {
  const {goBack} = useNavigation();
  const handleBack = () => {
    if (onBack) {
      onBack();
      return true;
    }
    goBack();
    return true;
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );

    return () => subscription.remove();
  }, []);
  return (
    <View style={styles.continer}>
      <Row
        style={{
          justifyContent: 'space-between',
          paddingHorizontal: 8,
          paddingBottom: 4,
        }}>
        <Button onPress={handleBack}>
          <Row>
            <MaterialIcons
              color="white"
              size={25}
              name="keyboard-arrow-right"
            />
            <Text color="white" size={17}>
              ثبت رایگان آگهی
            </Text>
          </Row>
        </Button>
        <Button onPress={onCreatePress}>
          <Row>
            <Text size={15} color="white">
              ارسال
            </Text>
            <Feather color="white" name="check" size={20} />
          </Row>
        </Button>
      </Row>
      <LinearGradient
        style={{height: 1, width: '100%'}}
        colors={[colors.main, 'white', 'white', 'white', colors.main]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}></LinearGradient>
      <Divider height={10} />
      <Text preset="bold" size={20} style={{textAlign: 'center'}}>
        انتخاب تصویر مناسب برای آگهی
      </Text>
      <Divider height={10} />
      <Text style={{textAlign: 'center'}}>
        آگهی های شامل تصویر، بیش از ۵ برابر دیده میشوند
      </Text>
      <Divider />
      <Row style={{justifyContent: 'space-around'}}>
        {[...new Array(5)].map((item, index) => (
          <AdsImageSelection
            key={String(index + 3132)}
            onSelectImage={(image: any) => onSelectImage(image, index)}
          />
        ))}
      </Row>
      <Divider height={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  continer: {
    backgroundColor: colors.main,
  },
});
