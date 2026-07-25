import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CreateAdsCategoryScreen} from './create-ads-category-screen';
import {CreateAdsSubcategoryScreen} from './create-ads-subcategory-screen';
import {CreateAdsDetailsScreen} from './create-ads-details-screen';

// Matches Figma's per-step frames ("ثبت آگهی - 0" onward): a real
// multi-screen wizard instead of one dense scrolling screen. Entry point is
// always createAdsCategory (see main-tabBar.tsx's `unmountOnBlur` on this
// tab, which remounts the stack fresh every time) except for the "ثبت
// تخفیف" shortcut from MyStoreScreen, which jumps straight to
// createAdsDetails with presetMainCategory/storeId params.
//
// createAdsPayment/bankGateway/createAdsFinal are deliberately NOT part of
// this stack even though they're conceptually the wizard's last steps: this
// stack only exists nested inside the "newAdvertising" bottom tab, and
// MainTabBar renders its floating "+"/tab row as an overlay on top of
// whatever it contains — screens with a full-width bottom button (the fee
// screen's "پرداخت", the gateway's own pay button) end up with that button
// sitting underneath the tab bar, unreadable and untappable. Those three are
// registered top-level in otherNavigator's appRoutes instead (same as
// storeTerms/myStore for the store flow), so they render outside the tab
// navigator entirely and the bar isn't there to collide with anything.
const Stack = createNativeStackNavigator();
export function CreateAdsStack() {
  return (
    <Stack.Navigator
      initialRouteName="createAdsCategory"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="createAdsCategory"
        component={CreateAdsCategoryScreen}
      />
      <Stack.Screen
        name="createAdsSubcategory"
        component={CreateAdsSubcategoryScreen}
      />
      <Stack.Screen
        name="createAdsDetails"
        component={CreateAdsDetailsScreen}
      />
    </Stack.Navigator>
  );
}
