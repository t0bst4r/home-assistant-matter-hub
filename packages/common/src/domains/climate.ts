export enum ClimateHvacMode {
  heat = "heat",
  cool = "cool",
  heat_cool = "heat_cool",
  off = "off",
  auto = "auto",
}

export interface ClimateDeviceAttributes {
  hvac_modes: ClimateHvacMode[];
  min_temp?: number | string | null | undefined;
  max_temp?: number | string | null | undefined;
  current_temperature?: number | string | null | undefined;
  temperature?: number | string | null | undefined;
}
