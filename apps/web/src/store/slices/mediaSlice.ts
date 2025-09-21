import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

interface MediaState {
  files: MediaFile[];
  selectedFiles: MediaFile[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: MediaState = {
  files: [],
  selectedFiles: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<MediaFile[]>) => {
      state.files = action.payload;
    },
    addFile: (state, action: PayloadAction<MediaFile>) => {
      state.files.unshift(action.payload);
    },
    removeFile: (state, action: PayloadAction<number>) => {
      state.files = state.files.filter(file => file.id !== action.payload);
    },
    selectFile: (state, action: PayloadAction<MediaFile>) => {
      const exists = state.selectedFiles.find(file => file.id === action.payload.id);
      if (!exists) {
        state.selectedFiles.push(action.payload);
      }
    },
    unselectFile: (state, action: PayloadAction<number>) => {
      state.selectedFiles = state.selectedFiles.filter(file => file.id !== action.payload);
    },
    clearSelection: (state) => {
      state.selectedFiles = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
  },
});

export const {
  setFiles,
  addFile,
  removeFile,
  selectFile,
  unselectFile,
  clearSelection,
  setLoading,
  setError,
  setUploadProgress,
} = mediaSlice.actions;

export default mediaSlice.reducer;