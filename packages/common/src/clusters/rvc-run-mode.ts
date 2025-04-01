export interface RvcRunModeClusterState {
  supportedModes: { label: string; mode: number; modeTags: unknown }[];
  currentMode: number;
}
