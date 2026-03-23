import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../api/authApi';

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ code, redirectUri }) => {
    const result = await authApi.googleLogin(code, redirectUri);
    localStorage.setItem('auth_token', result.token);
    notifyFlutterAuth(result.token);
    return result;
  }
);

export const naverLogin = createAsyncThunk(
  'auth/naverLogin',
  async ({ code, state, redirectUri }) => {
    const result = await authApi.naverLogin(code, state, redirectUri);
    localStorage.setItem('auth_token', result.token);
    notifyFlutterAuth(result.token);
    return result;
  }
);

export const kakaoLogin = createAsyncThunk(
  'auth/kakaoLogin',
  async ({ code, redirectUri }) => {
    const result = await authApi.kakaoLogin(code, redirectUri);
    localStorage.setItem('auth_token', result.token);
    notifyFlutterAuth(result.token);
    return result;
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.fetchMe();
    } catch (e) {
      localStorage.removeItem('auth_token');
      return rejectWithValue(e.message);
    }
  }
);

function notifyFlutterAuth(token) {
  try {
    window.RecipeAuth?.postMessage(token);
  } catch (e) { /* not in Flutter WebView */ }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('auth_token'),
    loading: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('auth_token');
    },
  },
  extraReducers: (builder) => {
    [googleLogin, naverLogin, kakaoLogin].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.loading = true; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
        })
        .addCase(thunk.rejected, (state) => { state.loading = false; });
    });
    builder
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(fetchMe.rejected, (state) => { state.user = null; state.token = null; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
