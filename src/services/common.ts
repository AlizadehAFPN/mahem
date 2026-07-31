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

// Every city's splash image in one call, reduced to the cityId → url map the
// app stores. Fetched whole rather than per city because the image has to be
// cached *before* the user switches to that city — see reducers/splash.ts.
// Cities with no splash configured are simply absent from the result.
export const getSplashScreens = (): Promise<Record<string, string>> => {
  return axiosInstance.get('/splash-screens').then(res => {
    const rows: Array<{cityId?: string; imageUrl?: string}> = Array.isArray(
      res.data,
    )
      ? res.data
      : [];
    return rows.reduce<Record<string, string>>((map, row) => {
      if (row.cityId && row.imageUrl) {
        map[row.cityId] = row.imageUrl;
      }
      return map;
    }, {});
  });
};

// Cheap poll target for SplashSyncBridge — the splash set changes only when
// an admin edits it, so the app caches it locally and only refetches when
// this counter (bumped server-side on every splash create/replace/delete)
// has moved. Same scheme as getCitiesVersion.
export const getSplashScreensVersion = (): Promise<number> => {
  return axiosInstance.get('/splash-screens/version').then(res =>
    // Older backends have no counter; treating that as version 0 makes the
    // bridge fall through to a normal fetch rather than trusting the cache.
    typeof res.data?.version === 'number' ? res.data.version : 0,
  );
};
