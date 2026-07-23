import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CreateAdsCategoryScreen} from './create-ads-category-screen';
import {CreateAdsSubcategoryScreen} from './create-ads-subcategory-screen';
import {CreateAdsDetailsScreen} from './create-ads-details-screen';
import {CreateAdsPaymentScreen} from './create-ads-payment-screen';
import {CreateAdsFinalScreen} from './create-ads-final-screen';

// Matches Figma's per-step frames ("ثبت آگهی - 0" onward): a real
// multi-screen wizard instead of one dense scrolling screen. Entry point is
// always createAdsCategory (see main-tabBar.tsx's `unmountOnBlur` on this
// tab, which remounts the stack fresh every time) except for the "ثبت
// تخفیف" shortcut from MyStoreScreen, which jumps straight to
// createAdsDetails with presetMainCategory/storeId params.
const Stack = createNativeStackNavigator();
export function CreateAdsStack() {
  return (
    <Stack.Navigator
      initialRouteName="createAdsCategory"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="createAdsCategory" component={CreateAdsCategoryScreen} />
      <Stack.Screen name="createAdsSubcategory" component={CreateAdsSubcategoryScreen} />
      <Stack.Screen name="createAdsDetails" component={CreateAdsDetailsScreen} />
      <Stack.Screen name="createAdsPayment" component={CreateAdsPaymentScreen} />
      <Stack.Screen name="createAdsFinal" component={CreateAdsFinalScreen} />
    </Stack.Navigator>
  );
}
