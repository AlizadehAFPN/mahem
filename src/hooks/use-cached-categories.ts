import {useQuery} from 'react-query';
import {getAdsCategories, getJobsCategories} from '../services';

// Shared query keys so every screen that reads the category tree hits the
// same react-query cache entry instead of each maintaining its own (several
// screens used to pass slightly different key strings — 'adsCategories' vs
// 'addsCategory' — which silently defeated caching between them).
export const ADS_CATEGORIES_QUERY_KEY = ['categories', 'GENERAL'];
export const JOB_CATEGORIES_QUERY_KEY = ['categories', 'JOB'];

// Categories/subcategories rarely change, so once fetched they're treated as
// fresh forever (`staleTime`/`cacheTime: Infinity`) instead of react-query's
// default of refetching on every mount/app-foreground. CategoriesSyncBridge
// is what actually keeps this cache honest: it primes it from the persisted
// copy on launch and refreshes it in the background only when the backend's
// /categories/version counter has moved.
export function useAdsCategories() {
  return useQuery(ADS_CATEGORIES_QUERY_KEY, getAdsCategories, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}

export function useJobCategories() {
  return useQuery(JOB_CATEGORIES_QUERY_KEY, getJobsCategories, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}
