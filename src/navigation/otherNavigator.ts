import {
  AllJobsScreen,
  ChatScreen,
  CitySelectionScreen,
  CodeInput,
  CompleteProfileScreen,
  CreateJobHelperScreen,
  CreateJobScreen,
  FilterScreen,
  LoginScreen,
  RegisterScreen,
  SingleJobCategoryScreen,
  SingleJobScreen,
  SinlgeProduct,
  UserPanelScreen,
  NotifScreen,
} from '../screens';
import {PrivacyScreen} from '../screens/menu/other';
import {EditAdScreen} from '../screens/others/edit-ad/edit-ad-screen';
import {EditProfile} from '../screens/others/editProfile/editProfile-screen';
import {Settings} from '../screens/others/settings/settings-screen';
import {AdViewStatsScreen} from '../screens/others/ad-view-stats/ad-view-stats-screen';
import {NotifDetailScreen} from '../screens/others/notif/notif-detail-screen';
import {JobCategoryGuideScreen} from '../screens/others/single-job-category/job-category-guide-screen';
import {BankGatewayScreen} from '../screens/payment/bank-gateway-screen';
import {CreateAdsPaymentScreen} from '../screens/create-ads/create-ads-payment-screen';
import {CreateAdsFinalScreen} from '../screens/create-ads/create-ads-final-screen';
import {
  DiscountMapScreen,
  NearbyDiscountsScreen,
  DiscountAlertCategoriesScreen,
  StoreTermsScreen,
  CreateStoreScreen,
  MyStoreScreen,
  StoreProfileScreen,
} from '../screens/menu/offer-detection';

// Not authenticated yet. Sign-up comes first (it's the stack's initial route —
// see RootNavigator) and sign-in is reached from its "already registered?"
// link; both meet at the same OTP screen. The backend still keys accounts on
// the mobile number alone, so what actually separates the two paths is the
// availability check on the sign-up screen.
export const authRoutes = [
  {
    name: 'register',
    component: RegisterScreen,
  },
  {
    name: 'login',
    component: LoginScreen,
  },
  {
    name: 'codeInput',
    component: CodeInput,
  },
  // The rules are linked from the login screen, and each stack below is its
  // own navigator — a route registered on AppStack isn't reachable from here,
  // so the screen is listed again in every stack that links to it.
  {
    name: 'privacy',
    component: PrivacyScreen,
  },
];

// Authenticated, but the account has no display name yet — a brand new
// sign-up, or an older account whose name never saved.
export const profileSetupRoutes = [
  {
    name: 'completeProfile',
    component: CompleteProfileScreen,
  },
  // Linked from the "I accept the rules" tick, which has to be readable
  // before it can be ticked.
  {
    name: 'privacy',
    component: PrivacyScreen,
  },
];

// Authenticated and named, but hasn't picked a city yet.
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
    name: 'allJobs',
    component: AllJobsScreen,
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
    name: 'notifDetail',
    component: NotifDetailScreen,
  },
  {
    name: 'jobCategoryGuide',
    component: JobCategoryGuideScreen,
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
  {
    name: 'bankGateway',
    component: BankGatewayScreen,
  },
  {
    name: 'createAdsPayment',
    component: CreateAdsPaymentScreen,
  },
  {
    name: 'createAdsFinal',
    component: CreateAdsFinalScreen,
  },
  {
    name: 'privacy',
    component: PrivacyScreen,
  },
];
