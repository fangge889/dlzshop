import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, RefreshTokenResponse } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 创建 axios 实例
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authAPI.post('/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authAPI(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  // 用户登录
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    authAPI.post('/login', credentials),

  // 用户注册
  register: (userData: RegisterData): Promise<AuthResponse> =>
    authAPI.post('/register', userData),

  // 刷新令牌
  refreshToken: (refreshToken: string): Promise<RefreshTokenResponse> =>
    authAPI.post('/refresh', { refreshToken }),

  // 用户登出
  logout: (): Promise<void> =>
    authAPI.post('/logout'),

  // 忘记密码
  forgotPassword: (email: string): Promise<{ status: string; message: string }> =>
    authAPI.post('/forgot-password', { email }),

  // 重置密码
  resetPassword: (token: string, password: string): Promise<{ status: string; message: string }> =>
    authAPI.post('/reset-password', { token, password }),
};