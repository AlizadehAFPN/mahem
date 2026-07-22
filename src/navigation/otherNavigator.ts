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
];
