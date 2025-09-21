import { api } from '../store/api';

export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  createdAt: string;
  uploader?: {
    id: number;
    username: string;
  };
}

export interface MediaListResponse {
  files: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UploadResponse {
  files: MediaFile[];
  message: string;
}

export const mediaAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    // 获取媒体文件列表
    getMediaFiles: builder.query<MediaListResponse, {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
    }>({
      query: ({ page = 1, limit = 20, search, type }) => ({
        url: '/media',
        params: { page, limit, search, type },
      }),
      providesTags: ['Media'],
    }),

    // 获取单个媒体文件
    getMediaFile: builder.query<MediaFile, number>({
      query: (id) => `/media/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Media', id }],
    }),

    // 上传媒体文件
    uploadMediaFiles: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/media/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media'],
    }),

    // 上传图片
    uploadImages: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/media/upload-images',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media'],
    }),

    // 更新媒体文件信息
    updateMediaFile: builder.mutation<MediaFile, {
      id: number;
      altText?: string;
      caption?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/media/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Media', id },
        'Media',
      ],
    }),

    // 删除媒体文件
    deleteMediaFile: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Media'],
    }),

    // 批量删除媒体文件
    deleteMediaFiles: builder.mutation<{ message: string }, number[]>({
      query: (ids) => ({
        url: '/media',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Media'],
    }),

    // 调整图片大小
    resizeImage: builder.mutation<MediaFile, {
      id: number;
      width: number;
      height: number;
      quality?: number;
    }>({
      query: ({ id, ...data }) => ({
        url: `/media/${id}/resize`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Media'],
    }),
  }),
});

export const {
  useGetMediaFilesQuery,
  useGetMediaFileQuery,
  useUploadMediaFilesMutation,
  useUploadImagesMutation,
  useUpdateMediaFileMutation,
  useDeleteMediaFileMutation,
  useDeleteMediaFilesMutation,
  useResizeImageMutation,
} = mediaAPI;