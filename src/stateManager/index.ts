import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import userReducer from './reducers/user';
import filterReducer from './reducers/filters';
import categoriesReducer from './reducers/categories';
import attributeOptionsReducer from './reducers/attribute-options';
import citiesReducer from './reducers/cities';
// ...

const rootReducer = combineReducers({
  user: userReducer,
  filter: filterReducer,
  categories: categoriesReducer,
  attributeOptions: attributeOptionsReducer,
  cities: citiesReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Only auth/profile state and the rarely-changing reference data cached
  // by the *SyncBridge components (categories, attribute options, cities —
  // see reducers/categories.ts, reducers/attribute-options.ts,
  // reducers/cities.ts) survive an app restart. Search filters are
  // ephemeral UI state and shouldn't outlive the session they were set in.
  whitelist: ['user', 'categories', 'attributeOptions', 'cities'],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export const persistor = persistStore(store);
export default store;
