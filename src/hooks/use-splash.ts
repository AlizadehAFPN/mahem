import {useSelector} from 'react-redux';
import {RootState} from '../stateManager';
import {useBrowseCity} from './use-browse-city';

// Which city's splash image to show. Shares resolveConcreteCityId with the
// home banners rather than repeating the rule: both are content uploaded per
// city with no province-wide edition, so both follow the header dropdown
// while it points at a real city and fall back to the account's own city for
// «کل استان».
//
// `undefined` means we have no city yet (fresh install, mid-onboarding),
// which resolves to the bundled default image.
export function useSplashCityId(): string | undefined {
  return useBrowseCity().concreteCityId;
}

// The splash image URL for the current splash city, read straight out of the
// persisted cache — synchronous on purpose, with no loading state and no
// network access. A launch has no time to wait for a request (see
// reducers/splash.ts), so this returns what SplashSyncBridge stored on an
// earlier launch, with the file already warm in the image cache.
//
// `undefined` means "show the bundled default": no city selected yet, or a
// city the admin has configured no splash for.
export function useSplashImageUrl(): string | undefined {
  const cityId = useSplashCityId();
  const byCity = useSelector((s: RootState) => s.splash.byCity);

  return cityId ? byCity[cityId] : undefined;
}
