// https://www.home-assistant.io/integrations/binary_sensor/
export enum BinarySensorDeviceClass {
  Battery = "battery",
  BatteryCharging = "battery_charging",
  CarbonMonoxide = "carbon_monoxide",
  Cold = "cold",
  Connectivity = "connectivity",
  Door = "door",
  GarageDoor = "garage_door",
  Gas = "gas",
  Heat = "heat",
  Light = "light",
  Lock = "lock",
  Moisture = "moisture",
  Motion = "motion",
  Moving = "moving",
  Occupancy = "occupancy",
  Opening = "opening",
  Plug = "plug",
  Power = "power",
  Presence = "presence",
  Problem = "problem",
  Running = "running",
  Safety = "safety",
  Smoke = "smoke",
  Sound = "sound",
  Tamper = "tamper",
  Update = "update",
  Vibration = "vibration",
  Window = "window",
}

export interface BinarySensorDeviceAttributes {
  device_class?: BinarySensorDeviceClass;
}
