export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'SUBSCRIBER';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'SUBSCRIBER';
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  status: string;
  data: {
    token: string;
    refreshToken: string;
  };
}