import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch videos from API
export const fetchVideosAsync = createAsyncThunk("videos/fetchVideos", async () => {
  const response = await fetch("https://localhost:7256/api/Hostel/Getvideos");
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  const data = await response.json();
  return data;
});

const videoSlice = createSlice({
  name: "videos",
  initialState: {
    videos: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideosAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideosAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideosAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch videos";
      });
  },
});

export const selectVideos = (state) => state.videos.videos;
export const selectLoading = (state) => state.videos.loading;
export const selectVideoError = (state) => state.videos.error;

export default videoSlice.reducer;
