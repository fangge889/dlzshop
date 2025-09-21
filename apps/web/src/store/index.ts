import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// 导入 reducers
import authReducer from './slices/authSlice';
import contentReducer from './slices/contentSlice';
import mediaReducer from './slices/mediaSlice';
import uiReducer from './slices/uiSlice';

// 导入 API
import { api } from './api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    media: mediaReducer,
    ui: uiReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// 启用 refetchOnFocus/refetchOnReconnect 行为
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;