export enum ClimateHvacMode {
  off = "off",
  heat = "heat",
  cool = "cool",
  heat_cool = "heat_cool",
  auto = "auto",
  dry = "dry",
  fan_only = "fan_only",
}

export enum ClimateHvacAction {
  off = "off",
  preheating = "preheating",
  heating = "heating",
  cooling = "cooling",
  drying = "drying",
  fan = "fan",
  idle = "idle",
  defrosting = "defrosting",
}

export enum ClimateDeviceFeature {
  TARGET_TEMPERATURE = 1,
  TARGET_TEMPERATURE_RANGE = 2,
  TARGET_HUMIDITY = 4,
  FAN_MODE = 8,
  PRESET_MODE = 16,
  SWING_MODE = 32,
  AUX_HEAT = 64,
  TURN_OFF = 128,
  TURN_ON = 256,
  SWING_HORIZONTAL_MODE = 512,
}

export interface ClimateDeviceAttributes {
  hvac_action: ClimateHvacAction | undefined;
  /**
   * @deprecated use entity.state instead
   */
  hvac_mode?: ClimateHvacMode | undefined;
  hvac_modes: ClimateHvacMode[];
  min_temp?: number | string | null | undefined;
  max_temp?: number | string | null | undefined;
  current_temperature?: number | string | null | undefined;
  current_humidity?: number | string | null | undefined;
  temperature?: number | string | null | undefined;
  target_temperature?: number | string | null | undefined;
  target_temp_low?: number | string | null | undefined;
  target_temp_high?: number | string | null | undefined;
  supported_features?: number;
}
