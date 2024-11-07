import { createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import type { store } from "./store.ts";

export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;

export const createAppThunk = createAsyncThunk.withTypes<{
  state: AppState;
  dispatch: AppDispatch;
}>();

export const createAppSelector = createSelector.withTypes<AppState>();
