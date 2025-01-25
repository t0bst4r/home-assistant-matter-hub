import { configureStore } from "@reduxjs/toolkit";
import { bridgesReducer } from "./bridges/bridges-reducer.ts";
import { deviceReducer } from "./devices/device-reducer.ts";

export const store = configureStore({
  reducer: {
    bridges: bridgesReducer,
    devices: deviceReducer,
  },
});
