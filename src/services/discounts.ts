import axiosInstance from './axios-config';
import {getAds, mapAdvertisement} from './ads';

interface NearbyQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
  cityId?: string;
  parentCategoryId?: string;
  categoryIds?: string[] | string;
  page?: number;
  limit?: number;
}

// Nearby discounts feed: reuses the shared getAds pipeline (same mapping and
// pagination shape) but with the geo params the backend turns into a
// distance-ranked, radius-filtered result. Each returned ad carries a
// `distanceKm` field for display.
export const getNearbyDiscounts = (query: NearbyQuery) => {
  const {categoryIds, ...rest} = query;
  return getAds({
    ...rest,
    // The backend accepts a comma-separated list for categoryIds.
    ...(categoryIds
      ? {
          categoryIds: Array.isArray(categoryIds)
            ? categoryIds.join(',')
            : categoryIds,
        }
      : {}),
  });
};

// Submits (or updates) the current user's moon rating (1..5) for an ad and
// returns the ad with refreshed ratingAvg/ratingCount/myRating.
export const rateAd = (id: string, value: number) =>
  axiosInstance
    .post(`/advertisements/${id}/rating`, {value})
    .then(res => ({data: mapAdvertisement(res.data)}));

export interface DiscountAlerts {
  categoryIds: string[];
  categories: Array<{id: string; name: string; color?: string | null}>;
}

export const getDiscountAlerts = (): Promise<DiscountAlerts> =>
  axiosInstance.get('/discount-alerts').then(res => res.data);

export const setDiscountAlerts = (
  categoryIds: string[],
): Promise<DiscountAlerts> =>
  axiosInstance.put('/discount-alerts', {categoryIds}).then(res => res.data);
