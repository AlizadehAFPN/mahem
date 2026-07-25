import {useEffect} from 'react';
import {useQueryClient} from 'react-query';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../stateManager';
import {setCategoriesCache} from '../../stateManager/reducers/categories';
import {
  ADS_CATEGORIES_QUERY_KEY,
  JOB_CATEGORIES_QUERY_KEY,
} from '../../hooks/use-cached-categories';
import {
  getAdsCategories,
  getCategoriesVersion,
  getJobsCategories,
} from '../../services';

// Renders nothing. Categories/subcategories rarely change on the backend, so
// rather than refetching them on every app launch/foreground (react-query's
// default — see App.tsx's focusManager bridge), this:
//   1. primes react-query's cache from the last persisted copy (redux-persist,
//      see stateManager/reducers/categories.ts) so every screen renders
//      instantly with no network wait, even offline;
//   2. checks the backend's cheap /categories/version counter, and only
//      refetches+re-persists the full tree if it has moved since last time.
export function CategoriesSyncBridge() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cached = useSelector((s: RootState) => s.categories);

  useEffect(() => {
    if (cached.adsCategories) {
      queryClient.setQueryData(ADS_CATEGORIES_QUERY_KEY, {
        data: cached.adsCategories,
      });
    }
    if (cached.jobCategories) {
      queryClient.setQueryData(JOB_CATEGORIES_QUERY_KEY, {
        data: cached.jobCategories,
      });
    }

    (async () => {
      try {
        const remoteVersion = await getCategoriesVersion();
        const upToDate =
          cached.version === remoteVersion &&
          cached.adsCategories &&
          cached.jobCategories;
        if (upToDate) {
          return;
        }

        const [adsRes, jobRes] = await Promise.all([
          getAdsCategories(),
          getJobsCategories(),
        ]);
        queryClient.setQueryData(ADS_CATEGORIES_QUERY_KEY, adsRes);
        queryClient.setQueryData(JOB_CATEGORIES_QUERY_KEY, jobRes);
        dispatch(
          setCategoriesCache({
            version: remoteVersion,
            adsCategories: adsRes.data,
            jobCategories: jobRes.data,
          }),
        );
      } catch {
        // Offline/unreachable — keep serving whatever was already
        // cached/persisted; each screen's own useAdsCategories()/
        // useJobCategories() call will retry independently.
      }
    })();
    // Runs once per app launch, not on every re-render — redux-persist has
    // already rehydrated `cached` by the time this bridge mounts (it's
    // rendered inside PersistGate, see App.tsx).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
