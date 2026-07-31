import React, {FunctionComponent, useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  // StyleSheet,
  Dimensions,
  Keyboard,
  Platform,
  // Platform,
} from 'react-native';
import {colors, scaled} from '../../theme';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';

// The «ثبت آگهی» button is a circle pulled up out of the bar so it straddles
// its top edge — half sunk into the bar, the lifted part floating free above
// it and over whatever the screen behind it ends with.
const CREATE_BUTTON_SIZE = scaled(73);
const CREATE_BUTTON_LIFT = scaled(40);
// How far a scrollable tab screen has to pad the bottom of its content for its
// last row to clear that floating part: the lift itself, plus enough room that
// the row isn't left sitting flush against the circle.
export const TAB_BAR_BUTTON_CLEARANCE = CREATE_BUTTON_LIFT + scaled(16);

// React Navigation's `tabBarHideOnKeyboard` option lives inside its default
// bottom-tab bar, so a custom `tabBar` like this one has to duck out of the way
// itself. Without it, Android's adjustResize parks the whole bar — «+» button
// and all — right on top of the open keyboard, stealing the room a form (ثبت
// آگهی) needs while it's being filled in.
function useKeyboardShown() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const isIos = Platform.OS === 'ios';
    const subscriptions = [
      Keyboard.addListener(isIos ? 'keyboardWillShow' : 'keyboardDidShow', () =>
        setShown(true),
      ),
      Keyboard.addListener(isIos ? 'keyboardWillHide' : 'keyboardDidHide', () =>
        setShown(false),
      ),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);
  return shown;
}

export const MainTabBar: FunctionComponent<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // const { newRequests } = useSelector(state => state.requests)
  const insets = useSafeAreaInsets();
  const keyboardShown = useKeyboardShown();
  const renderIcon = (route: string) => {
    switch (route) {
      case 'home':
        return <SimpleLineIcons size={scaled(25)} name="menu" color="white" />;
      case 'menuStack':
        return <Entypo size={scaled(25)} name="home" color="white" />;
      case 'search':
        return <MaterialIcons size={scaled(25)} name="search" color="white" />;
      case 'employee':
        return <IonIcon size={scaled(25)} color="white" name="grid" />;
      default:
        return null;
    }
  };
  if (keyboardShown) {
    return null;
  }
  return (
    <View style={{zIndex: 0}}>
      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          paddingVertical: scaled(10),
          elevation: 10,
          backgroundColor: colors.main,
          paddingBottom:
            Platform.OS === 'ios' ? insets.bottom : insets.bottom + 10,
        }}>
        {state.routes.map((route: any, index: any) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const navTarget =
              route.name == 'home'
                ? 'menuStack'
                : route.name == 'menuStack'
                ? 'home'
                : route.name;

            // home/menuStack swap their icons vs. their underlying tab, so the
            // press has to be announced on the route it actually opens, not on
            // this button's own slot (`route.key`). Each nested native-stack
            // listens for `tabPress` on its own tab route and pops itself back
            // to its first screen when it's already focused — re-tapping the
            // current tab therefore resets it without us dispatching anything.
            // Switching in from another tab preserves whatever screen was left
            // open there (the stack sees itself as unfocused and stays put).
            const targetRoute = state.routes.find(
              (r: any) => r.name === navTarget,
            );

            const event = navigation.emit({
              type: 'tabPress',
              target: targetRoute?.key ?? route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              return;
            }

            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            //
            // Cast because `navTarget` is computed at runtime: home and
            // menuStack deliberately swap which tab their button opens, so the
            // destination is not a literal TypeScript can match against the
            // navigator's route names. The values it can hold are exactly the
            // names in `state.routes`.
            navigation.navigate({name: navTarget, merge: true} as never);
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          if (route.name == 'newAdvertising') {
            return (
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                accessibilityRole="button"
                accessibilityState={{selected: isFocused}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                key={index}>
                <View
                  style={{
                    width: CREATE_BUTTON_SIZE,
                    height: CREATE_BUTTON_SIZE,
                    borderRadius: scaled(40),
                    marginTop: -CREATE_BUTTON_LIFT,
                    backgroundColor: colors.main,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Entypo
                    name="plus"
                    color="white"
                    size={scaled(40)}
                    style={{marginTop: scaled(-8)}}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={{
                paddingHorizontal: scaled(20),
                alignItems: 'center',
                flex: 1,
              }}
              accessibilityRole="button"
              accessibilityState={{selected: isFocused}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              key={index}>
              <View style={{}}>{renderIcon(route.name)}</View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// const styles = StyleSheet.create({
//   indicator: {
//     position: 'absolute',
//     top: -20,
//     width: 55,
//     height: 4,
//     borderBottomEndRadius: 5,
//     borderBottomStartRadius: 5,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   triangle: {
//     width: 0,
//     height: 0,
//     backgroundColor: 'transparent',
//     borderStyle: 'solid',
//     borderLeftWidth: 8,
//     borderRightWidth: 8,
//     borderTopWidth: 10,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderTopColor: 'white',
//     marginTop: 8,
//     // borderRadius:2
//   },
// });
