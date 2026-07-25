import axiosInstance from './axios-config';

// Cheap poll target for CategoriesSyncBridge — categories/subcategories
// rarely change, so the app caches the full tree locally and only refetches
// it when this counter (bumped server-side on every category create/update/
// delete or admin reseed) has moved since the last cached value.
export const getCategoriesVersion = (): Promise<number> => {
  return axiosInstance.get('/categories/version').then(res => res.data.version);
};
