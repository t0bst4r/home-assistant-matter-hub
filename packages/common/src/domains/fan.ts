export enum FanDeviceDirection {
  FORWARD = "forward",
  REVERSE = "reverse",
}

export enum FanDeviceFeature {
  SET_SPEED = 1,
  OSCILLATE = 2,
  DIRECTION = 4,
  PRESET_MODE = 8,
  TURN_OFF = 16,
  TURN_ON = 32,
}

export interface FanDeviceAttributes {
  current_direction?: FanDeviceDirection;
  is_on?: boolean;
  oscillating?: boolean;
  percentage?: number;
  percentage_step?: number;
  preset_mode?: "Auto" | string;
  preset_modes?: string[];
  speed_count?: number;
  supported_features?: number;
}
