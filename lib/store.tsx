import { configureStore } from "@reduxjs/toolkit";
import letterSlice from "./features/letter/letterSlice";

const store = configureStore({
  reducer: {
    letter: letterSlice,
  },
});

export default store;
