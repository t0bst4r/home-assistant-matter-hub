export enum VacuumState {
  cleaning = "cleaning",
  docked = "docked",
  returning = "returning",
  error = "error",
  idle = "idle",
  paused = "paused",
}

export enum VacuumDeviceFeature {
  /**
   * @deprecated
   */
  TURN_ON = 1,
  /**
   * @deprecated
   */
  TURN_OFF = 2,
  PAUSE = 4,
  STOP = 8,
  RETURN_HOME = 16,
  FAN_SPEED = 32,
  BATTERY = 64,
  /**
   * @deprecated
   */
  STATUS = 128,
  SEND_COMMAND = 256,
  LOCATE = 512,
  CLEAN_SPOT = 1024,
  MAP = 2048,
  STATE = 4096,
  START = 8192,
}

export enum VacuumFanSpeed {
  off = "off",
  low = "low",
  medium = "medium",
  high = "high",
  turbo = "turbo",
  auto = "auto",
  max = "max",
}

export interface VacuumDeviceAttributes {
  supported_features?: number;
  battery_level?: number | string | null | undefined;
  fan_speed?: VacuumFanSpeed | string | null | undefined;
  fan_speed_list?: string[];
  status?: string | null | undefined;
}
