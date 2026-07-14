import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import siteReducer from './siteSlice';
import bookingReducer from './bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sites: siteReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
