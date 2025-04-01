export enum RvcOperationalState {
  Stopped = 0,
  Running = 1,
  Paused = 2,
  Error = 3,
  SeekingCharger = 64,
  Charging = 65,
  Docked = 66,
}

export interface RvcOperationalStateClusterState {
  operationalState: RvcOperationalState;
}
