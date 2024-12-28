export enum CoverDeviceState {
  closed = "closed",
  open = "open",
  closing = "closing",
  opening = "opening",
}
export interface CoverDeviceAttributes {
  current_position?: number;
  current_tilt_position?: number;
  supported_features?: number;
}

export const CoverSupportedFeatures = {
  support_open: 1,
  support_close: 2,
  support_set_position: 4,
  support_stop: 8,
  support_open_tilt: 16,
  support_close_tilt: 32,
  support_stop_tilt: 64,
  support_set_tilt_position: 128,
};
