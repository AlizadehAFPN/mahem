import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from 'react-query';
import {RootState} from '../stateManager';
import {removeUser} from '../stateManager/reducers/user';
import {checkUser, getSplashScreen} from '../services';
import {SplashScreen} from '../screens/splash/splash-screen';
import {Dashboard} from './tabNavigator';
import {authRoutes, onboardingRoutes, appRoutes} from './otherNavigator';

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

function CheckingSessionSplash({cityId}: {cityId?: string}) {
  // Fetched purely so the launch splash can reflect the user's last known
  // city while the session is validated — falls back to the bundled
  // default image (via SplashScreen's own prop default) if none is set or
  // this hasn't resolved yet.
  const {data} = useQuery(
    ['splashScreen', cityId],
    () => getSplashScreen(cityId),
    {enabled: !!cityId},
  );
  return <SplashScreen imageUrl={data?.data?.imageUrl} />;
}

// Branches on redux `user` state instead of the old splash screen's
// setTimeout(2000) + imperative navigate('register'|'dashboard'). Three-way,
// not two — code-input.tsx sets `token` before the user has picked a city,
// so a token-only check would flip straight to AppStack mid-registration.
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
    checkUser()
      .catch(() => dispatch(removeUser()))
      .finally(() => setIsCheckingSession(false));
    // Only run once, right after mount/rehydration — not on every token change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isCheckingSession) {
    return <CheckingSessionSplash cityId={user.cityId} />;
  }
  if (!user.token) {
    return <AuthStack />;
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
