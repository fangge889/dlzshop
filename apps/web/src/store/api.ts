import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Page', 'Media', 'Category', 'Tag', 'Setting'],
  endpoints: () => ({}),
});