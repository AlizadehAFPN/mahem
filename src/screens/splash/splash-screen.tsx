import {View, Text, Image, StyleSheet, Dimensions} from 'react-native';
import React, {useEffect} from 'react';
import {Screen} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
const {width, height} = Dimensions.get('window');
export function SplashScreen() {
  const {replace, navigate} = useNavigation();
  const user = useSelector(s => s.user);
  useEffect(() => {
    setTimeout(() => {
      if (user.mobile) {
        return replace('dashboard');
      }
      navigate('register');
    }, 2000);
  }, []);
  return (
    <Screen
      statusbarBackgroundColor="black"
      withoutScroll
      unsafe
      style={{flex: 1}}>
      <Image
        style={styles.image}
        source={require('../../assets/images/splash.png')}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  image: {
    width,
    height,
    resizeMode: 'cover',
  },
});
