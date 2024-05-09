// lib/features/breadcrumb/letterSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LetterStates {
  firstLetter: string;
  selectWord: string;
  filterWords: string[] | null[];
  win: string;
  result: object;
}

const initialState: LetterStates = {
  firstLetter: "",
  filterWords: [],
  selectWord: "",
  win: "",
  result: {},
};

const letterSlice = createSlice({
  name: "letter",
  initialState,
  reducers: {
    setFirstLetter: (state, action: PayloadAction<string>) => {
      state.firstLetter = action.payload;
    },
    setSelectWord: (state, action: PayloadAction<string>) => {
      state.selectWord = action.payload;
    },
    setFilterWords: (state, action: PayloadAction<string[] | null[]>) => {
      state.filterWords = action.payload;
    },
    setResult: (state, action: PayloadAction<object>) => {
      state.result = action.payload;
    },
    winHandler: (state, action: PayloadAction<string>) => {
      state.win = action.payload;
    },
  },
});

export const {
  setFirstLetter,
  setFilterWords,
  setSelectWord,
  winHandler,
  setResult,
} = letterSlice.actions;

export default letterSlice.reducer;
