import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../types/index';
import { api } from '../api/client';

interface AuthState {
  user: User | null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}

function loadPersistedUser(): User | null {
  try {
    const raw = getCookie('auth_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout', {});
  } catch {
    // Always proceed with local logout even if server call fails
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: (): AuthState => ({ user: loadPersistedUser() }),
  reducers: {
    setCredentials(state, action: { payload: { user: User } }) {
      state.user = action.payload.user;
      setCookie('auth_user', JSON.stringify(action.payload.user), 7);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.pending, (state) => {
        state.user = null;
        deleteCookie('auth_user');
      });
  },
});

export const { setCredentials } = authSlice.actions;
export default authSlice.reducer;
