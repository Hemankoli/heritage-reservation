import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/index';
import { setAuthToken } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
}

function loadPersistedAuth(): AuthState {
  try {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token && user) {
      setAuthToken(token);
      return { token, user: JSON.parse(user) as User };
    }
  } catch {
    // corrupted storage — start fresh
  }
  return { user: null, token: null };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadPersistedAuth,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      setAuthToken(action.payload.token);
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      setAuthToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
