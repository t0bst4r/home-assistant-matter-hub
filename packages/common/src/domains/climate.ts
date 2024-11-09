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

export interface ClimateDeviceAttributes {
  hvac_action: ClimateHvacAction | undefined;
  hvac_mode: ClimateHvacMode | undefined;
  hvac_modes: ClimateHvacMode[];
  min_temp?: number | string | null | undefined;
  max_temp?: number | string | null | undefined;
  current_temperature?: number | string | null | undefined;
  current_humidity?: number | string | null | undefined;
  temperature?: number | string | null | undefined;
}
