export interface RvcCleanModeState {
  currentMode: number;
  supportedModes: { label: string; mode: number }[];
}

export interface RvcCleanModeStateProps {
  state: RvcCleanModeState;
}

export const RvcCleanModeState = (props: RvcCleanModeStateProps) => {
  const { currentMode, supportedModes } = props.state;
  const currentModeItem = supportedModes.find(
    (mode) => mode.mode === currentMode,
  );
  return <>{currentModeItem?.label ?? `Current Clean Mode: ${currentMode}`}</>;
};
