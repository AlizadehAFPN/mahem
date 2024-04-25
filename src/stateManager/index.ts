import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers,  } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import userReducer from './reducers/user'
import filterReducer from "./reducers/filters";
// ...

const rootReducer = combineReducers({
  user: userReducer,
  filter: filterReducer
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist:[]
}
const persistedReducer = persistReducer(persistConfig, rootReducer)


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
 const store = configureStore({
   reducer: persistedReducer,
   middleware: getDefaultMiddleware({
     serializableCheck: {
       ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
     },
   }),
 });

export const persistor = persistStore(store)
export default store;