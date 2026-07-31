import axios, {AxiosInstance, AxiosResponseTransformer} from 'axios';
import store from '../stateManager';
import {removeUser, setUser} from '../stateManager/reducers/user';

// The API origin: the server's raw IP, over plain HTTP.
//
// NOT a hostname. Any DNS name that isn't a registered Iranian domain is a
// liability here — a wildcard-DNS service (sslip.io/nip.io and friends) is
// filtered in Iran, and when the name stops resolving the app doesn't degrade,
// it dies completely: no listings, no login, no images. The IP itself is
// reachable, so the IP is what the app uses.
//
// That means no TLS, which is a real cost: the access token, the OTP
// verification call and every chat message travel in the clear, and App Store
// review asks about the ATS exception this requires. The fix is a real domain
// (a `.ir` one is not filtered), not another free DNS host. When one exists,
// change this line and the backend's APP_URL — which is what gets baked into
// stored image URLs, so those rows need migrating with it.
export const domainName = 'http://2.28.2.151:3000';

const defaultTransforms = ([] as AxiosResponseTransformer[]).concat(
  axios.defaults.transformResponse as AxiosResponseTransformer[],
);

const baseURL = `${domainName}/api`;

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  transformResponse: defaultTransforms,
  // Generous enough for a photo upload over a slow mobile connection, but
  // bounded — without this, a stalled request (bad file uri, dropped
  // connection, etc.) hangs forever with no error and no way to recover
  // short of restarting the app (e.g. create-ads-screen.tsx's upload
  // mutation never calls onError, so its uploadingCount guard never clears).
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use constants for headers
const HEADER_AUTHORIZATION = 'Authorization';

axiosInstance.interceptors.request.use(
  config => {
    const {token, cityId} = store.getState().user;

    // A token passed explicitly on the request wins over the stored one —
    // sendActivationCode authenticates that way while finishing registration,
    // precisely because its fresh token isn't in the store yet (writing it
    // there would unmount the screen mid-flow).
    if (token && !config.headers[HEADER_AUTHORIZATION]) {
      config.headers[HEADER_AUTHORIZATION] = `Bearer ${token}`;
      config.headers.cityId = cityId;
    }

    return config;
  },
  error => Promise.reject(error),
);

// 401 handling: refresh the access token once and retry, queuing any other
// requests that fail concurrently behind that single refresh call instead of
// each firing its own. If the refresh token itself is gone/invalid, log out
// (clearing `token` flips RootNavigator back to AuthStack reactively).
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function resolvePendingRequests(token: string | null) {
  pendingRequests.forEach(callback => callback(token));
  pendingRequests = [];
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint =
      typeof originalRequest?.url === 'string' &&
      (originalRequest.url.includes('/auth/refresh') ||
        originalRequest.url.includes('/auth/otp/'));

    if (status !== 401 || isAuthEndpoint || originalRequest?._retry) {
      // error.toString() alone collapses to just "Request failed with
      // status code 400" — the actual class-validator messages explaining
      // *which* field failed live in response.data, so log that too or
      // every 4xx becomes a guessing game.
      console.error(
        'Axios response error:',
        status,
        originalRequest?.url,
        error.response?.data ?? error.message,
      );
      return Promise.reject(error);
    }

    const {refreshToken} = store.getState().user;
    if (!refreshToken) {
      store.dispatch(removeUser());
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push(newToken => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers[HEADER_AUTHORIZATION] = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      // Plain axios, not axiosInstance: this call must not carry the
      // (expired) access token or re-enter this same interceptor.
      const {data} = await axios.post(
        `${baseURL}/auth/refresh`,
        {refreshToken},
        {timeout: 30000},
      );
      store.dispatch(
        setUser({token: data.accessToken, refreshToken: data.refreshToken}),
      );
      resolvePendingRequests(data.accessToken);
      originalRequest.headers[
        HEADER_AUTHORIZATION
      ] = `Bearer ${data.accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(null);
      store.dispatch(removeUser());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
