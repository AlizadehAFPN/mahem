import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../stateManager';
import {removeUser} from '../stateManager/reducers/user';
import {checkUser} from '../services';
import {SplashScreen} from '../screens/splash/splash-screen';
import {useSplashImageUrl} from '../hooks/use-splash';
import {Dashboard} from './tabNavigator';
import {
  authRoutes,
  profileSetupRoutes,
  onboardingRoutes,
  appRoutes,
} from './otherNavigator';
import {flushPendingTarget} from './navigation-ref';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="register"
      screenOptions={{headerShown: false}}>
      {authRoutes.map(item => (
        <Stack.Screen
          component={item.component}
          name={item.name}
          key={item.name}
        />
      ))}
    </Stack.Navigator>
  );
}

function ProfileSetupStack() {
  return (
    <Stack.Navigator
      initialRouteName="completeProfile"
      screenOptions={{headerShown: false}}>
      {profileSetupRoutes.map(item => (
        <Stack.Screen
          component={item.component}
          name={item.name}
          key={item.name}
        />
      ))}
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="citySelection"
      screenOptions={{headerShown: false}}>
      {onboardingRoutes.map(item => (
        <Stack.Screen
          component={item.component}
          name={item.name}
          key={item.name}
        />
      ))}
    </Stack.Navigator>
  );
}

function AppStack() {
  // The routes a push notification or deep link can target live only in this
  // stack, so a target that arrived while the user was still signing in, or
  // while checkUser() was in flight, becomes servable exactly here. Runs after
  // the navigator below has mounted, which is what flushPendingTarget's
  // routeNames check needs to see.
  useEffect(() => {
    flushPendingTarget();
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="dashboard"
      screenOptions={{headerShown: false}}>
      <Stack.Screen component={Dashboard} name="dashboard" />
      {appRoutes.map(item => (
        <Stack.Screen
          component={item.component}
          name={item.name}
          key={item.name}
        />
      ))}
    </Stack.Navigator>
  );
}

function CheckingSessionSplash() {
  // Read from the persisted per-city cache rather than fetched here. This
  // renders while checkUser() is in flight — a few hundred milliseconds — and
  // a request issued at this point could not possibly return, let alone
  // download its image, before the splash was gone. SplashSyncBridge does
  // that work ahead of time so the right image is available synchronously;
  // an unknown city falls back to the bundled default.
  const imageUrl = useSplashImageUrl();
  return <SplashScreen imageUrl={imageUrl} />;
}

// Branches on redux `user` state instead of the old splash screen's
// setTimeout(2000) + imperative navigate. Four-way, because authentication and
// having a usable account are not the same thing: sendActivationCode sets
// `token` for anyone who verifies a code, including a number that has never
// been seen before, so the stages after it fill in what the account still
// lacks. This is also what makes one mobile-number entry point enough for both
// signing in and signing up — an existing, complete account simply falls
// through every stage straight to AppStack.
export function RootNavigator() {
  const user = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();
  const [isCheckingSession, setIsCheckingSession] = useState(!!user.token);

  useEffect(() => {
    if (!user.token) {
      return;
    }
    // The stored access/refresh tokens may have expired since the app was
    // last opened — confirm the session is still valid before landing on
    // the app (axios-config already retries once via the refresh token).
    // checkUser also re-syncs the profile the stages below branch on.
    checkUser()
      .catch(() => dispatch(removeUser()))
      .finally(() => setIsCheckingSession(false));
    // Only run once, right after mount/rehydration — not on every token change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isCheckingSession) {
    return <CheckingSessionSplash />;
  }
  if (!user.token) {
    return <AuthStack />;
  }
  if (!user.username) {
    return <ProfileSetupStack />;
  }
  if (!user.cityId) {
    return <OnboardingStack />;
  }
  // Keying on cityId forces a full remount of the entire app stack (and
  // every screen's queries/local state along with it) when the user
  // switches city from the header dropdown, instead of leaving stale data
  // from the previous city lying around until something happens to
  // refetch it.
  return <AppStack key={user.cityId} />;
}
