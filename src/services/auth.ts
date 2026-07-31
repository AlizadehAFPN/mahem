import axiosInstance from './axios-config';
import store from '../stateManager';
import {setUser} from '../stateManager/reducers/user';
import {getCities} from './common';

// The account carries a city *id*, but the header and settings screen display
// a *name*, which lives only in local state. A fresh install signing back into
// an existing account has no local copy, so it has to be looked up — but only
// then: on an ordinary launch the id hasn't changed and the stored name is
// still correct, so this makes no request at all.
async function resolveCityName(cityId?: string | null): Promise<string> {
  if (!cityId) {
    return '';
  }
  const {cityId: knownId, city: knownName} = store.getState().user;
  if (knownId === cityId && knownName) {
    return knownName;
  }
  try {
    const {data} = await getCities();
    return data.find((c: {id: string}) => c.id === cityId)?.title ?? '';
  } catch {
    // Non-fatal: the label falls back to «انتخاب شهر» until the city list
    // loads normally inside the app.
    return '';
  }
}

// Reads GET /users/me and maps it onto the shape `userState` expects.
// `authHeader` is passed explicitly during sign-in, where the token hasn't
// reached redux yet and so can't be picked up by the request interceptor.
async function loadProfile(authHeader?: Record<string, string>) {
  const {data: user} = await axiosInstance.get(
    '/users/me',
    authHeader ? {headers: authHeader} : undefined,
  );
  return {
    id: user.id,
    mobile: user.mobile,
    username: user.username ?? '',
    avatar: user.avatar ?? undefined,
    sex: user.sex,
    cityId: user.cityId ?? '',
    city: await resolveCityName(user.cityId),
  };
}

// Sends/mocks an OTP code to `mobile`. Shared by both entry points — the
// backend keys an account on the mobile number alone (`mobile @unique`, and
// verifyOtp upserts), so the code itself is the same whether this turns out to
// be a sign-in or a sign-up. Which of the two is *allowed* is decided before
// this call, by checkAvailability.
export const requestOtp = (data: {mobile: string}) => {
  return axiosInstance
    .post('/auth/otp/request', {mobile: data.mobile})
    .then(res => res.data);
};

// Is this number/name already spoken for? Asked before an SMS goes out, so the
// sign-up screen can send someone who already has an account to the sign-in
// screen (and vice versa) instead of quietly upserting them into a second,
// half-empty one.
//
// `usernameTaken` is advisory — the column has no unique index behind it (see
// the backend's checkAvailability), so it's a helpful message rather than a
// guarantee.
export const checkAvailability = (data: {
  mobile?: string;
  username?: string;
}) => {
  return axiosInstance
    .get<{mobileTaken: boolean; usernameTaken: boolean}>('/auth/availability', {
      params: data,
    })
    .then(res => res.data);
};

export interface PickedImage {
  uri?: string;
  fileName?: string;
  type?: string;
}

// Saves the name collected on the sign-up screen onto the account that has just
// come into existence. Awaited, because `username` is what RootNavigator
// branches on — an account that still has none is routed to the complete-profile
// screen rather than into the app.
//
// It happens here rather than in a caller's onSuccess because dispatching the
// tokens swaps the whole auth stack out and unmounts whoever called — and
// react-query v3 drops a mutation's callbacks the moment its observer unmounts,
// so a save queued from a callback would silently never run. That is exactly how
// the old register screen managed to collect a username on every sign-up and
// store none of them.
//
// A failure is swallowed: the session is already valid, and loadProfile reads
// back whatever did save, so a name that didn't land just means the
// complete-profile screen asks for it again — the same safety net older accounts
// use.
async function saveSignUpName(
  username: string,
  authHeader: Record<string, string>,
) {
  try {
    await axiosInstance.patch('/users/me', {username}, {headers: authHeader});
  } catch {
    // Non-fatal by design, as above.
  }
}

// The photo, on the other hand, deliberately does not hold the sign-in up.
//
// It is the one heavy request in the flow — hundreds of KB against a few hundred
// bytes for everything else — and awaiting it left the user watching a spinner on
// the OTP screen until it finished: tens of seconds over 4G back when the picker
// handed over full-resolution files (a 2.75 MB avatar was measured in the wild).
// Nothing downstream needs the photo to be there, so it goes up after the
// session does and drops into place when it arrives.
//
// Deliberately not a react-query mutation and not owned by any screen, for the
// same unmount reason as above: a plain promise in module scope outlives the
// stack swap that dispatching the session causes.
function uploadSignUpAvatar(
  profileImage: PickedImage,
  authHeader: Record<string, string>,
) {
  const form = new FormData();
  form.append('file', {
    uri: profileImage.uri,
    name: profileImage.fileName,
    type: profileImage.type,
  } as any);

  // Not the shared upload() helper: this starts before the token has certainly
  // reached redux, so the request interceptor can't authenticate it and the
  // header is passed by hand.
  axiosInstance
    .post('/uploads', form, {
      headers: {...authHeader, 'content-type': 'multipart/form-data'},
    })
    .then(({data: uploaded}) =>
      axiosInstance
        .patch('/users/me', {avatar: uploaded.url}, {headers: authHeader})
        .then(() => store.dispatch(setUser({avatar: uploaded.url}))),
    )
    .catch(() => {
      // A photo that wouldn't upload costs the user nothing they can't redo from
      // Edit profile, and it must never cost them the sign-in.
    });
}

// Verifies the OTP code, then reads the account back so the resolved value is
// a flat object matching `userState`. Whether this was a sign-in or a sign-up
// is not a distinction the caller has to make — RootNavigator decides what
// comes next from the profile it gets here (no username → complete profile,
// no city → city selection, otherwise straight into the app).
export const sendActivationCode = async (data: {
  mobile: string;
  activation_code: string;
  // Present only when this verification is completing a sign-up: the values
  // the register screen collected before the account existed.
  username?: string;
  profileImage?: PickedImage;
}) => {
  const {data: tokens} = await axiosInstance.post('/auth/otp/verify', {
    mobile: data.mobile,
    code: data.activation_code,
  });

  // The tokens are held back from redux until the profile has been read,
  // because writing `token` is what moves RootNavigator off the auth stack —
  // doing it early would flip the navigator twice and unmount this call's
  // caller mid-flight. So the request interceptor can't authenticate the read
  // for us and the header is passed explicitly.
  const authHeader = {Authorization: `Bearer ${tokens.accessToken}`};
  if (data.username) {
    await saveSignUpName(data.username, authHeader);
  }
  const resolved = {
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    ...(await loadProfile(authHeader)),
  };

  // Dispatched here rather than from the caller's onSuccess: this resolves
  // straight into a stack swap, and react-query v3 drops a mutation's
  // callbacks the moment its observer unmounts (mutationObserver.js
  // `onUnsubscribe` → `removeObserver`), so an onSuccess would never run.
  store.dispatch(setUser(resolved));

  // Started only after the session is in redux, so the one slow request in the
  // flow can't sit between the user's last tap and the app opening.
  if (data.profileImage?.uri) {
    uploadSignUpAvatar(data.profileImage, authHeader);
  }

  return {data: resolved};
};

// Validates a restored session on launch and refreshes the local copy of the
// profile. Both matter: RootNavigator picks the onboarding stage from
// `username`/`cityId`, so those have to reflect what the server actually
// stores rather than whatever redux-persist happens to be holding — an
// account whose name or city never saved is routed back to finish the job.
export const checkUser = async () => {
  const profile = await loadProfile();
  store.dispatch(setUser(profile));
  return {data: profile};
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
