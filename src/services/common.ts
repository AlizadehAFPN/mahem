import axiosInstance from './axios-config';

// New backend returns { url } for an upload; callers read `.id` (as an image
// reference) and `.path` (for preview), so the URL stands in for both.
export const upload = (data: FormData) => {
  return axiosInstance
    .post('/uploads', data, {headers: {'content-type': 'multipart/form-data'}})
    .then(res => ({data: {id: res.data.url, path: res.data.url}}));
};

export const getCities = () => {
  return axiosInstance.get('/cities').then(res => ({
    data: res.data.map((city: any) => ({
      id: city.id,
      title: city.name,
      lat: city.lat,
      lng: city.lng,
    })),
  }));
};

// Cheap poll target for CitiesSyncBridge — the city list rarely changes, so
// the app caches it locally and only refetches when this counter (bumped
// server-side on every city create/update/delete or admin reseed) has moved.
export const getCitiesVersion = (): Promise<number> => {
  return axiosInstance.get('/cities/version').then(res => res.data.version);
};

// Banners are strictly scoped per city server-side (400s without a cityId),
// so a city's banner can never leak into another city's feed.
export const getBanner = (cityId?: string) => {
  return axiosInstance.get('/banners', {params: {cityId}}).then(res => ({
    data: res.data.map((banner: any) => ({
      imageDetail: {path: banner.imageUrl},
      link: banner.link,
    })),
  }));
};

// Returns `{data: null}` when the city has no splash configured — caller
// falls back to the bundled default image.
export const getSplashScreen = (cityId?: string) => {
  return axiosInstance
    .get('/splash-screens', {params: {cityId}})
    .then(res => ({data: res.data}));
};
