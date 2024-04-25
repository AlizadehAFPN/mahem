import axios, { AxiosInstance } from 'axios';
import store  from '../stateManager';
import { Platform } from 'react-native';

const domainName = 'https://indexshope.ir';
const baseURL = `${domainName}/api`;

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  // timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use constants for headers
const HEADER_AUTHORIZATION = 'Authorization';

axiosInstance.interceptors.request.use(
  (config) => {
    const {token, cityId} = store.getState().user;
    

    if (token) {
      config.headers[HEADER_AUTHORIZATION] = `Bearer ${token}`;
      config.headers.cityId= cityId
    }

    // Only log in development environment
    if (__DEV__) {
      console.log(
        `${new Date()} api method=${config.method}, baseURL=${
          config.baseURL
        }, url=${config.url}, BODY=${
          config.data ? JSON.stringify(config.data) : ''
        } , TOKEN= ${token} params=${
          config.params ? JSON.stringify(config.params) : ''
        }`,
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally transform error for user-friendly error messages
    console.error('Axios response error:', error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
