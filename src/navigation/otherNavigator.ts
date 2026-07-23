import {
  ChatScreen,
  CitySelectionScreen,
  CodeInput,
  CreateJobHelperScreen,
  CreateJobScreen,
  FilterScreen,
  RegisterScreen,
  SingleJobCategoryScreen,
  SingleJobScreen,
  SinlgeProduct,
  UserPanelScreen,
  NotifScreen,
} from '../screens';
import {EditAdScreen} from '../screens/others/edit-ad/edit-ad-screen';
import {EditProfile} from '../screens/others/editProfile/editProfile-screen';
import {Settings} from '../screens/others/settings/settings-screen';
import {AdViewStatsScreen} from '../screens/others/ad-view-stats/ad-view-stats-screen';
import {NoInternetScreen} from '../screens/others/no-internet/no-internet-screen';
import {NotifDetailScreen} from '../screens/others/notif/notif-detail-screen';
import {
  DiscountMapScreen,
  NearbyDiscountsScreen,
  DiscountAlertCategoriesScreen,
  StoreTermsScreen,
  CreateStoreScreen,
  MyStoreScreen,
  StoreProfileScreen,
} from '../screens/menu/offer-detection';

// Not authenticated yet.
export const authRoutes = [
  {
    name: 'register',
    component: RegisterScreen,
  },
  {
    name: 'codeInput',
    component: CodeInput,
  },
];

// Authenticated, but hasn't finished profile setup (no city yet).
export const onboardingRoutes = [
  {
    name: 'citySelection',
    component: CitySelectionScreen,
  },
];

// Authenticated + onboarded — everything reachable from inside the app.
export const appRoutes = [
  {
    name: 'singleProduct',
    component: SinlgeProduct,
  },
  {
    name: 'singleJobCategory',
    component: SingleJobCategoryScreen,
  },
  {
    name: 'singleJob',
    component: SingleJobScreen,
  },
  {
    name: 'createJob',
    component: CreateJobScreen,
  },
  {
    name: 'createJobHelper',
    component: CreateJobHelperScreen,
  },
  {
    name: 'userpanel',
    component: UserPanelScreen,
  },
  {
    name: 'chat',
    component: ChatScreen,
  },
  {
    name: 'filter',
    component: FilterScreen,
  },
  {
    name: 'notif',
    component: NotifScreen,
  },
  {
    name: 'settings',
    component: Settings,
  },
  {
    name: 'editProfile',
    component: EditProfile,
  },
  {
    name: 'editAd',
    component: EditAdScreen,
  },
  {
    name: 'adViewStats',
    component: AdViewStatsScreen,
  },
  {
    name: 'noInternet',
    component: NoInternetScreen,
  },
  {
    name: 'notifDetail',
    component: NotifDetailScreen,
  },
  {
    name: 'nearbyDiscounts',
    component: NearbyDiscountsScreen,
  },
  {
    name: 'discountMap',
    component: DiscountMapScreen,
  },
  {
    name: 'discountAlertCategories',
    component: DiscountAlertCategoriesScreen,
  },
  {
    name: 'storeTerms',
    component: StoreTermsScreen,
  },
  {
    name: 'createStore',
    component: CreateStoreScreen,
  },
  {
    name: 'myStore',
    component: MyStoreScreen,
  },
  {
    name: 'storeProfile',
    component: StoreProfileScreen,
  },
];
