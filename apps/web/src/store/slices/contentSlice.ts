import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Page {
  id: number;
  pageId: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
  };
}

interface ContentState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: ContentState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// 异步 thunks
export const fetchPages = createAsyncThunk(
  'content/fetchPages',
  async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    // 这里应该调用实际的 API
    // const response = await pageAPI.getPages(params);
    // return response.data;
    
    // 模拟数据
    return {
      pages: [
        {
          id: 1,
          pageId: 'home',
          title: '首页',
          slug: 'home',
          status: 'PUBLISHED' as const,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          author: { id: 1, username: 'admin' },
        },
      ],
      pagination: { page: 1, limit: 10, total: 1 },
    };
  }
);

export const fetchPage = createAsyncThunk(
  'content/fetchPage',
  async (id: string) => {
    // 这里应该调用实际的 API
    // const response = await pageAPI.getPage(id);
    // return response.data;
    
    // 模拟数据
    return {
      id: 1,
      pageId: 'home',
      title: '首页',
      slug: 'home',
      content: '<h1>欢迎来到 DLZ Shop CMS</h1>',
      status: 'PUBLISHED' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      author: { id: 1, username: 'admin' },
    };
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<Page | null>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePageInList: (state, action: PayloadAction<Page>) => {
      const index = state.pages.findIndex(page => page.id === action.payload.id);
      if (index !== -1) {
        state.pages[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取页面列表
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload.pages;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取页面列表失败';
      })
      
      // 获取单个页面
      .addCase(fetchPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload;
      })
      .addCase(fetchPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取页面失败';
      });
  },
});

export const { setCurrentPage, clearError, updatePageInList } = contentSlice.actions;
export default contentSlice.reducer;