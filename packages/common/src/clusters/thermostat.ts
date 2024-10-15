export enum ThermostatSystemMode {
  Off = 0,
  Auto = 1,
  Cool = 3,
  Heat = 4,
  EmergencyHeat = 5,
  Precooling = 6,
  FanOnly = 7,
  Dry = 8,
  Sleep = 9,
}

export interface ThermostatClusterState {
  localTemperature?: number;
  systemMode?: ThermostatSystemMode;
}
