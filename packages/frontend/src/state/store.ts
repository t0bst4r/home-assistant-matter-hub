import { configureStore } from "@reduxjs/toolkit";
import { bridgesReducer } from "./bridges/bridges-reducer.ts";

export const store = configureStore({
  reducer: {
    bridges: bridgesReducer,
  },
});
