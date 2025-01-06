export enum VacuumFeatures {
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

export interface VacuumDeviceAttributes {
  fan_speed?: string;
  fan_speed_list?: string[];
}

export enum VacuumDeviceState {
  Cleaning = "cleaning",
  Docked = "docked",
  Idle = "idle",
  Paused = "paused",
  Returning = "returning",
  Error = "error",
}
