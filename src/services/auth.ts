import axiosInstance from './axios-config';
import store from '../stateManager';
import {setUser} from '../stateManager/reducers/user';

// Sends/mocks an OTP code to `data.mobile`. Note: `data.username` (collected
// on the register screen) has no home here — the new backend only takes a
// mobile number at this step; username is set later via updateUser/PATCH
// /users/me. The register screen's caller never reads this resolved value.
export const register = (data: {mobile: string; username?: string}) => {
  return axiosInstance
    .post('/auth/otp/request', {mobile: data.mobile})
    .then(res => res.data);
};

// Verifies the OTP code, then fetches the user's profile so the resolved
// value is a flat object matching `userState` — callers do
// `dispatch(setUser(data.data))` directly with this shape.
export const sendActivationCode = async (data: {
  mobile: string;
  activation_code: string;
}) => {
  const {data: tokens} = await axiosInstance.post('/auth/otp/verify', {
    mobile: data.mobile,
    code: data.activation_code,
  });

  // Dispatch the tokens immediately so the request interceptor can
  // authenticate the /users/me call below.
  store.dispatch(
    setUser({token: tokens.accessToken, refreshToken: tokens.refreshToken}),
  );

  const {data: user} = await axiosInstance.get('/users/me');

  return {
    data: {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      id: user.id,
      mobile: user.mobile,
      username: user.username,
      avatar: user.avatar,
      sex: user.sex,
      cityId: user.cityId,
    },
  };
};

// Not called anywhere currently (see audit), but kept correct for future use.
export const checkUser = () => {
  return axiosInstance.get('/users/me').then(res => ({data: res.data}));
};

// Revokes the refresh token server-side so it can't be used again (e.g. by
// a stolen device) after the user explicitly signs out.
export const logout = () => {
  const {refreshToken} = store.getState().user;
  if (!refreshToken) {
    return Promise.resolve();
  }
  return axiosInstance.post('/auth/logout', {refreshToken});
};

// Accepts the old field names (`city_id`, numeric `sex`) since every current
// call site builds its payload that way; maps them onto the new PATCH
// /users/me contract.
export const updateUser = (data: {
  city_id?: string;
  sex?: 0 | 1;
  username?: string;
  avatar?: string;
}) => {
  const payload: Record<string, unknown> = {};
  if (data.city_id !== undefined) {
    payload.cityId = data.city_id;
  }
  if (data.sex !== undefined) {
    payload.sex = data.sex === 1 ? 'MALE' : 'FEMALE';
  }
  if (data.username !== undefined) {
    payload.username = data.username;
  }
  if (data.avatar !== undefined) {
    payload.avatar = data.avatar;
  }

  return axiosInstance
    .patch('/users/me', payload)
    .then(res => ({data: res.data}));
};
