import { configureStore } from "@reduxjs/toolkit";
import videoReducer from "./videoSlice";
import userSlice from "./userSlice";

export const store = configureStore({
  reducer: {
    videos: videoReducer,
     user:userSlice
  },
});
