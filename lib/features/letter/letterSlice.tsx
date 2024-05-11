// lib/features/breadcrumb/letterSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LetterStates {
  firstLetter: string;
  selectWord: string;
  filterWords: string[] | null[];
  win: string;
  result: object;
  matrix: string[][];
  solves: string[][] | number[][];
  row: number;
  keyset: {
    correct: string[];
    wrong: string[];
    none: string[];
  };
}

const initialState: LetterStates = {
  firstLetter: "",
  filterWords: [],
  selectWord: "",
  win: "",
  result: {},
  row: 0,
  keyset: {
    correct: [],
    wrong: [],
    none: [],
  },
  matrix: [
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ],
  solves: [
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ],
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
    matrixHandler: (state, { payload }) => {
      const { index, status } = payload;
      //* status 1 as correct
      //* status 2 as wrong
      //* status 3 as none
      state.matrix[index] = status;
    },
    solvesHandler: (state, { payload }) => {
      const { index, word } = payload;
      state.solves[index] = word.join("");
    },
  },
});

export const {
  setFirstLetter,
  setFilterWords,
  setSelectWord,
  winHandler,
  setResult,
  matrixHandler,
} = letterSlice.actions;

export default letterSlice.reducer;
