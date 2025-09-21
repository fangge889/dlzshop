import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '@/services/authAPI';
import { User, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// 异步 thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // 保存令牌到 localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      
      // 保存令牌到 localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '注册失败');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('没有刷新令牌');
      }
      
      const response = await authAPI.refreshToken(refreshToken);
      
      // 更新令牌
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '令牌刷新失败');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authAPI.logout();
    } catch (error) {
      // 即使 API 调用失败，也要清除本地状态
      console.error('登出 API 调用失败:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // 注册
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // 刷新令牌
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      
      // 登出
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;